from decimal import Decimal

from django.db import models as db_models
from rest_framework import serializers

from .models import (
    Advance,
    BillingRole,
    ChangeRequest,
    HealthSnapshot,
    Phase,
    Project,
    ProjectHealthAlert,
    ProjectRoleRate,
    SimpleChangeRequest,
    Sprint,
    SprintTask,
    TimeEntry,
)


class PhaseSerializer(serializers.ModelSerializer):
    actual_hours = serializers.SerializerMethodField()

    class Meta:
        model = Phase
        fields = [
            "id", "name", "estimated_hours", "actual_hours",
            "sort_order", "status", "progress_percent",
            "invoice_amount", "invoice_date", "is_paid",
        ]

    def get_actual_hours(self, obj: Phase) -> str:
        total = obj.time_entries.aggregate(total=db_models.Sum("duration_hours"))["total"]
        return str((total or Decimal("0")).quantize(Decimal("0.01")))


class BillingRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingRole
        fields = ["id", "role_name", "default_hourly_rate"]


class ProjectRoleRateSerializer(serializers.ModelSerializer):
    billing_role_name = serializers.CharField(source="billing_role.role_name", read_only=True)

    class Meta:
        model = ProjectRoleRate
        fields = ["id", "billing_role", "billing_role_name", "hourly_rate"]


class HealthSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthSnapshot
        fields = [
            "id",
            "timestamp",
            "consumption_percent",
            "progress_percent",
            "budget_consumed",
            "earned_value",
            "health_status",
            "health_score",
        ]


class AlertSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    project_code = serializers.CharField(source="project.code", read_only=True)

    class Meta:
        model = ProjectHealthAlert
        fields = [
            "id",
            "project",
            "project_name",
            "project_code",
            "alert_type",
            "message",
            "is_read",
            "created_at",
        ]
        read_only_fields = ["id", "project", "project_name", "project_code", "alert_type", "message", "created_at"]


class ProjectListSerializer(serializers.ModelSerializer):
    consumed_hours = serializers.SerializerMethodField()
    consumption_percent = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()
    actual_cost = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "code",
            "client_name",
            "current_health_status",
            "budget_hours",
            "client_invoice_amount",
            "consumed_hours",
            "consumption_percent",
            "progress_percent",
            "actual_cost",
            "updated_at",
        ]

    def get_consumed_hours(self, obj: Project) -> str:
        total = obj.time_entries.aggregate(total=db_models.Sum("duration_hours"))["total"]
        return str((total or Decimal("0")).quantize(Decimal("0.01")))

    def get_consumption_percent(self, obj: Project) -> str:
        total = obj.time_entries.aggregate(total=db_models.Sum("duration_hours"))["total"] or Decimal("0")
        if obj.budget_hours == 0:
            return "0.00"
        return str((total / obj.budget_hours * 100).quantize(Decimal("0.01")))

    def get_progress_percent(self, obj: Project) -> str:
        latest = obj.health_snapshots.order_by("-timestamp").first()
        if latest:
            return str(latest.progress_percent)
        return "0.00"

    def get_actual_cost(self, obj: Project) -> str:
        total = obj.time_entries.aggregate(total=db_models.Sum("cost"))["total"]
        return str((total or Decimal("0.00")).quantize(Decimal("0.01")))


class ProjectDetailSerializer(serializers.ModelSerializer):
    consumed_hours = serializers.SerializerMethodField()
    consumption_percent = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()
    actual_cost = serializers.SerializerMethodField()
    earned_value = serializers.SerializerMethodField()
    phases = PhaseSerializer(many=True, read_only=True)
    role_rates = ProjectRoleRateSerializer(many=True, read_only=True)
    latest_snapshot = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "code",
            "client_name",
            "current_health_status",
            "budget_hours",
            "client_invoice_amount",
            "target_margin",
            "jira_project_key",
            "clockify_project_id",
            "consumed_hours",
            "consumption_percent",
            "progress_percent",
            "actual_cost",
            "earned_value",
            "phases",
            "role_rates",
            "latest_snapshot",
            "created_at",
            "updated_at",
        ]

    def get_consumed_hours(self, obj: Project) -> str:
        total = obj.time_entries.aggregate(total=db_models.Sum("duration_hours"))["total"]
        return str((total or Decimal("0")).quantize(Decimal("0.01")))

    def get_consumption_percent(self, obj: Project) -> str:
        total = obj.time_entries.aggregate(total=db_models.Sum("duration_hours"))["total"] or Decimal("0")
        if obj.budget_hours == 0:
            return "0.00"
        return str((total / obj.budget_hours * 100).quantize(Decimal("0.01")))

    def get_progress_percent(self, obj: Project) -> str:
        latest = obj.health_snapshots.order_by("-timestamp").first()
        if latest:
            return str(latest.progress_percent)
        return "0.00"

    def get_actual_cost(self, obj: Project) -> str:
        total = obj.time_entries.aggregate(total=db_models.Sum("cost"))["total"]
        return str((total or Decimal("0.00")).quantize(Decimal("0.01")))

    def get_earned_value(self, obj: Project) -> str:
        latest = obj.health_snapshots.order_by("-timestamp").first()
        if latest:
            return str(latest.earned_value)
        return "0.00"

    def get_latest_snapshot(self, obj: Project) -> dict | None:
        latest = obj.health_snapshots.order_by("-timestamp").first()
        if latest:
            return HealthSnapshotSerializer(latest).data
        return None


class ClientProjectListSerializer(serializers.ModelSerializer):
    """Simplified project list for CLIENT users — no financial data."""

    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "code",
            "current_health_status",
            "progress_percent",
            "updated_at",
        ]

    def get_progress_percent(self, obj: Project) -> str:
        latest = obj.health_snapshots.order_by("-timestamp").first()
        if latest:
            return str(latest.progress_percent)
        return "0.00"


class ClientProjectDetailSerializer(serializers.ModelSerializer):
    """Detailed project view for CLIENT users — phases but no costs."""

    progress_percent = serializers.SerializerMethodField()
    phases = PhaseSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "code",
            "current_health_status",
            "progress_percent",
            "phases",
            "created_at",
            "updated_at",
        ]

    def get_progress_percent(self, obj: Project) -> str:
        latest = obj.health_snapshots.order_by("-timestamp").first()
        if latest:
            return str(latest.progress_percent)
        return "0.00"


class PhaseComparisonSerializer(serializers.Serializer):
    phase_name = serializers.CharField()
    estimated_hours = serializers.DecimalField(max_digits=10, decimal_places=2)
    actual_hours = serializers.DecimalField(max_digits=10, decimal_places=2)


class BurndownPointSerializer(serializers.Serializer):
    date = serializers.DateField()
    budget_line = serializers.DecimalField(max_digits=12, decimal_places=2)
    actual_cost_cumulative = serializers.DecimalField(max_digits=12, decimal_places=2)
    earned_value_cumulative = serializers.DecimalField(max_digits=12, decimal_places=2)


class PortfolioProjectSerializer(serializers.ModelSerializer):
    consumed_hours = serializers.SerializerMethodField()
    consumption_percent = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()
    deviation = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "code",
            "client_name",
            "current_health_status",
            "budget_hours",
            "consumed_hours",
            "consumption_percent",
            "progress_percent",
            "deviation",
        ]

    def get_consumed_hours(self, obj: Project) -> str:
        total = obj.time_entries.aggregate(total=db_models.Sum("duration_hours"))["total"]
        return str((total or Decimal("0")).quantize(Decimal("0.01")))

    def get_consumption_percent(self, obj: Project) -> str:
        total = obj.time_entries.aggregate(total=db_models.Sum("duration_hours"))["total"] or Decimal("0")
        if obj.budget_hours == 0:
            return "0.00"
        return str((total / obj.budget_hours * 100).quantize(Decimal("0.01")))

    def get_progress_percent(self, obj: Project) -> str:
        latest = obj.health_snapshots.order_by("-timestamp").first()
        if latest:
            return str(latest.progress_percent)
        return "0.00"

    def get_deviation(self, obj: Project) -> str:
        total = obj.time_entries.aggregate(total=db_models.Sum("duration_hours"))["total"] or Decimal("0")
        consumption = Decimal("0")
        if obj.budget_hours > 0:
            consumption = total / obj.budget_hours * 100

        latest = obj.health_snapshots.order_by("-timestamp").first()
        progress = latest.progress_percent if latest else Decimal("0")

        return str(abs(consumption - progress).quantize(Decimal("0.01")))


# --- Sprint & related serializers ---


class SprintTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SprintTask
        fields = ["id", "jira_key", "title", "assigned_to", "hours", "date"]


class AdvanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Advance
        fields = [
            "id", "sprint", "task_jira_key", "description",
            "status", "presented_by", "observations",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class SimpleChangeRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimpleChangeRequest
        fields = [
            "id", "sprint", "advance", "task_jira_key", "description",
            "status", "review_comments", "dragged_from_sprint",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ChangeRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChangeRequest
        fields = [
            "id", "sprint", "description", "detail", "status",
            "dependencies", "impact", "estimated_hours",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class SprintTimeEntrySerializer(serializers.ModelSerializer):
    """Lightweight serializer for time entries within a sprint."""

    class Meta:
        model = TimeEntry
        fields = ["id", "date", "duration_hours", "cost", "user_name", "description"]


class SprintDetailSerializer(serializers.ModelSerializer):
    tasks = SprintTaskSerializer(many=True, read_only=True)
    time_entries = SprintTimeEntrySerializer(many=True, read_only=True)
    advances = AdvanceSerializer(many=True, read_only=True)
    simple_changes = SimpleChangeRequestSerializer(many=True, read_only=True)
    change_requests = ChangeRequestSerializer(many=True, read_only=True)

    class Meta:
        model = Sprint
        fields = [
            "id", "name", "description", "status",
            "start_date", "end_date", "sort_order",
            "tasks", "time_entries", "advances", "simple_changes", "change_requests",
            "created_at",
        ]
