"""
Load real project data from Clockify CSV exports.

Reads three CSVs:
- prueba_capmx.csv: task-level aggregates (user, project, task, hours, amount)
- Clockify_Time_Report_Summary_01_12_2025-28_02_2026.csv: monthly totals
- semanas-capmx.csv: weekly totals for precise time entry distribution

Creates projects, phases, sprints, time entries, health snapshots, and alerts
using real data from the CAP-MX project and three additional projects.

Safe to run multiple times (idempotent via delete + recreate).
"""

import calendar
import csv
import random
from datetime import date, datetime, timedelta
from decimal import Decimal
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.finance.models import (
    Advance,
    BillingRole,
    HealthSnapshot,
    Phase,
    Project,
    ProjectHealthAlert,
    ProjectRoleRate,
    Sprint,
    SprintTask,
    TimeEntry,
)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

CSV_TASK_FILE = "prueba_capmx.csv"
CSV_MONTHLY_FILE = "Clockify_Time_Report_Summary_01_12_2025-28_02_2026.csv"
CSV_WEEKLY_FILE = "semanas-capmx.csv"

# Raw daily-level CSVs for precise merge (date + description = merge key)
CSV_RAW_TASK_DESC = "RAW_DATA/Date-Task-Desc.csv"     # date, task, description, hours
CSV_RAW_USER_DESC = "RAW_DATA/Date-user-description.csv"  # date, user, description, hours

USER_PROFILES = {
    "Camila Veliz": {
        "email": "camila@appix.mx",
        "role": "Disenador UX/UI",
        "rate": Decimal("500.00"),
    },
    "Christian Luna": {
        "email": "christian@appix.mx",
        "role": "Project Manager",
        "rate": Decimal("500.00"),
    },
    "Natalia Río": {
        "email": "natalia@appix.mx",
        "role": "Disenador UX/UI",
        "rate": Decimal("500.00"),
    },
    "Rafael Castillo López": {
        "email": "rafael@appix.mx",
        "role": "Project Manager",
        "rate": Decimal("500.00"),
    },
}

PROJECT_DEFS = {
    "Capturando México": {
        "code": "CAP-MX",
        "client_name": "Capturando Mexico",
        "budget_hours": Decimal("48.00"),
        "client_invoice_amount": Decimal("24000.00"),
        "target_margin": Decimal("12.50"),
        "jira_project_key": "CPTRN",
        "current_health_status": "CRITICAL",
    },
    "Diseño Appix": {
        "code": "DISENO-APPIX",
        "client_name": "Appix (Interno)",
        "budget_hours": Decimal("300.00"),
        "client_invoice_amount": Decimal("0.00"),
        "target_margin": Decimal("0.00"),
        "jira_project_key": "DA",
        "current_health_status": "HEALTHY",
    },
    "Appix General": {
        "code": "APPIX-GEN",
        "client_name": "Appix (Interno)",
        "budget_hours": Decimal("50.00"),
        "client_invoice_amount": Decimal("0.00"),
        "target_margin": Decimal("0.00"),
        "jira_project_key": "",
        "current_health_status": "HEALTHY",
    },
    "La Moderna México": {
        "code": "LM-MX",
        "client_name": "La Moderna",
        "budget_hours": Decimal("20.00"),
        "client_invoice_amount": Decimal("10000.00"),
        "target_margin": Decimal("30.00"),
        "jira_project_key": "",
        "current_health_status": "HEALTHY",
    },
}

# Phase definitions for CAP-MX: 5 phases = 5 sprints (1:1 correspondence)
# (name, estimated_hours, sort_order, status, progress%)
# Budget: 48h distributed across 5 phases
CAPMX_PHASES = [
    ("Cimentacion y Prototipado", Decimal("10.00"), 1, "completed", Decimal("100.00")),
    ("Carga de Contenido y Ajustes", Decimal("10.00"), 2, "completed", Decimal("100.00")),
    ("Desarrollo de Interfaz y Secciones", Decimal("18.00"), 3, "completed", Decimal("100.00")),
    ("Responsive y Ajustes", Decimal("5.00"), 4, "completed", Decimal("100.00")),
    ("Capacitacion, Entrega y Video", Decimal("5.00"), 5, "pending", Decimal("0.00")),
]

CAPMX_PHASE_INVOICES = {
    "Cimentacion y Prototipado": (Decimal("12000.00"), date(2026, 1, 18), True),
    "Carga de Contenido y Ajustes": (Decimal("4000.00"), None, False),  # No confirmado
    "Desarrollo de Interfaz y Secciones": (Decimal("4000.00"), None, False),
    "Responsive y Ajustes": (Decimal("2500.00"), None, False),
    "Capacitacion, Entrega y Video": (Decimal("1500.00"), None, False),
}

# Phase ↔ Sprint alignment: phase name for each sprint number.
# Phase is derived from sprint assignment (not independent).
SPRINT_PHASE_NAMES = {
    1: "Cimentacion y Prototipado",
    2: "Carga de Contenido y Ajustes",
    3: "Desarrollo de Interfaz y Secciones",
    4: "Responsive y Ajustes",
    5: "Capacitacion, Entrega y Video",
}

# Task -> Sprint number mapping for CAP-MX (1-indexed)
# Used to assign sprint FK to each TimeEntry for the Jitter chart.
# Entries WITHOUT a task here use date-based assignment (_get_sprint_num_for_date).
TASK_SPRINT_MAP = {
    "CAP-8": 1,               # S1: Cimentacion y Prototipado (Tickets 1-8)
    "Ajustes de amelia": 2,   # S2: Carga de Contenido y Ajustes
    "Subir tour a Amelia": 2, # S2: Carga de Contenido y Ajustes
    "CAP-17": 2,              # S2: Reuniones de seguimiento
    "CAP-9": 3,               # S3: Desarrollo de Interfaz (Tickets 9-13)
    "RESPONSIVE": 4,          # S4: Responsive y Ajustes
}
# "(Without task)" → date-based: before Jan 19 = S1, Jan 19-Feb 1 = S3, etc.

# Sprint date ranges for entries without a task in TASK_SPRINT_MAP.
# Falls through to S1 for anything before Jan 19.
SPRINT_DATE_RANGES = [
    (4, date(2026, 2, 2), date(2026, 2, 8)),     # S4: Responsive y Ajustes
    (2, date(2026, 2, 9), date(2026, 2, 28)),     # S2: Carga de Contenido (late work)
    (3, date(2026, 1, 19), date(2026, 2, 1)),     # S3: Interfaz y Secciones
    # Default: everything before Jan 19 → S1
]


class Command(BaseCommand):
    help = "Load real project data from Clockify CSV exports"

    def add_arguments(self, parser):
        parser.add_argument(
            "--csv-dir",
            default="",
            help="Directory containing CSVs (default: DA-Rentabilidad/ in project root)",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Parse and validate without writing to DB",
        )

    def handle(self, *args, **options):
        self.csv_dir = self._resolve_csv_dir(options["csv_dir"])
        dry_run = options["dry_run"]

        # 1. Parse CSVs (aggregated for non-CAP-MX projects)
        task_data = self._parse_task_csv(self.csv_dir / CSV_TASK_FILE)
        monthly_data = self._parse_monthly_csv(self.csv_dir / CSV_MONTHLY_FILE)

        # 2. Parse raw daily CSVs for CAP-MX (the source of truth)
        raw_merged = self._parse_and_merge_raw_csvs()

        if dry_run:
            self._print_summary(task_data, monthly_data)
            self._print_raw_summary(raw_merged)
            return

        with transaction.atomic():
            # 3. Billing roles
            roles = self._ensure_billing_roles()

            # 4. Delete old CAP-MX (fake seed data)
            self._delete_old_capmx()

            # 5. Create all 4 projects
            projects = self._create_projects()

            # 6. Full CAP-MX setup (uses raw merged data)
            self._setup_capmx(projects["CAP-MX"], roles, raw_merged)

            # 7. Other projects: basic time entries
            for proj_name, monthly_rows in monthly_data.items():
                proj_def = PROJECT_DEFS.get(proj_name)
                if not proj_def or proj_def["code"] == "CAP-MX":
                    continue
                code = proj_def["code"]
                if code in projects:
                    self._setup_basic_project(projects[code], roles, monthly_rows)

        self.stdout.write(self.style.SUCCESS("\nDatos reales cargados exitosamente."))
        self.stdout.write(
            self.style.WARNING(
                "NOTA: No ejecutar 'seed_design_projects' despues de este "
                "comando, ya que recrearia el CAP-MX ficticio."
            )
        )

    # ------------------------------------------------------------------
    # CSV resolution
    # ------------------------------------------------------------------

    def _resolve_csv_dir(self, custom_dir: str) -> Path:
        """Resolve the CSV directory path."""
        if custom_dir:
            p = Path(custom_dir)
            if p.is_dir():
                return p
            raise CommandError(f"CSV directory not found: {custom_dir}")

        # Default: check Docker mount first, then project root
        from django.conf import settings

        project_root = Path(settings.BASE_DIR).parent
        candidates = [
            Path("/data/csv"),  # Docker mount
            project_root / "DA-Rentabilidad",
            Path(settings.BASE_DIR) / "DA-Rentabilidad",
        ]
        for p in candidates:
            if p.is_dir():
                return p
        raise CommandError(
            f"No se encontro DA-Rentabilidad/. Intentados: {candidates}. "
            "Usa --csv-dir para especificar la ruta."
        )

    # ------------------------------------------------------------------
    # CSV Parsing
    # ------------------------------------------------------------------

    def _parse_task_csv(self, path: Path) -> dict:
        """Parse task-level CSV. Returns {project_name: [{user, task, hours, amount}]}."""
        if not path.exists():
            raise CommandError(f"CSV no encontrado: {path}")

        result = {}
        with open(path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                proj = row["Project"].strip()
                entry = {
                    "user": row["User"].strip(),
                    "task": row["Task"].strip(),
                    "hours": Decimal(row["Time (decimal)"].strip()),
                    "amount": Decimal(row["Amount (MXN)"].strip()),
                }
                result.setdefault(proj, []).append(entry)

        self.stdout.write(f"  CSV tareas: {sum(len(v) for v in result.values())} filas de {len(result)} proyectos")
        return result

    def _parse_monthly_csv(self, path: Path) -> dict:
        """Parse monthly CSV. Returns {project_name: [{user, year, month, hours, amount}]}."""
        if not path.exists():
            raise CommandError(f"CSV no encontrado: {path}")

        result = {}
        with open(path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                proj = row["Project"].strip()
                year, month = self._parse_month(row["Month"].strip())
                entry = {
                    "user": row["User"].strip(),
                    "year": year,
                    "month": month,
                    "hours": Decimal(row["Time (decimal)"].strip()),
                    "amount": Decimal(row["Amount (MXN)"].strip()),
                }
                result.setdefault(proj, []).append(entry)

        self.stdout.write(f"  CSV mensual: {sum(len(v) for v in result.values())} filas de {len(result)} proyectos")
        return result

    # ------------------------------------------------------------------
    # Raw CSV Parsing & Merge (CAP-MX daily records)
    # ------------------------------------------------------------------

    def _parse_and_merge_raw_csvs(self) -> list:
        """Parse both raw CSVs and merge on (date, description).

        Date-Task-Desc.csv provides: date, task, description, hours, amount
        Date-user-description.csv provides: date, user, description, hours, amount

        Merge key: (date_str, description) → complete record with all fields.
        The user CSV is the primary source (one row per person per entry).
        The task CSV enriches each row with the Clockify task name.
        """
        task_path = self.csv_dir / CSV_RAW_TASK_DESC
        user_path = self.csv_dir / CSV_RAW_USER_DESC

        if not task_path.exists():
            raise CommandError(f"Raw CSV no encontrado: {task_path}")
        if not user_path.exists():
            raise CommandError(f"Raw CSV no encontrado: {user_path}")

        # 1. Build task lookup: (date_str, description) -> task_name
        task_lookup = {}
        with open(task_path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                date_str = row["Date"].strip()
                desc = row["Description"].strip()
                task = row["Task"].strip()
                task_lookup[(date_str, desc)] = task

        # 2. Parse user CSV (primary) and enrich with task
        merged = []
        with open(user_path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                date_str = row["Date"].strip()
                user = row["User"].strip()
                desc = row["Description"].strip()
                hours = Decimal(row["Time (decimal)"].strip())
                amount = Decimal(row["Amount (MXN)"].strip())
                d = datetime.strptime(date_str, "%d/%m/%Y").date()
                task = task_lookup.get((date_str, desc), "(Without task)")

                merged.append({
                    "date": d,
                    "date_str": date_str,
                    "user": user,
                    "task": task,
                    "description": desc,
                    "hours": hours,
                    "amount": amount,
                })

        self.stdout.write(
            f"  Raw merge: {len(merged)} registros diarios, "
            f"{len(set(r['user'] for r in merged))} usuarios, "
            f"{sum(r['hours'] for r in merged):.2f}h total"
        )
        return merged

    def _print_raw_summary(self, raw_merged):
        """Print summary of raw merged data for dry run."""
        self.stdout.write(self.style.SUCCESS("\n=== RAW DATA Merge ===\n"))
        by_user = {}
        for r in raw_merged:
            by_user.setdefault(r["user"], []).append(r)

        for user, rows in sorted(by_user.items()):
            total_h = sum(r["hours"] for r in rows)
            total_a = sum(r["amount"] for r in rows)
            self.stdout.write(f"  {user}: {len(rows)} registros, {total_h:.2f}h, ${total_a:,.2f}")
            for r in rows:
                self.stdout.write(
                    f"    {r['date']} | {r['task']:25s} | {r['description'][:40]:40s} | {r['hours']}h"
                )

    @staticmethod
    def _get_sprint_num_for_date(d):
        """Get sprint number based on date for entries without a mapped task."""
        for sprint_num, start, end in SPRINT_DATE_RANGES:
            if start <= d <= end:
                return sprint_num
        return 1  # Default: S1 (Cimentacion) for anything before Jan 19

    @staticmethod
    def _parse_month(raw: str) -> tuple:
        """Parse month strings like 'Dec 2025', 'Jan 2026', 'feb-26'."""
        raw = raw.strip()
        for fmt in ("%b %Y", "%b-%y"):
            try:
                dt = datetime.strptime(raw, fmt)
                return (dt.year, dt.month)
            except ValueError:
                continue
        raise ValueError(f"No se pudo parsear el mes: {raw}")

    # ------------------------------------------------------------------
    # Dry run summary
    # ------------------------------------------------------------------

    def _print_summary(self, task_data, monthly_data):
        self.stdout.write(self.style.SUCCESS("\n=== DRY RUN - Resumen ===\n"))

        for proj_name, rows in task_data.items():
            total_h = sum(r["hours"] for r in rows)
            total_a = sum(r["amount"] for r in rows)
            self.stdout.write(f"  {proj_name}: {len(rows)} tareas, {total_h}h, ${total_a:,.2f} MXN")
            for r in rows:
                self.stdout.write(f"    - {r['user']} / {r['task']}: {r['hours']}h (${r['amount']:,.2f})")

        self.stdout.write("")
        for proj_name, rows in monthly_data.items():
            self.stdout.write(f"  {proj_name} (mensual):")
            for r in rows:
                self.stdout.write(f"    - {r['user']} / {r['year']}-{r['month']:02d}: {r['hours']}h (${r['amount']:,.2f})")

        self.stdout.write(self.style.WARNING("\nNingun dato fue escrito a la DB (dry run)."))

    # ------------------------------------------------------------------
    # Billing Roles
    # ------------------------------------------------------------------

    def _ensure_billing_roles(self) -> dict:
        """Create/get billing roles. Returns {role_name: BillingRole}."""
        roles_data = [
            ("Disenador UX/UI", Decimal("500.00")),
            ("Project Manager", Decimal("500.00")),
        ]
        roles = {}
        for name, rate in roles_data:
            role, created = BillingRole.objects.get_or_create(
                role_name=name,
                defaults={"default_hourly_rate": rate},
            )
            roles[name] = role
            status = "Creado" if created else "Existe"
            self.stdout.write(f"  BillingRole '{name}': {status}")
        return roles

    # ------------------------------------------------------------------
    # Delete old data
    # ------------------------------------------------------------------

    def _delete_old_capmx(self):
        """Delete fake CAP-MX project if it exists."""
        deleted = Project.objects.filter(code="CAP-MX").delete()
        count = deleted[0]
        if count:
            self.stdout.write(self.style.WARNING(f"  CAP-MX ficticio eliminado ({count} objetos en cascada)"))
        else:
            self.stdout.write("  CAP-MX no existia previamente")

    # ------------------------------------------------------------------
    # Create Projects
    # ------------------------------------------------------------------

    def _create_projects(self) -> dict:
        """Create all 4 projects. Returns {code: Project}."""
        projects = {}
        for proj_name, defn in PROJECT_DEFS.items():
            code = defn["code"]
            proj, created = Project.objects.get_or_create(
                code=code,
                defaults={
                    "name": proj_name,
                    "client_name": defn["client_name"],
                    "budget_hours": defn["budget_hours"],
                    "client_invoice_amount": defn["client_invoice_amount"],
                    "target_margin": defn["target_margin"],
                    "jira_project_key": defn.get("jira_project_key", ""),
                    "current_health_status": defn["current_health_status"],
                },
            )
            projects[code] = proj
            status = "Creado" if created else "Existe"
            self.stdout.write(f"  Proyecto '{proj_name}' ({code}): {status}")

        return projects

    # ------------------------------------------------------------------
    # CAP-MX Full Setup
    # ------------------------------------------------------------------

    def _setup_capmx(self, project, roles, raw_merged):
        """Full setup for CAP-MX: phases, sprints, time entries, health."""
        phase_objs = self._create_capmx_phases(project)
        self._create_capmx_role_rates(project, roles)
        sprint_objs = self._create_capmx_sprints(project)
        self._create_capmx_time_entries(project, roles, phase_objs, sprint_objs, raw_merged)
        self._create_capmx_health(project)
        self.stdout.write(self.style.SUCCESS("  CAP-MX: setup completo"))

    def _create_capmx_phases(self, project) -> dict:
        """Create 5 phases for CAP-MX. Returns {name: Phase}."""
        phase_objs = {}
        for name, est_hours, order, status, progress in CAPMX_PHASES:
            invoice_amount, invoice_date, is_paid = CAPMX_PHASE_INVOICES[name]
            ph = Phase.objects.create(
                project=project,
                name=name,
                estimated_hours=est_hours,
                sort_order=order,
                status=status,
                progress_percent=progress,
                invoice_amount=invoice_amount,
                invoice_date=invoice_date,
                is_paid=is_paid,
            )
            phase_objs[name] = ph
            self.stdout.write(f"    Fase '{name}': {est_hours}h est., factura ${invoice_amount}")

        return phase_objs

    def _create_capmx_role_rates(self, project, roles):
        """Create project-specific role rates for CAP-MX."""
        for role_name, rate in [
            ("Disenador UX/UI", Decimal("500.00")),
            ("Project Manager", Decimal("500.00")),
        ]:
            if role_name in roles:
                ProjectRoleRate.objects.create(
                    project=project,
                    billing_role=roles[role_name],
                    hourly_rate=rate,
                )

    def _create_capmx_sprints(self, project):
        """Create 5 sprints for CAP-MX with tasks, advances, and anomaly flags.

        5-sprint structure (narrativa refinada):
        S1: Cimentacion y Estructura Base (Cap 1-7, kick-off, hosting, recursos)
        S2: Diseno y Desarrollo Visual (Cap 8-9 post-aprobacion S1)
        S3: Logica, Inventario y Contenido (Subir tours + Ajustes Amelia)
        S4: Optimizacion y Ajustes Tecnicos (Responsive)
        S5: Cierre, Capacitacion y Entrega (no ejecutado)

        Anomalias detectadas:
        - Sprint 1 sin registros Clockify (Cap 1-7 = vacio administrativo)
        - CAP-17 / CPTRN-17 sin nomenclatura confirmada (0.99h)
        - Gestion PM asignada a sprints pero sin tarea formal Clockify
        """
        # Sprint 1: Cimentacion y Prototipado (Tickets 1-8)
        s1 = Sprint.objects.create(
            project=project,
            name="Sprint 1 - Cimentacion y Prototipado",
            description="Kick-off, inventarios, configuracion tecnica y prototipado. Tickets 1-8.",
            status="completed",
            start_date=date(2025, 12, 1),
            end_date=date(2026, 1, 18),
            sort_order=1,
        )
        SprintTask.objects.bulk_create([
            SprintTask(
                sprint=s1,
                jira_key="CPTRN-KICK",
                title="Kick-off, hosting, recursos y planeacion (Cap 1-7)",
                assigned_to="Christian Luna",
                hours=Decimal("5.00"),
                date=date(2025, 12, 9),
            ),
            SprintTask(
                sprint=s1,
                jira_key="CPTRN-8",
                title="Estructura Web y Prototipado (Capitulo 8)",
                assigned_to="Camila Veliz",
                hours=Decimal("39.49"),
                date=date(2026, 1, 10),
            ),
            SprintTask(
                sprint=s1,
                jira_key="CPTRN-GESTION-S1",
                title="Gestion y coordinacion (PM)",
                assigned_to="Christian Luna",
                hours=Decimal("7.00"),
                date=date(2026, 1, 8),
            ),
        ])
        Advance.objects.bulk_create([
            Advance(
                sprint=s1,
                task_jira_key="CPTRN-KICK",
                description="Kick-off completado. Recursos del cliente recibidos, "
                "hosting configurado, estructura base del proyecto definida.",
                status="accepted",
                presented_by="Christian Luna",
            ),
            Advance(
                sprint=s1,
                task_jira_key="CPTRN-8",
                description="Estructura web completada y prototipo aprobado por el cliente.",
                status="accepted",
                presented_by="Camila Veliz",
            ),
        ])

        # Sprint 2: Carga de Contenido y Ajustes
        s2 = Sprint.objects.create(
            project=project,
            name="Sprint 2 - Carga de Contenido y Ajustes",
            description="Carga de catalogos, productos, tours y ajustes funcionales.",
            status="completed",
            start_date=date(2025, 12, 15),
            end_date=date(2026, 2, 15),
            sort_order=2,
        )
        SprintTask.objects.bulk_create([
            SprintTask(
                sprint=s2,
                jira_key="CPTRN-AJUSTES",
                title="Ajustes tecnicos plataforma Amelia",
                assigned_to="Camila Veliz",
                hours=Decimal("3.87"),
                date=date(2026, 2, 12),  # Actual work date from raw CSV
            ),
            SprintTask(
                sprint=s2,
                jira_key="CPTRN-TOUR",
                title="Carga de tours a plataforma Amelia",
                assigned_to="Camila Veliz",
                hours=Decimal("24.98"),
                date=date(2026, 2, 10),
            ),
            SprintTask(
                sprint=s2,
                jira_key="CPTRN-17",
                title="Reuniones de seguimiento",
                assigned_to="Rafael Castillo López",
                hours=Decimal("2.49"),  # Rafael 1.50h + Camila 0.99h from raw CSV
                date=date(2025, 12, 17),  # First entry date from raw CSV
            ),
            SprintTask(
                sprint=s2,
                jira_key="CPTRN-MISC",
                title="Tareas menores y coordinacion",
                assigned_to="Camila Veliz",
                hours=Decimal("0.40"),
                date=date(2026, 2, 12),
            ),
        ])
        Advance.objects.bulk_create([
            Advance(
                sprint=s2,
                task_jira_key="CPTRN-AJUSTES",
                description="Ajustes tecnicos en plataforma Amelia completados.",
                status="accepted",
                presented_by="Camila Veliz",
            ),
            Advance(
                sprint=s2,
                task_jira_key="CPTRN-TOUR",
                description="Tours cargados exitosamente en plataforma Amelia.",
                status="accepted",
                presented_by="Camila Veliz",
            ),
            Advance(
                sprint=s2,
                task_jira_key="CPTRN-17",
                description="Reuniones de seguimiento y revision de avances con el cliente.",
                status="accepted",
                presented_by="Rafael Castillo López",
            ),
        ])

        # Sprint 3: Desarrollo de Interfaz y Secciones (Tickets 9-13)
        s3 = Sprint.objects.create(
            project=project,
            name="Sprint 3 - Desarrollo de Interfaz y Secciones",
            description="Diseno visual del Home y secciones del sitio. Tickets 9-13.",
            status="completed",
            start_date=date(2026, 1, 19),
            end_date=date(2026, 2, 1),
            sort_order=3,
        )
        SprintTask.objects.create(
            sprint=s3,
            jira_key="CPTRN-9",
            title="Diseno Home (Capitulo 9)",
            assigned_to="Camila Veliz",
            hours=Decimal("5.36"),
            date=date(2025, 12, 15),  # Actual work date from raw CSV
        )
        Advance.objects.create(
            sprint=s3,
            task_jira_key="CPTRN-9",
            description="Diseno de Home completado y aprobado por el cliente.",
            status="accepted",
            presented_by="Camila Veliz",
        )

        # Sprint 4: Responsive y Ajustes
        s4 = Sprint.objects.create(
            project=project,
            name="Sprint 4 - Responsive y Ajustes",
            description="Adaptacion responsive del sitio y ajustes finales.",
            status="completed",
            start_date=date(2026, 2, 2),
            end_date=date(2026, 2, 8),
            sort_order=4,
        )
        SprintTask.objects.create(
            sprint=s4,
            jira_key="CPTRN-RESP",
            title="Optimizacion Responsive",
            assigned_to="Camila Veliz",
            hours=Decimal("8.16"),
            date=date(2026, 2, 5),
        )
        Advance.objects.create(
            sprint=s4,
            task_jira_key="CPTRN-RESP",
            description="Adaptacion responsive completada y validada.",
            status="accepted",
            presented_by="Camila Veliz",
        )

        # Sprint 5: Capacitacion, Entrega y Edicion de Video
        Sprint.objects.create(
            project=project,
            name="Sprint 5 - Capacitacion, Entrega y Video",
            description="Capacitacion al cliente, entrega formal del proyecto y edicion de video.",
            status="planned",
            start_date=date(2026, 2, 16),
            end_date=date(2026, 2, 28),
            sort_order=5,
        )

        sprint_objs = {1: s1, 2: s2, 3: s3, 4: s4}
        self.stdout.write(
            "    5 sprints creados (protocolo): "
            "S1 Cimentacion (1-8), S2 Contenido, "
            "S3 Interfaz (9-13), S4 Responsive, S5 Capacitacion (planned)"
        )
        return sprint_objs

    def _create_capmx_time_entries(self, project, roles, phase_objs, sprint_objs, raw_merged):
        """Create time entries for CAP-MX from raw merged CSV data.

        Uses the daily records from Date-Task-Desc.csv merged with
        Date-user-description.csv. Each row is one real Clockify entry
        with actual date, user, task, and description — no distribution needed.
        """
        entries = []
        skipped = 0

        for i, row in enumerate(raw_merged):
            user_name = row["user"]
            profile = USER_PROFILES.get(user_name)
            if not profile:
                self.stdout.write(self.style.WARNING(f"    Usuario desconocido: {user_name}, saltando"))
                skipped += 1
                continue

            hours = row["hours"]
            if hours <= 0:
                skipped += 1
                continue

            # Sprint: by task map if available, otherwise by date
            task_name = row["task"]
            sprint_num = TASK_SPRINT_MAP.get(task_name)
            if sprint_num is None:
                sprint_num = self._get_sprint_num_for_date(row["date"])
            sprint = sprint_objs.get(sprint_num)

            # Phase derives from sprint (1:1 alignment)
            phase_name = SPRINT_PHASE_NAMES.get(sprint_num)
            phase = phase_objs.get(phase_name) if phase_name else None

            role_name = profile["role"]
            role = roles.get(role_name)
            cost = row["amount"]  # Use actual Clockify amount (exact)

            entries.append(
                TimeEntry(
                    clockify_id=f"csv-cap-mx-raw-{i + 1:04d}",
                    project=project,
                    phase=phase,
                    sprint=sprint,
                    billing_role=role,
                    user_name=user_name,
                    user_email=profile["email"],
                    description=row["description"],
                    duration_hours=hours,
                    cost=cost,
                    date=row["date"],
                )
            )

        TimeEntry.objects.bulk_create(entries)
        total_hours = sum(e.duration_hours for e in entries)
        total_cost = sum(e.cost for e in entries)
        users = set(e.user_name for e in entries)
        self.stdout.write(
            f"    {len(entries)} time entries (raw data): "
            f"{total_hours:.2f}h, ${total_cost:,.2f} MXN, "
            f"{len(users)} colaboradores ({', '.join(sorted(users))})"
        )
        if skipped:
            self.stdout.write(self.style.WARNING(f"    {skipped} registros saltados (sin usuario o 0h)"))

    def _create_capmx_health(self, project):
        """Create health snapshot and alert for CAP-MX.

        Totals from raw merged CSV data (3 contributors):
        - Camila Veliz: 83.25h (diseño)
        - Christian Luna: 12.00h (gestion PM)
        - Rafael Castillo López: 3.00h (reuniones/coordinacion)
        - Total: 98.25h / 48h presupuestadas = 204.69%
        """
        consumed_hours = Decimal("98.25")
        budget_hours = Decimal("48.00")
        consumption_pct = (consumed_hours / budget_hours * 100).quantize(Decimal("0.01"))
        actual_cost = Decimal("49125.00")
        progress_pct = Decimal("85.00")
        earned_value = (progress_pct / 100 * Decimal("24000.00")).quantize(Decimal("0.01"))

        HealthSnapshot.objects.create(
            project=project,
            consumption_percent=consumption_pct,
            progress_percent=progress_pct,
            budget_consumed=actual_cost,
            earned_value=earned_value,
            health_status="CRITICAL",
            health_score=12,
        )

        ProjectHealthAlert.objects.create(
            project=project,
            alert_type="CRITICAL",
            message=(
                f"Proyecto sobre-presupuesto: {consumption_pct}% de horas consumidas "
                f"({consumed_hours}h de {budget_hours}h presupuestadas). "
                f"Costo real ${actual_cost:,.2f} vs presupuesto $24,000. "
                "3 colaboradores (Camila, Christian, Rafael). "
                "Focos criticos: Estructura Web (263% sobre estimado), "
                "Logica e Inventario (250% sobre estimado)."
            ),
            is_read=False,
        )

        self.stdout.write(
            f"    HealthSnapshot: {consumption_pct}% consumo, "
            f"{progress_pct}% progreso, score=12 (CRITICAL)"
        )

    # ------------------------------------------------------------------
    # Basic project setup (non-CAP-MX)
    # ------------------------------------------------------------------

    def _setup_basic_project(self, project, roles, monthly_rows):
        """Create time entries for non-CAP-MX projects from monthly data."""
        # Clean existing CSV-imported entries
        TimeEntry.objects.filter(
            clockify_id__startswith=f"csv-{project.code.lower()}"
        ).delete()

        entries = []
        counter = 0

        for row in monthly_rows:
            user_name = row["user"]
            profile = USER_PROFILES.get(user_name)
            if not profile:
                self.stdout.write(
                    self.style.WARNING(f"    Usuario desconocido: {user_name}, saltando")
                )
                continue

            year, month = row["year"], row["month"]
            total_hours = row["hours"]
            amount = row["amount"]
            biz_days = self._get_business_days(year, month)

            if not biz_days or total_hours <= 0:
                continue

            rate = (
                (amount / total_hours).quantize(Decimal("0.01"))
                if total_hours > 0 and amount > 0
                else Decimal("0.00")
            )
            role_name = profile["role"]
            role = roles.get(role_name)
            user_slug = user_name.split()[0].lower()
            daily_entries = self._distribute_hours(total_hours, biz_days)

            for d, hours in daily_entries:
                counter += 1
                cost = (hours * rate).quantize(Decimal("0.01"))
                entries.append(
                    TimeEntry(
                        clockify_id=f"csv-{project.code.lower()}-{user_slug}-{counter:04d}",
                        project=project,
                        phase=None,
                        billing_role=role,
                        user_name=user_name,
                        user_email=profile["email"],
                        description=f"Trabajo en {project.name}",
                        duration_hours=hours,
                        cost=cost,
                        date=d,
                    )
                )

        if entries:
            TimeEntry.objects.bulk_create(entries)
            total_h = sum(e.duration_hours for e in entries)
            total_c = sum(e.cost for e in entries)
            self.stdout.write(
                f"  {project.code}: {len(entries)} entries, "
                f"{total_h:.2f}h, ${total_c:,.2f} MXN"
            )
        else:
            self.stdout.write(f"  {project.code}: sin entries para crear")

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _get_business_days(year: int, month: int) -> list:
        """Return all weekday dates in a given month."""
        _, last_day = calendar.monthrange(year, month)
        return [
            date(year, month, d)
            for d in range(1, last_day + 1)
            if date(year, month, d).weekday() < 5
        ]

    @staticmethod
    def _get_business_days_range(start: date, end: date) -> list:
        """Return all weekday dates in a date range (inclusive)."""
        days = []
        current = start
        while current <= end:
            if current.weekday() < 5:
                days.append(current)
            current += timedelta(days=1)
        return days

    @staticmethod
    def _distribute_hours(total_hours: Decimal, business_days: list) -> list:
        """Distribute total hours across business days with realistic variance."""
        n = len(business_days)
        if n == 0 or total_hours <= 0:
            return []

        random.seed(42)  # Reproducible distribution
        base = float(total_hours) / n
        raw_weights = [random.uniform(0.7, 1.3) for _ in range(n)]
        weight_sum = sum(raw_weights)

        entries = []
        remaining = total_hours

        for i, day in enumerate(business_days):
            if i == n - 1:
                # Last day gets remainder to ensure exact total
                if remaining > 0:
                    entries.append((day, remaining.quantize(Decimal("0.01"))))
                break

            proportion = Decimal(str(raw_weights[i] / weight_sum))
            day_hours = (total_hours * proportion).quantize(Decimal("0.01"))
            day_hours = max(day_hours, Decimal("0.01"))
            day_hours = min(day_hours, remaining)
            if day_hours > 0:
                entries.append((day, day_hours))
                remaining -= day_hours

        return entries
