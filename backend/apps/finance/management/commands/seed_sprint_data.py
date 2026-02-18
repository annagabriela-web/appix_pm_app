"""Seed sprint, task, advance, and change request data for design projects."""

from datetime import date
from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.finance.models import (
    Advance,
    ChangeRequest,
    Phase,
    Project,
    SimpleChangeRequest,
    Sprint,
    SprintTask,
)


class Command(BaseCommand):
    help = "Seed sprint data for CAP-MX and LM-BRAND projects"

    def handle(self, *args, **options):
        self._seed_cap_mx()
        self._seed_lm_brand()
        self.stdout.write(self.style.SUCCESS("Sprint data seeded successfully."))

    def _seed_cap_mx(self):
        try:
            project = Project.objects.get(code="CAP-MX")
        except Project.DoesNotExist:
            self.stdout.write(self.style.WARNING("Project CAP-MX not found. Skipping."))
            return

        # Clean existing sprint data
        Sprint.objects.filter(project=project).delete()

        # Update phases
        phases = list(Phase.objects.filter(project=project).order_by("sort_order"))
        if len(phases) >= 5:
            # Phase 1: Descubrimiento - completed
            phases[0].status = "completed"
            phases[0].progress_percent = Decimal("100.00")
            phases[0].invoice_amount = Decimal("6750.00")
            phases[0].invoice_date = date(2025, 11, 15)
            phases[0].is_paid = True
            phases[0].save()

            # Phase 2: Conceptualizacion - completed
            phases[1].status = "completed"
            phases[1].progress_percent = Decimal("100.00")
            phases[1].invoice_amount = Decimal("11250.00")
            phases[1].invoice_date = date(2025, 12, 20)
            phases[1].is_paid = True
            phases[1].save()

            # Phase 3: Diseno Visual - in_progress
            phases[2].status = "in_progress"
            phases[2].progress_percent = Decimal("65.00")
            phases[2].invoice_amount = Decimal("13500.00")
            phases[2].invoice_date = date(2026, 1, 30)
            phases[2].is_paid = False
            phases[2].save()

            # Phase 4: Prototipado - pending
            phases[3].status = "pending"
            phases[3].progress_percent = Decimal("0.00")
            phases[3].save()

            # Phase 5: Entrega Final - pending
            phases[4].status = "pending"
            phases[4].progress_percent = Decimal("0.00")
            phases[4].save()

        # Sprint 1: Completed
        s1 = Sprint.objects.create(
            project=project,
            name="Sprint 1",
            description="Investigacion de marca y benchmarks",
            status="completed",
            start_date=date(2025, 11, 1),
            end_date=date(2025, 11, 30),
            sort_order=1,
        )

        SprintTask.objects.bulk_create([
            SprintTask(sprint=s1, jira_key="CAP-101", title="Analisis de competencia directa", assigned_to="Ana Martinez", hours=Decimal("8.0"), date=date(2025, 11, 5)),
            SprintTask(sprint=s1, jira_key="CAP-102", title="Moodboard visual de marca", assigned_to="Carlos Ramirez", hours=Decimal("6.5"), date=date(2025, 11, 8)),
            SprintTask(sprint=s1, jira_key="CAP-103", title="Entrevistas con stakeholders", assigned_to="Ana Martinez", hours=Decimal("4.0"), date=date(2025, 11, 12)),
            SprintTask(sprint=s1, jira_key="CAP-104", title="Documento de hallazgos", assigned_to="Sofia Lopez", hours=Decimal("5.0"), date=date(2025, 11, 20)),
        ])

        Advance.objects.bulk_create([
            Advance(sprint=s1, task_jira_key="CAP-101", description="Analisis completado con 12 competidores mapeados", status="accepted", presented_by="Ana Martinez", observations="Excelente profundidad en el analisis"),
            Advance(sprint=s1, task_jira_key="CAP-102", description="Moodboard aprobado por el cliente", status="accepted", presented_by="Carlos Ramirez"),
            Advance(sprint=s1, task_jira_key="CAP-104", description="Documento entregado y revisado", status="accepted", presented_by="Sofia Lopez"),
        ])

        # Sprint 2: In Progress
        s2 = Sprint.objects.create(
            project=project,
            name="Sprint 2",
            description="Desarrollo de identidad visual y primeros entregables",
            status="in_progress",
            start_date=date(2026, 1, 6),
            end_date=date(2026, 2, 14),
            sort_order=2,
        )

        SprintTask.objects.bulk_create([
            SprintTask(sprint=s2, jira_key="CAP-201", title="Propuesta de paleta de colores", assigned_to="Carlos Ramirez", hours=Decimal("7.0"), date=date(2026, 1, 8)),
            SprintTask(sprint=s2, jira_key="CAP-202", title="Diseno de logotipo v1", assigned_to="Carlos Ramirez", hours=Decimal("12.0"), date=date(2026, 1, 15)),
            SprintTask(sprint=s2, jira_key="CAP-203", title="Sistema tipografico", assigned_to="Sofia Lopez", hours=Decimal("5.5"), date=date(2026, 1, 20)),
            SprintTask(sprint=s2, jira_key="CAP-204", title="Aplicaciones de marca en papeleria", assigned_to="Ana Martinez", hours=Decimal("6.0"), date=date(2026, 2, 3)),
        ])

        adv_accepted = Advance.objects.create(
            sprint=s2,
            task_jira_key="CAP-201",
            description="Paleta de colores aprobada: primarios y secundarios definidos",
            status="accepted",
            presented_by="Carlos Ramirez",
        )

        Advance.objects.create(
            sprint=s2,
            task_jira_key="CAP-202",
            description="Logo v1 presentado al cliente, pendiente feedback",
            status="pending",
            presented_by="Carlos Ramirez",
        )

        SimpleChangeRequest.objects.create(
            sprint=s2,
            advance=adv_accepted,
            task_jira_key="CAP-201",
            description="Ajuste de tono en color secundario segun feedback del cliente",
            status="pending_review",
        )

        ChangeRequest.objects.create(
            sprint=s2,
            description="Agregar version responsive del logo para redes sociales",
            detail="El cliente requiere variantes del logotipo optimizadas para perfil de Instagram, avatar de WhatsApp y favicon web",
            status="in_review",
            dependencies="Aprobacion final del logotipo principal (CAP-202)",
            impact="Agrega 8-10 horas adicionales al Sprint 2",
            estimated_hours=Decimal("10.0"),
        )

        # Sprint 3: Planned
        Sprint.objects.create(
            project=project,
            name="Sprint 3",
            description="Prototipado interactivo y entrega final",
            status="planned",
            start_date=date(2026, 2, 17),
            end_date=date(2026, 3, 14),
            sort_order=3,
        )

        self.stdout.write(f"  CAP-MX: 3 sprints, tasks, advances, and changes seeded.")

    def _seed_lm_brand(self):
        try:
            project = Project.objects.get(code="LM-BRAND")
        except Project.DoesNotExist:
            self.stdout.write(self.style.WARNING("Project LM-BRAND not found. Skipping."))
            return

        # Clean existing sprint data
        Sprint.objects.filter(project=project).delete()

        # Update phases
        phases = list(Phase.objects.filter(project=project).order_by("sort_order"))
        if len(phases) >= 5:
            phases[0].status = "completed"
            phases[0].progress_percent = Decimal("100.00")
            phases[0].invoice_amount = Decimal("4800.00")
            phases[0].invoice_date = date(2025, 10, 30)
            phases[0].is_paid = True
            phases[0].save()

            phases[1].status = "completed"
            phases[1].progress_percent = Decimal("100.00")
            phases[1].invoice_amount = Decimal("8000.00")
            phases[1].invoice_date = date(2025, 12, 5)
            phases[1].is_paid = True
            phases[1].save()

            phases[2].status = "in_progress"
            phases[2].progress_percent = Decimal("45.00")
            phases[2].save()

            phases[3].status = "pending"
            phases[3].progress_percent = Decimal("0.00")
            phases[3].save()

            phases[4].status = "pending"
            phases[4].progress_percent = Decimal("0.00")
            phases[4].save()

        # Sprint 1: Completed
        s1 = Sprint.objects.create(
            project=project,
            name="Sprint 1",
            description="Diagnostico de marca y analisis de mercado",
            status="completed",
            start_date=date(2025, 10, 1),
            end_date=date(2025, 10, 31),
            sort_order=1,
        )

        SprintTask.objects.bulk_create([
            SprintTask(sprint=s1, jira_key="LM-101", title="Auditoria de marca actual", assigned_to="Diana Torres", hours=Decimal("10.0"), date=date(2025, 10, 5)),
            SprintTask(sprint=s1, jira_key="LM-102", title="Analisis de mercado gourmet", assigned_to="Diana Torres", hours=Decimal("7.5"), date=date(2025, 10, 10)),
            SprintTask(sprint=s1, jira_key="LM-103", title="Encuestas de percepcion", assigned_to="Pedro Sanchez", hours=Decimal("6.0"), date=date(2025, 10, 18)),
            SprintTask(sprint=s1, jira_key="LM-104", title="Reporte de insights", assigned_to="Pedro Sanchez", hours=Decimal("4.5"), date=date(2025, 10, 25)),
        ])

        Advance.objects.bulk_create([
            Advance(sprint=s1, task_jira_key="LM-101", description="Auditoria completa con recomendaciones", status="accepted", presented_by="Diana Torres"),
            Advance(sprint=s1, task_jira_key="LM-103", description="Encuestas procesadas, 200 respuestas", status="accepted", presented_by="Pedro Sanchez"),
        ])

        # Sprint 2: In Progress (with overrun)
        s2 = Sprint.objects.create(
            project=project,
            name="Sprint 2",
            description="Rediseno de identidad y packaging",
            status="in_progress",
            start_date=date(2026, 1, 13),
            end_date=date(2026, 2, 21),
            sort_order=2,
        )

        SprintTask.objects.bulk_create([
            SprintTask(sprint=s2, jira_key="LM-201", title="Rediseno de logotipo", assigned_to="Diana Torres", hours=Decimal("14.0"), date=date(2026, 1, 15)),
            SprintTask(sprint=s2, jira_key="LM-202", title="Diseno de packaging premium", assigned_to="Pedro Sanchez", hours=Decimal("11.0"), date=date(2026, 1, 22)),
            SprintTask(sprint=s2, jira_key="LM-203", title="Manual de identidad visual", assigned_to="Diana Torres", hours=Decimal("8.5"), date=date(2026, 2, 1)),
            SprintTask(sprint=s2, jira_key="LM-204", title="Mockups de aplicacion", assigned_to="Pedro Sanchez", hours=Decimal("9.0"), date=date(2026, 2, 10)),
        ])

        Advance.objects.create(
            sprint=s2,
            task_jira_key="LM-201",
            description="Logo rediseñado v2 - pendiente aprobacion cliente",
            status="pending",
            presented_by="Diana Torres",
            observations="",
        )

        Advance.objects.create(
            sprint=s2,
            task_jira_key="LM-202",
            description="Packaging premium v1 listo para revision",
            status="pending",
            presented_by="Pedro Sanchez",
        )

        SimpleChangeRequest.objects.create(
            sprint=s2,
            task_jira_key="LM-201",
            description="Cliente solicita variante mas moderna del logotipo",
            status="in_process",
        )

        SimpleChangeRequest.objects.create(
            sprint=s2,
            task_jira_key="LM-203",
            description="Incluir pautas de uso en redes sociales en el manual",
            status="pending_review",
            dragged_from_sprint=s1,
        )

        ChangeRequest.objects.create(
            sprint=s2,
            description="Diseño adicional de etiquetas para linea organica",
            detail="La Moderna lanza una nueva linea organica que requiere etiquetas diferenciadas pero coherentes con la marca principal",
            status="accepted",
            dependencies="Aprobacion del packaging premium (LM-202)",
            impact="Agrega 12 horas al proyecto, posible extension de Sprint 2",
            estimated_hours=Decimal("12.0"),
        )

        self.stdout.write(f"  LM-BRAND: 2 sprints, tasks, advances, and changes seeded.")
