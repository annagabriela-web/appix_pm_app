from decimal import Decimal

from django.test import TestCase

from apps.finance.models import (
    BillingRole,
    HealthSnapshot,
    Project,
    ProjectHealthAlert,
    TimeEntry,
)
from apps.finance.services import TripleAxisService


class TripleAxisServiceTest(TestCase):
    """Tests para el servicio central de Triple Axis Varianza."""

    def setUp(self) -> None:
        self.project = Project.objects.create(
            name="E-commerce Redesign",
            code="ECR-001",
            client_name="Acme Corp",
            budget_hours=Decimal("100.00"),
            client_invoice_amount=Decimal("50000.00"),
            target_margin=Decimal("30.00"),
        )
        self.role = BillingRole.objects.create(
            role_name="Backend Dev",
            default_hourly_rate=Decimal("70.00"),
        )

    def _create_time_entry(self, hours: str, date: str = "2026-01-15") -> TimeEntry:
        """Helper para crear time entries."""
        return TimeEntry.objects.create(
            clockify_id=f"clk-{TimeEntry.objects.count() + 1}",
            project=self.project,
            billing_role=self.role,
            user_name="Dev User",
            user_email="dev@test.com",
            duration_hours=Decimal(hours),
            cost=Decimal(hours) * self.role.default_hourly_rate,
            date=date,
        )

    def test_gherkin_scenario_critical_alert(self) -> None:
        """
        PRD Gherkin Scenario: Critical Alert Generation.
        GIVEN: Budget 100 hours, Consumed 85 hours (85%), Progress 40%.
        THEN: Status CRITICAL, alert created.
        """
        self._create_time_entry("85.00")

        snapshot = TripleAxisService.run_evaluation(
            self.project, jira_progress=Decimal("40.00")
        )

        self.assertEqual(snapshot.health_status, "CRITICAL")
        self.assertEqual(snapshot.consumption_percent, Decimal("85.00"))
        self.assertEqual(snapshot.progress_percent, Decimal("40.00"))

        self.project.refresh_from_db()
        self.assertEqual(self.project.current_health_status, "CRITICAL")

        alert = ProjectHealthAlert.objects.filter(project=self.project).first()
        self.assertIsNotNone(alert)
        self.assertEqual(alert.alert_type, "CRITICAL")  # type: ignore[union-attr]

    def test_warning_deviation_above_15(self) -> None:
        """Consumo 60%, Progreso 40% -> desviacion 20% -> WARNING."""
        self._create_time_entry("60.00")

        snapshot = TripleAxisService.run_evaluation(
            self.project, jira_progress=Decimal("40.00")
        )

        self.assertEqual(snapshot.health_status, "WARNING")

    def test_healthy_deviation_below_10(self) -> None:
        """Consumo 55%, Progreso 50% -> desviacion 5% -> HEALTHY."""
        self._create_time_entry("55.00")

        snapshot = TripleAxisService.run_evaluation(
            self.project, jira_progress=Decimal("50.00")
        )

        self.assertEqual(snapshot.health_status, "HEALTHY")

    def test_zero_progress_zero_consumption(self) -> None:
        """Edge case: 0% consumo, 0% progreso -> HEALTHY."""
        snapshot = TripleAxisService.run_evaluation(
            self.project, jira_progress=Decimal("0.00")
        )

        self.assertEqual(snapshot.health_status, "HEALTHY")
        self.assertEqual(snapshot.consumption_percent, Decimal("0.00"))
        self.assertEqual(snapshot.health_score, 100)

    def test_zero_budget_hours_no_division_error(self) -> None:
        """Edge case: budget_hours = 0 no debe generar division por cero."""
        self.project.budget_hours = Decimal("0.00")
        self.project.save()

        consumption = TripleAxisService.calculate_consumption_percent(self.project)
        self.assertEqual(consumption, Decimal("0"))

    def test_earned_value_calculation(self) -> None:
        """Earned Value = client_invoice_amount * progress / 100."""
        ev = TripleAxisService.calculate_earned_value(
            self.project, Decimal("40.00")
        )
        expected = Decimal("20000.00")
        self.assertEqual(ev, expected)

    def test_actual_cost_calculation(self) -> None:
        """Costo real = sum de costos de time entries."""
        self._create_time_entry("10.00")
        self._create_time_entry("5.00")

        cost = TripleAxisService.calculate_actual_cost(self.project)
        expected = Decimal("10.00") * Decimal("70.00") + Decimal("5.00") * Decimal("70.00")
        self.assertEqual(cost, expected)

    def test_alert_generated_only_on_status_change(self) -> None:
        """No se genera alerta si el status ya era CRITICAL."""
        self._create_time_entry("85.00")

        # Primera evaluacion: HEALTHY -> CRITICAL, debe generar alerta
        TripleAxisService.run_evaluation(self.project, Decimal("40.00"))
        self.assertEqual(ProjectHealthAlert.objects.count(), 1)

        # Segunda evaluacion: CRITICAL -> CRITICAL, NO debe generar alerta nueva
        TripleAxisService.run_evaluation(self.project, Decimal("40.00"))
        self.assertEqual(ProjectHealthAlert.objects.count(), 1)

    def test_warning_alert_from_healthy(self) -> None:
        """Se genera alerta WARNING al cambiar de HEALTHY a WARNING."""
        self._create_time_entry("60.00")

        TripleAxisService.run_evaluation(self.project, Decimal("40.00"))

        alert = ProjectHealthAlert.objects.filter(project=self.project).first()
        self.assertIsNotNone(alert)
        self.assertEqual(alert.alert_type, "WARNING")  # type: ignore[union-attr]

    def test_snapshot_history_created(self) -> None:
        """Cada evaluacion crea un snapshot historico."""
        self._create_time_entry("50.00")

        TripleAxisService.run_evaluation(self.project, Decimal("45.00"))
        TripleAxisService.run_evaluation(self.project, Decimal("48.00"))

        snapshots = HealthSnapshot.objects.filter(project=self.project)
        self.assertEqual(snapshots.count(), 2)
