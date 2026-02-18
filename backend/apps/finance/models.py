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

    # Client organization (multi-tenant)
    client_org = models.ForeignKey(
        "accounts.Organization",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
        limit_choices_to={"org_type": "EXTERNAL"},
        help_text="The external client organization that owns this project.",
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

    PHASE_STATUS_CHOICES = [
        ("completed", "Completed"),
        ("in_progress", "In Progress"),
        ("pending", "Pending"),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="phases"
    )
    name = models.CharField(max_length=100)
    estimated_hours = models.DecimalField(max_digits=10, decimal_places=2)
    sort_order = models.IntegerField(default=0)

    # Status & billing fields
    status = models.CharField(
        max_length=20, choices=PHASE_STATUS_CHOICES, default="pending"
    )
    progress_percent = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal("0.00")
    )
    invoice_amount = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    invoice_date = models.DateField(null=True, blank=True)
    is_paid = models.BooleanField(default=False)

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

    sprint = models.ForeignKey(
        "Sprint",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="time_entries",
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


class Sprint(models.Model):
    """Iteracion de trabajo dentro de un proyecto."""

    STATUS_CHOICES = [
        ("planned", "Planned"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="sprints"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="planned")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "created_at"]

    def __str__(self) -> str:
        return f"{self.project.code} / {self.name}"


class SprintTask(models.Model):
    """Tarea individual dentro de un sprint, mapeada a Jira."""

    sprint = models.ForeignKey(
        Sprint, on_delete=models.CASCADE, related_name="tasks"
    )
    jira_key = models.CharField(max_length=50)
    title = models.CharField(max_length=500)
    assigned_to = models.CharField(max_length=255, blank=True, default="")
    hours = models.DecimalField(
        max_digits=8, decimal_places=2, default=Decimal("0.00")
    )
    date = models.DateField()

    class Meta:
        ordering = ["date", "jira_key"]

    def __str__(self) -> str:
        return f"{self.sprint} / {self.jira_key}"


class Advance(models.Model):
    """Avance o entregable presentado en un sprint."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
    ]

    sprint = models.ForeignKey(
        Sprint, on_delete=models.CASCADE, related_name="advances"
    )
    task_jira_key = models.CharField(max_length=50)
    description = models.TextField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )
    presented_by = models.CharField(max_length=255)
    observations = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.sprint} / Advance {self.task_jira_key} [{self.status}]"


class SimpleChangeRequest(models.Model):
    """Cambio simple solicitado sobre un avance existente."""

    STATUS_CHOICES = [
        ("in_process", "In Process"),
        ("pending_review", "Pending Review"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]

    sprint = models.ForeignKey(
        Sprint, on_delete=models.CASCADE, related_name="simple_changes"
    )
    advance = models.ForeignKey(
        Advance,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="simple_changes",
    )
    task_jira_key = models.CharField(max_length=50)
    description = models.TextField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="in_process"
    )
    review_comments = models.TextField(blank=True, default="")
    dragged_from_sprint = models.ForeignKey(
        Sprint,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="dragged_changes",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.sprint} / SimpleChange {self.task_jira_key} [{self.status}]"


class ChangeRequest(models.Model):
    """Solicitud de cambio fuera de alcance."""

    STATUS_CHOICES = [
        ("in_review", "In Review"),
        ("accepted", "Accepted"),
        ("to_start", "To Start"),
        ("in_process", "In Process"),
        ("pending_acceptance", "Pending Acceptance"),
        ("completed", "Completed"),
    ]

    sprint = models.ForeignKey(
        Sprint, on_delete=models.CASCADE, related_name="change_requests"
    )
    description = models.CharField(max_length=500)
    detail = models.TextField(blank=True, default="")
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="in_review"
    )
    dependencies = models.TextField(blank=True, default="")
    impact = models.TextField(blank=True, default="")
    estimated_hours = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.sprint} / CR: {self.description[:50]} [{self.status}]"
