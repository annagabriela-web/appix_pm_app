from decimal import Decimal

from django.db import models as db_models

from .models import HealthSnapshot, Project, ProjectHealthAlert


class TripleAxisService:
    """
    Servicio central de calculo del Triple Axis Varianza.
    Toda la logica financiera vive aqui, nunca en views o serializers.
    """

    QUANTIZE = Decimal("0.01")

    @staticmethod
    def calculate_consumption_percent(project: Project) -> Decimal:
        """Porcentaje de horas consumidas vs presupuestadas."""
        total_consumed = project.time_entries.aggregate(
            total=db_models.Sum("duration_hours")
        )["total"] or Decimal("0")

        if project.budget_hours == 0:
            return Decimal("0")

        return (total_consumed / project.budget_hours * 100).quantize(
            TripleAxisService.QUANTIZE
        )

    @staticmethod
    def calculate_consumed_hours(project: Project) -> Decimal:
        """Total de horas consumidas."""
        return (
            project.time_entries.aggregate(total=db_models.Sum("duration_hours"))[
                "total"
            ]
            or Decimal("0")
        )

    @staticmethod
    def calculate_actual_cost(project: Project) -> Decimal:
        """Costo real total del proyecto."""
        return (
            project.time_entries.aggregate(total=db_models.Sum("cost"))["total"]
            or Decimal("0.00")
        )

    @staticmethod
    def calculate_earned_value(
        project: Project, progress_percent: Decimal
    ) -> Decimal:
        """Valor Ganado = Presupuesto Total * Progreso Real / 100."""
        return (project.client_invoice_amount * progress_percent / 100).quantize(
            TripleAxisService.QUANTIZE
        )

    @staticmethod
    def evaluate_health(
        consumption_pct: Decimal, progress_pct: Decimal
    ) -> tuple[str, int]:
        """
        Evalua el estado de salud del proyecto.

        Returns:
            (status, score) donde status es CRITICAL/WARNING/HEALTHY
            y score es un entero 0-100 para el gauge chart.

        Reglas:
            CRITICAL: Consumo >= 80% AND Progreso < 50%
            WARNING:  Desviacion entre Consumo% y Progreso% > 15%
            HEALTHY:  Desviacion <= 10%
        """
        deviation = abs(consumption_pct - progress_pct)

        if consumption_pct >= Decimal("80") and progress_pct < Decimal("50"):
            score = max(0, int(100 - float(deviation) * 2))
            return ("CRITICAL", score)

        if deviation > Decimal("15"):
            score = max(15, int(100 - float(deviation)))
            return ("WARNING", score)

        if deviation <= Decimal("10"):
            score = min(100, int(100 - float(deviation)))
            return ("HEALTHY", score)

        # Zona intermedia: desviacion entre 10% y 15%
        score = max(20, int(100 - float(deviation) * 1.5))
        return ("WARNING", score)

    @classmethod
    def run_evaluation(
        cls, project: Project, jira_progress: Decimal
    ) -> HealthSnapshot:
        """
        Ejecuta evaluacion completa y genera un HealthSnapshot.

        1. Calcula metricas del Triple Axis
        2. Crea snapshot historico
        3. Actualiza estado del proyecto
        4. Genera alerta si cambio a CRITICAL o WARNING
        """
        consumption_pct = cls.calculate_consumption_percent(project)
        actual_cost = cls.calculate_actual_cost(project)
        earned_value = cls.calculate_earned_value(project, jira_progress)
        status, score = cls.evaluate_health(consumption_pct, jira_progress)

        snapshot = HealthSnapshot.objects.create(
            project=project,
            consumption_percent=consumption_pct,
            progress_percent=jira_progress,
            budget_consumed=actual_cost,
            earned_value=earned_value,
            health_status=status,
            health_score=score,
        )

        old_status = project.current_health_status
        project.current_health_status = status
        project.save(update_fields=["current_health_status", "updated_at"])

        # Generar alerta si cambio a CRITICAL
        if status == "CRITICAL" and old_status != "CRITICAL":
            ProjectHealthAlert.objects.create(
                project=project,
                alert_type="CRITICAL",
                message=(
                    f"Proyecto {project.name}: Consumo {consumption_pct}%, "
                    f"Progreso {jira_progress}%. Desviacion critica detectada."
                ),
            )
        # Generar alerta si cambio a WARNING desde HEALTHY
        elif status == "WARNING" and old_status == "HEALTHY":
            ProjectHealthAlert.objects.create(
                project=project,
                alert_type="WARNING",
                message=(
                    f"Proyecto {project.name}: Consumo {consumption_pct}%, "
                    f"Progreso {jira_progress}%. Desviacion significativa detectada."
                ),
            )

        return snapshot
