from decimal import Decimal

from django.db import models as db_models
from rest_framework import serializers

from .models import (
    Advance,
    BillingRole,
    ChangeRequest,
    ChangeRequestPhaseImpact,
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
    invoice_file_url = serializers.SerializerMethodField()
    cr_impact = serializers.SerializerMethodField()

    class Meta:
        model = Phase
        fields = [
            "id", "name", "estimated_hours", "actual_hours",
            "sort_order", "status", "progress_percent",
            "invoice_amount", "invoice_date", "is_paid",
            "invoice_file_url", "cr_impact",
        ]

    def get_actual_hours(self, obj: Phase) -> str:
        total = obj.time_entries.aggregate(total=db_models.Sum("duration_hours"))["total"]
        return str((total or Decimal("0")).quantize(Decimal("0.01")))

    def get_invoice_file_url(self, obj: Phase) -> str | None:
        if not obj.invoice_file:
            return None
        request = self.context.get("request")
        if request:
            try:
                return request.build_absolute_uri(obj.invoice_file.url)
            except Exception:
                pass
        return obj.invoice_file.url

    def get_cr_impact(self, obj: Phase) -> dict:
        """Aggregate CR impact data for accepted/active CRs affecting this phase."""
        impacts = ChangeRequestPhaseImpact.objects.filter(
            phase=obj,
            change_request__status__in=[
                "accepted", "to_start", "in_process",
                "pending_acceptance", "completed",
            ],
        ).select_related("change_request")

        items = []
        total_hours = Decimal("0")
        total_charged = Decimal("0")
        total_absorbed = Decimal("0")

        # Derive hourly rate from project
        project = obj.project
        consumed = project.time_entries.aggregate(
            total=db_models.Sum("duration_hours")
        )["total"] or Decimal("0")
        actual_cost = project.time_entries.aggregate(
            total=db_models.Sum("cost")
        )["total"] or Decimal("0")
        hourly_rate = (actual_cost / consumed) if consumed > 0 else Decimal("500")

        for imp in impacts:
            cr = imp.change_request
            hrs = imp.estimated_hours or Decimal("0")
            cost = hrs * hourly_rate
            total_hours += hrs

            if cr.is_charged:
                charged = cr.charged_amount if cr.charged_amount else cost
                total_charged += charged
            else:
                total_absorbed += cost

            items.append({
                "cr_id": cr.id,
                "description": cr.description,
                "status": cr.status,
                "estimated_hours": str(hrs.quantize(Decimal("0.01"))),
                "is_charged": cr.is_charged,
                "charged_amount": str(
                    (cr.charged_amount or Decimal("0")).quantize(Decimal("0.01"))
                ),
            })

        return {
            "items": items,
            "total_hours": str(total_hours.quantize(Decimal("0.01"))),
            "total_charged": str(total_charged.quantize(Decimal("0.01"))),
            "total_absorbed": str(total_absorbed.quantize(Decimal("0.01"))),
            "count": len(items),
        }


class PhaseUpdateSerializer(serializers.ModelSerializer):
    """Writable serializer for phase invoice fields only."""

    clear_invoice_file = serializers.BooleanField(required=False, default=False)

    class Meta:
        model = Phase
        fields = [
            "id", "invoice_amount", "invoice_date", "is_paid",
            "invoice_file", "clear_invoice_file",
        ]
        read_only_fields = ["id"]

    def validate_invoice_file(self, value):
        if value and not value.name.lower().endswith(".pdf"):
            raise serializers.ValidationError("Solo se permiten archivos PDF.")
        if value and value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("El archivo no puede exceder 10 MB.")
        return value

    def update(self, instance, validated_data):
        clear_file = validated_data.pop("clear_invoice_file", False)
        if clear_file and instance.invoice_file:
            instance.invoice_file.delete(save=False)
            validated_data["invoice_file"] = None
        return super().update(instance, validated_data)


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
    anticipo_file_url = serializers.SerializerMethodField()
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
            "anticipo_amount",
            "anticipo_date",
            "anticipo_file_url",
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

    def get_anticipo_file_url(self, obj: Project) -> str | None:
        if not obj.anticipo_file:
            return None
        request = self.context.get("request")
        if request:
            try:
                return request.build_absolute_uri(obj.anticipo_file.url)
            except Exception:
                pass
        return obj.anticipo_file.url

    def get_latest_snapshot(self, obj: Project) -> dict | None:
        latest = obj.health_snapshots.order_by("-timestamp").first()
        if latest:
            return HealthSnapshotSerializer(latest).data
        return None


class AnticipoUpdateSerializer(serializers.Serializer):
    """Writable serializer para registrar/actualizar el anticipo."""

    anticipo_amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=True
    )
    anticipo_date = serializers.DateField(required=True)
    anticipo_file = serializers.FileField(required=False)
    clear_anticipo_file = serializers.BooleanField(required=False, default=False)

    def validate_anticipo_file(self, value):
        if value and not value.name.lower().endswith(".pdf"):
            raise serializers.ValidationError("Solo se permiten archivos PDF.")
        if value and value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("El archivo no puede exceder 10 MB.")
        return value

    def validate_anticipo_amount(self, value):
        if value <= Decimal("0"):
            raise serializers.ValidationError("El monto debe ser mayor a cero.")
        return value


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


class ChangeRequestPhaseImpactSerializer(serializers.ModelSerializer):
    phase_name = serializers.CharField(source="phase.name", read_only=True)
    phase_sort_order = serializers.IntegerField(source="phase.sort_order", read_only=True)

    class Meta:
        model = ChangeRequestPhaseImpact
        fields = ["id", "phase", "phase_name", "phase_sort_order", "estimated_hours"]


class ChangeRequestSerializer(serializers.ModelSerializer):
    phase_impacts = ChangeRequestPhaseImpactSerializer(many=True, read_only=True)

    class Meta:
        model = ChangeRequest
        fields = [
            "id", "sprint", "description", "detail", "status",
            "dependencies", "impact", "estimated_hours",
            "is_charged", "charged_amount", "phase_impacts",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ChangeRequestWriteSerializer(serializers.ModelSerializer):
    """Writable serializer that accepts nested phase_impacts on create/update."""

    phase_impacts = serializers.ListField(
        child=serializers.DictField(), required=False, write_only=True
    )

    class Meta:
        model = ChangeRequest
        fields = [
            "sprint", "description", "detail", "status",
            "dependencies", "impact", "estimated_hours",
            "is_charged", "charged_amount", "phase_impacts",
        ]

    def create(self, validated_data):
        impacts_data = validated_data.pop("phase_impacts", [])
        cr = super().create(validated_data)
        for impact in impacts_data:
            ChangeRequestPhaseImpact.objects.create(
                change_request=cr,
                phase_id=impact["phase"],
                estimated_hours=impact["estimated_hours"],
            )
        return cr

    def update(self, instance, validated_data):
        impacts_data = validated_data.pop("phase_impacts", None)
        cr = super().update(instance, validated_data)
        if impacts_data is not None:
            cr.phase_impacts.all().delete()
            for impact in impacts_data:
                ChangeRequestPhaseImpact.objects.create(
                    change_request=cr,
                    phase_id=impact["phase"],
                    estimated_hours=impact["estimated_hours"],
                )
        return cr


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
