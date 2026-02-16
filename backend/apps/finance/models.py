from decimal import Decimal

from django.db import models


class Project(models.Model):
    """Proyecto con campos financieros extendidos."""

    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    client_name = models.CharField(max_length=255)

    # Financial fields
    budget_hours = models.DecimalField(max_digits=10, decimal_places=2)
    client_invoice_amount = models.DecimalField(max_digits=12, decimal_places=2)
    target_margin = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Margen objetivo en porcentaje, ej: 30.00",
    )

    # Integration IDs
    jira_project_key = models.CharField(max_length=20, blank=True, default="")
    clockify_project_id = models.CharField(max_length=100, blank=True, default="")

    # Computed health status
    current_health_status = models.CharField(
        max_length=10,
        choices=[
            ("CRITICAL", "Critical"),
            ("WARNING", "Warning"),
            ("HEALTHY", "Healthy"),
        ],
        default="HEALTHY",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.code} - {self.name}"


class Phase(models.Model):
    """Fases del proyecto: Planning, Design, Dev, QA, etc."""

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="phases"
    )
    name = models.CharField(max_length=100)
    estimated_hours = models.DecimalField(max_digits=10, decimal_places=2)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]
        unique_together = ("project", "name")

    def __str__(self) -> str:
        return f"{self.project.code} / {self.name}"


class BillingRole(models.Model):
    """Roles facturables con tarifa por hora global."""

    role_name = models.CharField(max_length=100, unique=True)
    default_hourly_rate = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        ordering = ["role_name"]

    def __str__(self) -> str:
        return f"{self.role_name} (${self.default_hourly_rate}/hr)"


class ProjectRoleRate(models.Model):
    """Tarifa especifica por proyecto (override de BillingRole)."""

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="role_rates"
    )
    billing_role = models.ForeignKey(BillingRole, on_delete=models.CASCADE)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        unique_together = ("project", "billing_role")

    def __str__(self) -> str:
        return f"{self.project.code} / {self.billing_role.role_name}: ${self.hourly_rate}/hr"


class TimeEntry(models.Model):
    """Entrada de tiempo sincronizada desde Clockify."""

    clockify_id = models.CharField(max_length=100, unique=True)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="time_entries"
    )
    phase = models.ForeignKey(
        Phase, on_delete=models.SET_NULL, null=True, blank=True, related_name="time_entries"
    )
    billing_role = models.ForeignKey(
        BillingRole, on_delete=models.SET_NULL, null=True, blank=True
    )

    user_name = models.CharField(max_length=255)
    user_email = models.EmailField()
    description = models.TextField(blank=True, default="")

    duration_hours = models.DecimalField(max_digits=8, decimal_places=4)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    date = models.DateField()

    synced_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]
        indexes = [
            models.Index(fields=["project", "date"]),
        ]

    def __str__(self) -> str:
        return f"{self.project.code} | {self.user_name} | {self.date} | {self.duration_hours}h"


class HealthSnapshot(models.Model):
    """Instantanea historica del Triple Axis para analisis de tendencia."""

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="health_snapshots"
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    consumption_percent = models.DecimalField(max_digits=5, decimal_places=2)
    progress_percent = models.DecimalField(max_digits=5, decimal_places=2)
    budget_consumed = models.DecimalField(max_digits=12, decimal_places=2)
    earned_value = models.DecimalField(max_digits=12, decimal_places=2)
    health_status = models.CharField(max_length=10)
    health_score = models.IntegerField(default=50, help_text="0-100 para Gauge Chart")

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["project", "timestamp"]),
        ]

    def __str__(self) -> str:
        return f"{self.project.code} | {self.timestamp:%Y-%m-%d %H:%M} | {self.health_status}"


class ProjectHealthAlert(models.Model):
    """Registro de alertas generadas por cambio de estado de salud."""

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="alerts"
    )
    alert_type = models.CharField(
        max_length=10,
        choices=[("CRITICAL", "Critical"), ("WARNING", "Warning")],
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"[{self.alert_type}] {self.project.code} - {self.created_at:%Y-%m-%d}"
