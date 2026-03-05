"""
Management command to load clean Clockify data from JSON into the database.

Reads the output of process_raw_clockify and creates:
- Project records (with is_internal flag)
- TimeEntry records (with clockify_id for idempotency)
- BillingRole if missing

Usage:
    python manage.py load_clean_data
    python manage.py load_clean_data --json-file path/to/file.json
    python manage.py load_clean_data --dry-run
"""

import json
from datetime import date
from decimal import Decimal
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.finance.models import BillingRole, Project, TimeEntry

# ── User → role mapping ───────────────────────────────────────────
USER_ROLES = {
    "Alejandro Alvarez": {"email": "alejandro@appix.mx", "role": "Desarrollador"},
    "Ana Gabriela Cedeño": {"email": "ana@appix.mx", "role": "Data Analyst"},
    "Armando Ruiz": {"email": "armando@appix.mx", "role": "Desarrollador"},
    "Camila Veliz": {"email": "camila@appix.mx", "role": "Disenador UX/UI"},
    "Christian Luna": {"email": "christian@appix.mx", "role": "Project Manager"},
    "Jose Francisco Monroy": {"email": "jose@appix.mx", "role": "Project Manager"},
    "Natalia Río": {"email": "natalia@appix.mx", "role": "Disenador UX/UI"},
    "Rafael Castillo López": {"email": "rafael@appix.mx", "role": "Project Manager"},
    "roberto.aguilar": {"email": "roberto@appix.mx", "role": "Ventas"},
    "sofia.saul": {"email": "sofia@appix.mx", "role": "Recursos Humanos"},
}

# Default rate for all roles
DEFAULT_RATE = Decimal("500.00")

# Clockify ID prefix for idempotent imports
CLOCKIFY_PREFIX = "csv-clean"


class Command(BaseCommand):
    help = "Load clean Clockify JSON data into the database."

    def add_arguments(self, parser):
        parser.add_argument(
            "--json-file",
            type=str,
            default=None,
            help="Path to the clean JSON file. Defaults to CLEAN_DATA/enero_febrero_2026.json.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Parse and print summary without writing to DB.",
        )

    def handle(self, *args, **options):
        json_path = self._resolve_json(options["json_file"])
        if not json_path.exists():
            self.stderr.write(self.style.ERROR(f"JSON not found: {json_path}"))
            return

        self.stdout.write(f"Reading: {json_path}")
        with open(json_path, encoding="utf-8") as f:
            data = json.load(f)

        projects_data = data["projects"]
        stats = data["stats"]

        self.stdout.write(
            f"  {stats['total_entries']} entries, "
            f"{stats['total_projects']} projects, "
            f"{stats['total_people']} people"
        )

        if options["dry_run"]:
            self._print_dry_run(projects_data)
            return

        with transaction.atomic():
            self._ensure_billing_roles()
            created_projects, created_entries = self._load_all(projects_data)

        self.stdout.write(self.style.SUCCESS(
            f"\nDone: {created_projects} projects, {created_entries} time entries created."
        ))

    # ── Load All Projects ──────────────────────────────────────────

    def _load_all(self, projects_data: dict) -> tuple[int, int]:
        total_projects = 0
        total_entries = 0
        role_cache = {r.role_name: r for r in BillingRole.objects.all()}

        for proj_name, proj_data in projects_data.items():
            is_internal = proj_data.get("is_internal", False)
            code = self._generate_code(proj_name)

            # Delete old entries from previous import (idempotent)
            old_count = TimeEntry.objects.filter(
                clockify_id__startswith=f"{CLOCKIFY_PREFIX}-{code.lower()}-"
            ).delete()[0]
            if old_count:
                self.stdout.write(f"  Deleted {old_count} old entries for {code}")

            # Create or update project
            internal_category = proj_data.get("internal_category", "")
            project, created = Project.objects.update_or_create(
                code=code,
                defaults={
                    "name": proj_name,
                    "client_name": "Appix" if is_internal else proj_name,
                    "budget_hours": Decimal("0.00"),
                    "client_invoice_amount": Decimal(proj_data["total_amount"]),
                    "target_margin": Decimal("0.00"),
                    "is_internal": is_internal,
                    "internal_category": internal_category,
                    "current_health_status": "HEALTHY",
                },
            )

            action = "Created" if created else "Updated"
            self.stdout.write(
                f"  {action} project: {code} ({proj_name}) "
                f"[{'INTERNAL' if is_internal else 'CLIENT'}] "
                f"- {proj_data['total_hours']}h, ${proj_data['total_amount']}"
            )
            total_projects += 1

            # Create time entries
            entries = proj_data.get("entries", [])
            entry_objs = []
            for i, entry in enumerate(entries):
                user_name = entry["user"]
                user_info = USER_ROLES.get(user_name, {})
                email = user_info.get("email", f"{user_name.lower().replace(' ', '.')}@appix.mx")
                role_name = user_info.get("role", "General")

                billing_role = role_cache.get(role_name)

                hours = Decimal(entry["hours"])
                amount = Decimal(entry["amount"])

                entry_objs.append(TimeEntry(
                    clockify_id=f"{CLOCKIFY_PREFIX}-{code.lower()}-{i:04d}",
                    project=project,
                    billing_role=billing_role,
                    user_name=user_name,
                    user_email=email,
                    description=entry.get("description", ""),
                    duration_hours=hours,
                    cost=amount,
                    date=date.fromisoformat(entry["date"]),
                ))

            if entry_objs:
                TimeEntry.objects.bulk_create(entry_objs)
                total_entries += len(entry_objs)

        return total_projects, total_entries

    # ── Billing Roles ──────────────────────────────────────────────

    def _ensure_billing_roles(self):
        roles_needed = set()
        for info in USER_ROLES.values():
            roles_needed.add(info["role"])

        for role_name in roles_needed:
            BillingRole.objects.get_or_create(
                role_name=role_name,
                defaults={"default_hourly_rate": DEFAULT_RATE},
            )

    # ── Helpers ────────────────────────────────────────────────────

    def _generate_code(self, project_name: str) -> str:
        """Generate a short code from project name."""
        # Map known projects to specific codes
        code_map = {
            "Appix TI": "APPIX-TI",
            "HR": "HR",
            "Diseño Appix": "DISENO-APPIX",
            "Appix General": "APPIX-GENERAL",
            "Appix PMO": "APPIX-PMO",
            "Dailys": "DAILYS",
            "Appix_App_Admin": "APPIX-APP-ADMIN",
            "Appix - Recursos Humanos": "APPIX-RRHH",
            "APPIX DATA": "APPIX-DATA",
            "Training": "TRAINING",
            "VENTAS": "VENTAS",
            "General diseño": "GENERAL-DISENO",
            "EENVITA": "EENVITA",
            "Station24": "STATION24",
            "Muebles Cook": "MUEBLES-COOK",
            "Capturando México": "CAP-MX",
            "Data La Moderna": "DATA-LM",
            "Colorado": "COLORADO",
            "Nespresso": "NESPRESSO",
            "CAPS": "CAPS",
            "BURO+DUPLICAR": "BURO-DUPLICAR",
            "La Moderna USA": "LM-USA",
            "Puentes": "PUENTES",
            "NO DISPONIBLE": "NO-DISPONIBLE",
            "SEO Buró Integral - Dupl Car": "SEO-BURO",
            "Sesen": "SESEN",
            "La Moderna México": "LM-MX",
            "La Moderna - Guías de Embarque 2.0": "LM-GUIAS",
            "Cliente - MOBAR": "MOBAR",
        }
        if project_name in code_map:
            return code_map[project_name]
        # Fallback: uppercase, replace spaces
        return project_name.upper().replace(" ", "-")[:20]

    def _resolve_json(self, json_file: str | None) -> Path:
        if json_file:
            return Path(json_file)
        candidates = [
            Path(__file__).resolve().parents[4] / "DA-Rentabilidad" / "CLEAN_DATA" / "enero_febrero_2026.json",
            Path.cwd() / "DA-Rentabilidad" / "CLEAN_DATA" / "enero_febrero_2026.json",
        ]
        for p in candidates:
            if p.exists():
                return p
        return candidates[0]

    def _print_dry_run(self, projects_data: dict):
        self.stdout.write("\n=== DRY RUN ===\n")
        for proj_name, proj_data in projects_data.items():
            code = self._generate_code(proj_name)
            is_int = proj_data.get("is_internal", False)
            tag = "INTERNAL" if is_int else "CLIENT"
            entries = len(proj_data.get("entries", []))
            self.stdout.write(
                f"  {code:<20} [{tag:8}] {proj_data['total_hours']:>8}h "
                f"${Decimal(proj_data['total_amount']):>12,.2f}  ({entries} entries)"
            )
        self.stdout.write("\nNo changes written to DB.")
