"""
Management command to merge and clean raw Clockify CSV exports.

Input:  Two CSVs from Clockify (Task CSV + Description CSV)
Output: Clean JSON file in DA-Rentabilidad/CLEAN_DATA/

Usage:
    python manage.py process_raw_clockify
    python manage.py process_raw_clockify --task-csv path/to/task.csv --desc-csv path/to/desc.csv
    python manage.py process_raw_clockify --output-name my_export
"""

import csv
import json
from collections import defaultdict
from datetime import datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path

from django.core.management.base import BaseCommand

# ── Name normalization (accent variations in Clockify) ─────────────
NAME_NORMALIZE = {
    "Natalia Rio": "Natalia Río",
    "Rafael Castillo Lopez": "Rafael Castillo López",
    "Ana Gabriela Cedeno": "Ana Gabriela Cedeño",
    "Ana Gabriela Cede\ufffdo": "Ana Gabriela Cedeño",
}

# ── Project normalization (merge duplicates) ───────────────────────
PROJECT_NORMALIZE = {
    "Eenvita UX/UI": "EENVITA",
    "Station 24 APP": "Station24",
    "General Appix": "Appix General",
    "Ventas - Appix": "VENTAS",
    "Data Analitics": "APPIX DATA",
}

# ── Internal vs Client project classification ──────────────────────
# Maps project name → internal_category (presence = is_internal=True)
INTERNAL_PROJECT_CATEGORIES = {
    "Appix TI": "TI",
    "HR": "HR_ADMIN",
    "Diseño Appix": "DISENO",
    "Appix General": "GESTION",
    "Appix PMO": "GESTION",
    "Dailys": "DAILYS",
    "Appix_App_Admin": "INNOVACION",
    "Appix - Recursos Humanos": "HR_ADMIN",
    "APPIX DATA": "INNOVACION",
    "Training": "CAPACITACION",
    "VENTAS": "VENTAS",
    "General diseño": "DISENO",
}
INTERNAL_PROJECTS = set(INTERNAL_PROJECT_CATEGORIES.keys())

# ── Default CSV file names ─────────────────────────────────────────
DEFAULT_TASK_CSV = "Enero_febrero_Task.csv"
DEFAULT_DESC_CSV = "Enero_Febrero_Description.csv"


class Command(BaseCommand):
    help = "Merge and clean raw Clockify CSV exports into a structured JSON file."

    def add_arguments(self, parser):
        parser.add_argument(
            "--task-csv",
            type=str,
            default=None,
            help="Path to the Task CSV file. Defaults to RAW_DATA/<default>.",
        )
        parser.add_argument(
            "--desc-csv",
            type=str,
            default=None,
            help="Path to the Description CSV file. Defaults to RAW_DATA/<default>.",
        )
        parser.add_argument(
            "--output-name",
            type=str,
            default=None,
            help="Output JSON filename (without extension). Defaults to auto-generated.",
        )

    def handle(self, *args, **options):
        raw_dir = self._find_raw_dir()
        task_path = Path(options["task_csv"]) if options["task_csv"] else raw_dir / DEFAULT_TASK_CSV
        desc_path = Path(options["desc_csv"]) if options["desc_csv"] else raw_dir / DEFAULT_DESC_CSV

        if not task_path.exists():
            self.stderr.write(self.style.ERROR(f"Task CSV not found: {task_path}"))
            return
        if not desc_path.exists():
            self.stderr.write(self.style.ERROR(f"Description CSV not found: {desc_path}"))
            return

        self.stdout.write(f"Reading Task CSV: {task_path}")
        self.stdout.write(f"Reading Desc CSV: {desc_path}")

        # Step 1: Parse CSVs
        task_rows = self._read_csv(task_path)
        desc_rows = self._read_csv(desc_path)
        self.stdout.write(f"  Task rows: {len(task_rows)}, Desc rows: {len(desc_rows)}")

        # Step 2: Merge
        merged, warnings = self._merge(task_rows, desc_rows)
        self.stdout.write(f"  Merged: {len(merged)} entries")

        # Step 3: Organize by project
        projects = self._organize_by_project(merged)

        # Step 4: Build output
        output = self._build_output(
            task_path.name, desc_path.name, merged, projects, warnings
        )

        # Step 5: Write JSON
        clean_dir = raw_dir.parent / "CLEAN_DATA"
        clean_dir.mkdir(exist_ok=True)

        if options["output_name"]:
            out_name = options["output_name"]
        else:
            out_name = f"clockify_clean_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        out_path = clean_dir / f"{out_name}.json"

        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2, default=str)

        self.stdout.write(self.style.SUCCESS(f"\nOutput written to: {out_path}"))
        self._print_summary(output)

    # ── CSV Reading ────────────────────────────────────────────────

    def _read_csv(self, path: Path) -> list[dict]:
        rows = []
        with open(path, encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cleaned = {k.strip(): v.strip() for k, v in row.items() if k}
                rows.append(cleaned)
        return rows

    # ── Merge Logic ────────────────────────────────────────────────

    def _merge(self, task_rows: list[dict], desc_rows: list[dict]) -> tuple[list, dict]:
        """Merge Task CSV (primary) with Description CSV (enrichment).

        Merge key: (User, Date, Time_decimal, Amount)
        Task CSV is primary because it has Project and Task columns.
        """
        warnings = {
            "desc_without_project": [],
            "zero_amount_entries": [],
            "name_normalization_applied": [],
            "duplicate_merge_keys": [],
        }

        # Build description lookup: key -> description text
        desc_lookup = {}
        desc_key_counts = defaultdict(int)
        for row in desc_rows:
            user = self._normalize_name(row.get("User", ""))
            key = (user, row.get("Date", ""), row.get("Time (decimal)", ""), row.get("Amount (MXN)", ""))
            desc_key_counts[key] += 1
            # Store description (last wins if duplicate key)
            desc_lookup[key] = row.get("Description", "")

        # Track which desc keys got matched
        matched_desc_keys = set()

        merged = []
        task_key_used = defaultdict(int)

        for row in task_rows:
            raw_user = row.get("User", "")
            user = self._normalize_name(raw_user)
            if user != raw_user:
                warnings["name_normalization_applied"].append(
                    {"original": raw_user, "normalized": user}
                )

            date_str = row.get("Date", "")
            task = row.get("Task", "(Without task)")
            project = self._normalize_project(row.get("Project", "(Unknown)"))
            time_decimal = row.get("Time (decimal)", "0")
            amount = row.get("Amount (MXN)", "0")

            # Parse date
            try:
                date_obj = datetime.strptime(date_str, "%d/%m/%Y").date()
                date_iso = date_obj.isoformat()
            except (ValueError, TypeError):
                date_iso = date_str

            # Parse hours and amount
            try:
                hours = Decimal(time_decimal)
            except (InvalidOperation, TypeError):
                hours = Decimal("0")
            try:
                amount_dec = Decimal(amount)
            except (InvalidOperation, TypeError):
                amount_dec = Decimal("0")

            # Lookup description
            merge_key = (user, date_str, time_decimal, amount)
            description = ""
            has_description = False

            if merge_key in desc_lookup:
                # Handle duplicate keys: only match once per occurrence
                task_key_used[merge_key] += 1
                if task_key_used[merge_key] <= desc_key_counts.get(merge_key, 0):
                    description = desc_lookup[merge_key]
                    matched_desc_keys.add(merge_key)
                    has_description = True

            entry = {
                "date": date_iso,
                "date_raw": date_str,
                "user": user,
                "task": task,
                "project": project,
                "description": description,
                "hours": str(hours),
                "amount": str(amount_dec),
                "has_description": has_description,
            }

            # Flag zero-amount entries
            if amount_dec == 0 and hours > 0:
                warnings["zero_amount_entries"].append(
                    {"user": user, "date": date_iso, "task": task, "project": project, "hours": str(hours)}
                )

            merged.append(entry)

        # Find desc-only entries (no matching task)
        for row in desc_rows:
            user = self._normalize_name(row.get("User", ""))
            key = (user, row.get("Date", ""), row.get("Time (decimal)", ""), row.get("Amount (MXN)", ""))
            if key not in matched_desc_keys or task_key_used.get(key, 0) < desc_key_counts.get(key, 0):
                # This desc entry had no task match
                desc_text = row.get("Description", "")
                try:
                    date_obj = datetime.strptime(row.get("Date", ""), "%d/%m/%Y").date()
                    date_iso = date_obj.isoformat()
                except (ValueError, TypeError):
                    date_iso = row.get("Date", "")

                warnings["desc_without_project"].append({
                    "user": user,
                    "date": date_iso,
                    "description": desc_text,
                    "hours": row.get("Time (decimal)", "0"),
                    "amount": row.get("Amount (MXN)", "0"),
                })

        # Deduplicate name normalization warnings
        seen_norms = set()
        unique_norms = []
        for w in warnings["name_normalization_applied"]:
            pair = (w["original"], w["normalized"])
            if pair not in seen_norms:
                seen_norms.add(pair)
                unique_norms.append(w)
        warnings["name_normalization_applied"] = unique_norms

        return merged, warnings

    # ── Organize by Project ────────────────────────────────────────

    def _organize_by_project(self, merged: list[dict]) -> dict:
        projects = defaultdict(lambda: {
            "total_hours": Decimal("0"),
            "total_amount": Decimal("0"),
            "people": defaultdict(lambda: {"hours": Decimal("0"), "amount": Decimal("0"), "tasks": set()}),
            "entries": [],
        })

        for entry in merged:
            proj_name = entry["project"]
            proj = projects[proj_name]
            hours = Decimal(entry["hours"])
            amount = Decimal(entry["amount"])

            proj["total_hours"] += hours
            proj["total_amount"] += amount

            person = proj["people"][entry["user"]]
            person["hours"] += hours
            person["amount"] += amount
            person["tasks"].add(entry["task"])

            proj["entries"].append(entry)

        # Convert sets/Decimals for JSON serialization
        result = {}
        for proj_name, proj_data in sorted(projects.items(), key=lambda x: x[1]["total_hours"], reverse=True):
            people = {}
            for person_name, person_data in sorted(proj_data["people"].items()):
                people[person_name] = {
                    "hours": str(person_data["hours"]),
                    "amount": str(person_data["amount"]),
                    "tasks": sorted(person_data["tasks"]),
                }
            is_internal = proj_name in INTERNAL_PROJECTS
            result[proj_name] = {
                "total_hours": str(proj_data["total_hours"]),
                "total_amount": str(proj_data["total_amount"]),
                "entry_count": len(proj_data["entries"]),
                "is_internal": is_internal,
                "internal_category": INTERNAL_PROJECT_CATEGORIES.get(proj_name, ""),
                "people": people,
                "entries": proj_data["entries"],
            }

        return result

    # ── Build Output ───────────────────────────────────────────────

    def _build_output(self, task_file, desc_file, merged, projects, warnings):
        matched_count = sum(1 for e in merged if e["has_description"])
        return {
            "generated_at": datetime.now().isoformat(),
            "source_files": {
                "task_csv": task_file,
                "description_csv": desc_file,
            },
            "stats": {
                "total_entries": len(merged),
                "matched_with_description": matched_count,
                "task_only_no_description": len(merged) - matched_count,
                "desc_without_project": len(warnings["desc_without_project"]),
                "zero_amount_entries": len(warnings["zero_amount_entries"]),
                "total_projects": len(projects),
                "total_people": len({e["user"] for e in merged}),
            },
            "projects": projects,
            "warnings": warnings,
        }

    # ── Print Summary ──────────────────────────────────────────────

    def _print_summary(self, output):
        stats = output["stats"]
        self.stdout.write("\n" + "=" * 70)
        self.stdout.write("  RESUMEN DE PROCESAMIENTO")
        self.stdout.write("=" * 70)
        self.stdout.write(f"  Total entries (from Task CSV):  {stats['total_entries']}")
        self.stdout.write(f"  Con descripción (merge OK):     {stats['matched_with_description']}")
        self.stdout.write(f"  Sin descripción (task-only):    {stats['task_only_no_description']}")
        self.stdout.write(f"  Desc sin proyecto (warnings):   {stats['desc_without_project']}")
        self.stdout.write(f"  Entries con $0 de monto:        {stats['zero_amount_entries']}")
        self.stdout.write(f"  Proyectos únicos:               {stats['total_projects']}")
        self.stdout.write(f"  Personas únicas:                {stats['total_people']}")

        self.stdout.write("\n  PROYECTOS:")
        self.stdout.write(f"  {'Proyecto':<40} {'Horas':>10} {'Monto':>14} {'Entries':>8}")
        self.stdout.write("  " + "-" * 74)

        for proj_name, proj_data in output["projects"].items():
            hrs = Decimal(proj_data["total_hours"])
            amt = Decimal(proj_data["total_amount"])
            self.stdout.write(
                f"  {proj_name:<40} {hrs:>10.2f} ${amt:>13,.2f} {proj_data['entry_count']:>8}"
            )

        if output["warnings"]["zero_amount_entries"]:
            self.stdout.write(f"\n  ⚠ {stats['zero_amount_entries']} entries con monto $0 (ver JSON para detalle)")

        if output["warnings"]["name_normalization_applied"]:
            self.stdout.write("\n  Nombres normalizados:")
            for n in output["warnings"]["name_normalization_applied"]:
                self.stdout.write(f"    {n['original']} → {n['normalized']}")

    # ── Helpers ────────────────────────────────────────────────────

    def _normalize_name(self, name: str) -> str:
        name = name.strip()
        return NAME_NORMALIZE.get(name, name)

    def _normalize_project(self, project: str) -> str:
        project = project.strip()
        return PROJECT_NORMALIZE.get(project, project)

    def _find_raw_dir(self) -> Path:
        # Try common locations
        candidates = [
            Path(__file__).resolve().parents[4] / "DA-Rentabilidad" / "RAW_DATA",
            Path.cwd() / "DA-Rentabilidad" / "RAW_DATA",
        ]
        for p in candidates:
            if p.exists():
                return p
        # Fallback
        return candidates[0]
