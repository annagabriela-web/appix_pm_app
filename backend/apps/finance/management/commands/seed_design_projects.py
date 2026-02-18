"""
Seeds the two initial design projects: Capturando Mexico and La Moderna.
Includes phases, billing roles, time entries and health snapshots
so the dashboard cards render with realistic data.
Safe to run multiple times (idempotent by project code).
"""

from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.finance.models import (
    BillingRole,
    HealthSnapshot,
    Phase,
    Project,
    ProjectRoleRate,
    TimeEntry,
)


class Command(BaseCommand):
    help = "Seed Capturando Mexico and La Moderna design projects"

    def handle(self, *args, **options):
        # --- Billing Roles ---
        roles_data = [
            ("Director Creativo", Decimal("95.00")),
            ("Disenador Senior", Decimal("75.00")),
            ("Disenador UX/UI", Decimal("65.00")),
            ("Motion Designer", Decimal("70.00")),
            ("Project Manager", Decimal("60.00")),
        ]
        roles = {}
        for name, rate in roles_data:
            role, created = BillingRole.objects.get_or_create(
                role_name=name,
                defaults={"default_hourly_rate": rate},
            )
            roles[name] = role
            status = "Created" if created else "Exists"
            self.stdout.write(f"  BillingRole '{name}': {status}")

        # =============================================
        # PROJECT 1: Capturando Mexico
        # =============================================
        p1, created = Project.objects.get_or_create(
            code="CAP-MX",
            defaults={
                "name": "Capturando Mexico",
                "client_name": "Capturando Mexico",
                "budget_hours": Decimal("320.00"),
                "client_invoice_amount": Decimal("45000.00"),
                "target_margin": Decimal("35.00"),
                "current_health_status": "HEALTHY",
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS("  Project 'Capturando Mexico' created"))
        else:
            self.stdout.write("  Project 'Capturando Mexico' already exists")

        if created:
            # Phases
            phases_1 = [
                ("Descubrimiento", Decimal("40.00"), 1),
                ("Diseno UX", Decimal("80.00"), 2),
                ("Diseno UI", Decimal("100.00"), 3),
                ("Motion & Animacion", Decimal("60.00"), 4),
                ("Entrega & QA", Decimal("40.00"), 5),
            ]
            phase_objs_1 = {}
            for name, hours, order in phases_1:
                ph = Phase.objects.create(
                    project=p1, name=name, estimated_hours=hours, sort_order=order
                )
                phase_objs_1[name] = ph

            # Role rates
            for role_name, rate in [
                ("Director Creativo", Decimal("100.00")),
                ("Disenador Senior", Decimal("80.00")),
                ("Disenador UX/UI", Decimal("70.00")),
                ("Motion Designer", Decimal("75.00")),
                ("Project Manager", Decimal("55.00")),
            ]:
                ProjectRoleRate.objects.create(
                    project=p1, billing_role=roles[role_name], hourly_rate=rate
                )

            # Time entries (simulate ~180h worked, ~$14,400 cost)
            today = date.today()
            start = today - timedelta(days=45)
            entries_1 = [
                # Descubrimiento (complete)
                ("Ana Gabriela", "ana-gabriela@appix.mx", phase_objs_1["Descubrimiento"], Decimal("8.00"), Decimal("640.00"), start),
                ("Ana Gabriela", "ana-gabriela@appix.mx", phase_objs_1["Descubrimiento"], Decimal("8.00"), Decimal("640.00"), start + timedelta(days=1)),
                ("Carlos Mendez", "carlos@appix.mx", phase_objs_1["Descubrimiento"], Decimal("6.00"), Decimal("480.00"), start + timedelta(days=2)),
                ("Ana Gabriela", "ana-gabriela@appix.mx", phase_objs_1["Descubrimiento"], Decimal("8.00"), Decimal("640.00"), start + timedelta(days=3)),
                ("Carlos Mendez", "carlos@appix.mx", phase_objs_1["Descubrimiento"], Decimal("6.00"), Decimal("480.00"), start + timedelta(days=4)),
                ("Ana Gabriela", "ana-gabriela@appix.mx", phase_objs_1["Descubrimiento"], Decimal("6.00"), Decimal("480.00"), start + timedelta(days=5)),
                # Diseno UX (in progress)
                ("Sofia Reyes", "sofia@appix.mx", phase_objs_1["Diseno UX"], Decimal("8.00"), Decimal("560.00"), start + timedelta(days=10)),
                ("Sofia Reyes", "sofia@appix.mx", phase_objs_1["Diseno UX"], Decimal("8.00"), Decimal("560.00"), start + timedelta(days=11)),
                ("Sofia Reyes", "sofia@appix.mx", phase_objs_1["Diseno UX"], Decimal("8.00"), Decimal("560.00"), start + timedelta(days=12)),
                ("Carlos Mendez", "carlos@appix.mx", phase_objs_1["Diseno UX"], Decimal("7.00"), Decimal("560.00"), start + timedelta(days=13)),
                ("Sofia Reyes", "sofia@appix.mx", phase_objs_1["Diseno UX"], Decimal("8.00"), Decimal("560.00"), start + timedelta(days=14)),
                ("Sofia Reyes", "sofia@appix.mx", phase_objs_1["Diseno UX"], Decimal("8.00"), Decimal("560.00"), start + timedelta(days=17)),
                ("Carlos Mendez", "carlos@appix.mx", phase_objs_1["Diseno UX"], Decimal("7.00"), Decimal("560.00"), start + timedelta(days=18)),
                ("Sofia Reyes", "sofia@appix.mx", phase_objs_1["Diseno UX"], Decimal("8.00"), Decimal("560.00"), start + timedelta(days=19)),
                # Diseno UI (started)
                ("Diego Lopez", "diego@appix.mx", phase_objs_1["Diseno UI"], Decimal("8.00"), Decimal("640.00"), start + timedelta(days=25)),
                ("Diego Lopez", "diego@appix.mx", phase_objs_1["Diseno UI"], Decimal("8.00"), Decimal("640.00"), start + timedelta(days=26)),
                ("Sofia Reyes", "sofia@appix.mx", phase_objs_1["Diseno UI"], Decimal("6.00"), Decimal("420.00"), start + timedelta(days=27)),
                ("Diego Lopez", "diego@appix.mx", phase_objs_1["Diseno UI"], Decimal("8.00"), Decimal("640.00"), start + timedelta(days=28)),
                ("Diego Lopez", "diego@appix.mx", phase_objs_1["Diseno UI"], Decimal("8.00"), Decimal("640.00"), start + timedelta(days=30)),
                ("Sofia Reyes", "sofia@appix.mx", phase_objs_1["Diseno UI"], Decimal("6.00"), Decimal("420.00"), start + timedelta(days=31)),
                ("Diego Lopez", "diego@appix.mx", phase_objs_1["Diseno UI"], Decimal("8.00"), Decimal("640.00"), start + timedelta(days=33)),
                ("Diego Lopez", "diego@appix.mx", phase_objs_1["Diseno UI"], Decimal("7.00"), Decimal("560.00"), start + timedelta(days=35)),
            ]
            for i, (uname, uemail, phase, hours, cost, d) in enumerate(entries_1):
                TimeEntry.objects.create(
                    clockify_id=f"cap-mx-{i+1:04d}",
                    project=p1,
                    phase=phase,
                    billing_role=roles["Disenador UX/UI"] if "sofia" in uemail else roles["Disenador Senior"],
                    user_name=uname,
                    user_email=uemail,
                    description=f"Trabajo en {phase.name}",
                    duration_hours=hours,
                    cost=cost,
                    date=d,
                )

            # Health snapshot
            HealthSnapshot.objects.create(
                project=p1,
                consumption_percent=Decimal("56.25"),
                progress_percent=Decimal("52.00"),
                budget_consumed=Decimal("12640.00"),
                earned_value=Decimal("23400.00"),
                health_status="HEALTHY",
                health_score=72,
            )

        # =============================================
        # PROJECT 2: La Moderna
        # =============================================
        p2, created = Project.objects.get_or_create(
            code="LM-BRAND",
            defaults={
                "name": "La Moderna",
                "client_name": "La Moderna",
                "budget_hours": Decimal("200.00"),
                "client_invoice_amount": Decimal("32000.00"),
                "target_margin": Decimal("30.00"),
                "current_health_status": "WARNING",
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS("  Project 'La Moderna' created"))
        else:
            self.stdout.write("  Project 'La Moderna' already exists")

        if created:
            # Phases
            phases_2 = [
                ("Investigacion", Decimal("25.00"), 1),
                ("Identidad Visual", Decimal("60.00"), 2),
                ("Aplicaciones", Decimal("50.00"), 3),
                ("Packaging", Decimal("40.00"), 4),
                ("Manual de Marca", Decimal("25.00"), 5),
            ]
            phase_objs_2 = {}
            for name, hours, order in phases_2:
                ph = Phase.objects.create(
                    project=p2, name=name, estimated_hours=hours, sort_order=order
                )
                phase_objs_2[name] = ph

            # Role rates
            for role_name, rate in [
                ("Director Creativo", Decimal("95.00")),
                ("Disenador Senior", Decimal("75.00")),
                ("Disenador UX/UI", Decimal("65.00")),
                ("Project Manager", Decimal("60.00")),
            ]:
                ProjectRoleRate.objects.create(
                    project=p2, billing_role=roles[role_name], hourly_rate=rate
                )

            # Time entries (simulate ~140h worked, ~$11,200 cost — over budget pace)
            today = date.today()
            start2 = today - timedelta(days=35)
            entries_2 = [
                # Investigacion (complete)
                ("Ana Gabriela", "ana-gabriela@appix.mx", phase_objs_2["Investigacion"], Decimal("8.00"), Decimal("640.00"), start2),
                ("Ana Gabriela", "ana-gabriela@appix.mx", phase_objs_2["Investigacion"], Decimal("8.00"), Decimal("640.00"), start2 + timedelta(days=1)),
                ("Maria Torres", "maria@appix.mx", phase_objs_2["Investigacion"], Decimal("7.00"), Decimal("525.00"), start2 + timedelta(days=2)),
                ("Ana Gabriela", "ana-gabriela@appix.mx", phase_objs_2["Investigacion"], Decimal("6.00"), Decimal("480.00"), start2 + timedelta(days=3)),
                # Identidad Visual (heavy overrun)
                ("Maria Torres", "maria@appix.mx", phase_objs_2["Identidad Visual"], Decimal("8.00"), Decimal("600.00"), start2 + timedelta(days=7)),
                ("Maria Torres", "maria@appix.mx", phase_objs_2["Identidad Visual"], Decimal("8.00"), Decimal("600.00"), start2 + timedelta(days=8)),
                ("Diego Lopez", "diego@appix.mx", phase_objs_2["Identidad Visual"], Decimal("8.00"), Decimal("600.00"), start2 + timedelta(days=9)),
                ("Maria Torres", "maria@appix.mx", phase_objs_2["Identidad Visual"], Decimal("8.00"), Decimal("600.00"), start2 + timedelta(days=10)),
                ("Diego Lopez", "diego@appix.mx", phase_objs_2["Identidad Visual"], Decimal("8.00"), Decimal("600.00"), start2 + timedelta(days=11)),
                ("Maria Torres", "maria@appix.mx", phase_objs_2["Identidad Visual"], Decimal("8.00"), Decimal("600.00"), start2 + timedelta(days=14)),
                ("Diego Lopez", "diego@appix.mx", phase_objs_2["Identidad Visual"], Decimal("8.00"), Decimal("600.00"), start2 + timedelta(days=15)),
                ("Maria Torres", "maria@appix.mx", phase_objs_2["Identidad Visual"], Decimal("7.00"), Decimal("525.00"), start2 + timedelta(days=16)),
                ("Diego Lopez", "diego@appix.mx", phase_objs_2["Identidad Visual"], Decimal("8.00"), Decimal("600.00"), start2 + timedelta(days=17)),
                ("Maria Torres", "maria@appix.mx", phase_objs_2["Identidad Visual"], Decimal("7.00"), Decimal("525.00"), start2 + timedelta(days=18)),
                # Aplicaciones (started but behind)
                ("Diego Lopez", "diego@appix.mx", phase_objs_2["Aplicaciones"], Decimal("8.00"), Decimal("600.00"), start2 + timedelta(days=21)),
                ("Diego Lopez", "diego@appix.mx", phase_objs_2["Aplicaciones"], Decimal("8.00"), Decimal("600.00"), start2 + timedelta(days=22)),
                ("Maria Torres", "maria@appix.mx", phase_objs_2["Aplicaciones"], Decimal("7.00"), Decimal("525.00"), start2 + timedelta(days=23)),
                ("Diego Lopez", "diego@appix.mx", phase_objs_2["Aplicaciones"], Decimal("8.00"), Decimal("600.00"), start2 + timedelta(days=25)),
            ]
            for i, (uname, uemail, phase, hours, cost, d) in enumerate(entries_2):
                TimeEntry.objects.create(
                    clockify_id=f"lm-brand-{i+1:04d}",
                    project=p2,
                    phase=phase,
                    billing_role=roles["Disenador Senior"] if "diego" in uemail or "maria" in uemail else roles["Director Creativo"],
                    user_name=uname,
                    user_email=uemail,
                    description=f"Trabajo en {phase.name}",
                    duration_hours=hours,
                    cost=cost,
                    date=d,
                )

            # Health snapshot — WARNING because consumption > progress
            HealthSnapshot.objects.create(
                project=p2,
                consumption_percent=Decimal("70.00"),
                progress_percent=Decimal("45.00"),
                budget_consumed=Decimal("9960.00"),
                earned_value=Decimal("14400.00"),
                health_status="WARNING",
                health_score=38,
            )

        self.stdout.write(self.style.SUCCESS("\nDone. Design projects seeded."))
