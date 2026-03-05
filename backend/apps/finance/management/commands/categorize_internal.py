"""
Management command to assign internal_category to internal projects
and optionally reclassify misassigned TimeEntries.

Usage:
    python manage.py categorize_internal
    python manage.py categorize_internal --reclassify
    python manage.py categorize_internal --dry-run
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q

from apps.finance.models import Project, TimeEntry

# ── Project name → internal category mapping ────────────────────
CATEGORY_MAP = {
    "Dailys": "DAILYS",
    "VENTAS": "VENTAS",
    "Ventas - Appix": "VENTAS",
    "Training": "CAPACITACION",
    "APPIX DATA": "INNOVACION",
    "Appix_App_Admin": "INNOVACION",
    "HR": "HR_ADMIN",
    "Appix - Recursos Humanos": "HR_ADMIN",
    "Appix PMO": "GESTION",
    "Appix General": "GESTION",
    "General Appix": "GESTION",
    "Appix TI": "TI",
    "Diseño Appix": "DISENO",
    "General diseño": "DISENO",
}

# ── Reclassification rules ──────────────────────────────────────
# Patterns in TimeEntry.description that indicate the entry belongs
# to a client project, not the internal project it was logged under.
# Format: (description pattern, target project code)
RECLASSIFY_RULES = [
    # Camila / Christian planning logged under internal but belongs to client
    ("eenvita", "EENVITA"),
    ("moderna", "DATA-LM"),
    ("capturando", "CAP-MX"),
    ("nespresso", "NESPRESSO"),
    ("station", "STATION24"),
    ("muebles cook", "MUEBLES-COOK"),
    ("colorado", "COLORADO"),
    ("mobar", "MOBAR"),
    ("sesen", "SESEN"),
    ("puentes", "PUENTES"),
    # Microsoft Fabric = La Moderna Data project
    ("microsoft fabric", "DATA-LM"),
    ("fabric", "DATA-LM"),
]


class Command(BaseCommand):
    help = "Assign internal_category to internal projects and optionally reclassify misassigned entries."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reclassify",
            action="store_true",
            help="Also reclassify TimeEntries whose descriptions indicate a client project.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would change without writing to DB.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        do_reclassify = options["reclassify"]

        if dry_run:
            self.stdout.write(self.style.WARNING("=== DRY RUN ===\n"))

        self._categorize_projects(dry_run)

        if do_reclassify:
            self.stdout.write("")
            self._reclassify_entries(dry_run)

    def _categorize_projects(self, dry_run: bool):
        self.stdout.write(self.style.MIGRATE_HEADING("Assigning internal categories..."))

        internal_projects = Project.objects.filter(is_internal=True)
        updated = 0

        for project in internal_projects:
            category = CATEGORY_MAP.get(project.name, "OTHER")

            if project.internal_category == category:
                self.stdout.write(f"  {project.code:<20} already {category}")
                continue

            self.stdout.write(
                f"  {project.code:<20} {project.internal_category or '(empty)'} -> {category}"
            )

            if not dry_run:
                project.internal_category = category
                project.save(update_fields=["internal_category"])

            updated += 1

        self.stdout.write(
            self.style.SUCCESS(f"\n  {updated} projects {'would be ' if dry_run else ''}updated.")
        )

    def _reclassify_entries(self, dry_run: bool):
        self.stdout.write(self.style.MIGRATE_HEADING("Reclassifying misassigned TimeEntries..."))

        # Build a cache of client projects by code
        client_projects = {
            p.code: p for p in Project.objects.filter(is_internal=False)
        }

        # Only look at entries currently on internal projects
        internal_entries = TimeEntry.objects.filter(
            project__is_internal=True,
        ).exclude(description="").select_related("project")

        total_moved = 0
        total_hours = 0

        if not dry_run:
            ctx = transaction.atomic()
            ctx.__enter__()

        try:
            for entry in internal_entries:
                desc_lower = entry.description.lower()

                for pattern, target_code in RECLASSIFY_RULES:
                    if pattern in desc_lower:
                        target_project = client_projects.get(target_code)
                        if not target_project:
                            self.stdout.write(
                                self.style.WARNING(
                                    f"  SKIP: Target project {target_code} not found "
                                    f"(entry: {entry.user_name} - {entry.description[:60]})"
                                )
                            )
                            break

                        self.stdout.write(
                            f"  MOVE: {entry.user_name} | {entry.duration_hours}h | "
                            f"{entry.project.code} -> {target_code} | "
                            f"{entry.description[:60]}"
                        )

                        if not dry_run:
                            entry.project = target_project
                            entry.save(update_fields=["project_id"])

                        total_moved += 1
                        total_hours += float(entry.duration_hours)
                        break  # Only match first rule

            if not dry_run:
                ctx.__exit__(None, None, None)
        except Exception:
            if not dry_run:
                ctx.__exit__(*__import__("sys").exc_info())
            raise

        label = "would be " if dry_run else ""
        self.stdout.write(
            self.style.SUCCESS(
                f"\n  {total_moved} entries {label}moved ({total_hours:.1f}h)"
            )
        )
