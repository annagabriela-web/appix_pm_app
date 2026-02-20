from django.contrib import admin
from django.utils.html import format_html

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


class PhaseInline(admin.TabularInline):
    model = Phase
    extra = 1


class ProjectRoleRateInline(admin.TabularInline):
    model = ProjectRoleRate
    extra = 1


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = [
        "code",
        "name",
        "client_name",
        "budget_hours",
        "health_status_badge",
        "updated_at",
    ]
    list_filter = ["current_health_status"]
    search_fields = ["name", "code", "client_name"]
    readonly_fields = ["current_health_status", "anticipo_amount", "anticipo_date", "created_at", "updated_at"]
    inlines = [PhaseInline, ProjectRoleRateInline]

    @admin.display(description="Health Status")
    def health_status_badge(self, obj: Project) -> str:
        colors = {
            "CRITICAL": "#EF4444",
            "WARNING": "#F59E0B",
            "HEALTHY": "#10B981",
        }
        color = colors.get(obj.current_health_status, "#64748B")
        return format_html(
            '<span style="background-color:{}; color:white; padding:3px 10px; '
            'border-radius:12px; font-size:11px; font-weight:bold;">{}</span>',
            color,
            obj.current_health_status,
        )


@admin.register(BillingRole)
class BillingRoleAdmin(admin.ModelAdmin):
    list_display = ["role_name", "default_hourly_rate"]


@admin.register(TimeEntry)
class TimeEntryAdmin(admin.ModelAdmin):
    list_display = [
        "project",
        "user_name",
        "phase",
        "duration_hours",
        "cost",
        "date",
    ]
    list_filter = ["project", "date", "phase"]
    search_fields = ["user_name", "user_email", "description"]
    readonly_fields = ["clockify_id", "synced_at"]


@admin.register(HealthSnapshot)
class HealthSnapshotAdmin(admin.ModelAdmin):
    list_display = [
        "project",
        "timestamp",
        "consumption_percent",
        "progress_percent",
        "health_status",
        "health_score",
    ]
    list_filter = ["project", "health_status"]
    readonly_fields = [
        "project",
        "timestamp",
        "consumption_percent",
        "progress_percent",
        "budget_consumed",
        "earned_value",
        "health_status",
        "health_score",
    ]


@admin.register(ProjectHealthAlert)
class ProjectHealthAlertAdmin(admin.ModelAdmin):
    list_display = ["project", "alert_type", "is_read", "created_at"]
    list_filter = ["is_read", "alert_type", "project"]
    actions = ["mark_as_read"]

    @admin.action(description="Marcar como leidas")
    def mark_as_read(self, request, queryset):  # type: ignore[no-untyped-def]
        queryset.update(is_read=True)


# --- Sprint Management ---


class SprintTaskInline(admin.TabularInline):
    model = SprintTask
    extra = 0


class AdvanceInline(admin.TabularInline):
    model = Advance
    extra = 0
    readonly_fields = ["created_at", "updated_at"]


class SimpleChangeRequestInline(admin.TabularInline):
    model = SimpleChangeRequest
    fk_name = "sprint"
    extra = 0
    readonly_fields = ["created_at", "updated_at"]


class ChangeRequestInline(admin.TabularInline):
    model = ChangeRequest
    extra = 0
    fields = ["description", "status", "estimated_hours", "is_charged", "charged_amount", "created_at"]
    readonly_fields = ["created_at"]


@admin.register(Sprint)
class SprintAdmin(admin.ModelAdmin):
    list_display = ["name", "project", "status", "start_date", "end_date", "sort_order"]
    list_filter = ["status", "project"]
    search_fields = ["name", "project__name"]
    inlines = [SprintTaskInline, AdvanceInline, SimpleChangeRequestInline, ChangeRequestInline]


@admin.register(SprintTask)
class SprintTaskAdmin(admin.ModelAdmin):
    list_display = ["jira_key", "sprint", "title", "assigned_to", "hours", "date"]
    list_filter = ["sprint", "assigned_to"]
    search_fields = ["jira_key", "title"]


@admin.register(Advance)
class AdvanceAdmin(admin.ModelAdmin):
    list_display = ["task_jira_key", "sprint", "status", "presented_by", "created_at"]
    list_filter = ["status", "sprint"]
    search_fields = ["task_jira_key", "description"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(SimpleChangeRequest)
class SimpleChangeRequestAdmin(admin.ModelAdmin):
    list_display = ["task_jira_key", "sprint", "status", "dragged_from_sprint", "created_at"]
    list_filter = ["status", "sprint"]
    search_fields = ["task_jira_key", "description"]
    readonly_fields = ["created_at", "updated_at"]


class ChangeRequestPhaseImpactInline(admin.TabularInline):
    model = ChangeRequestPhaseImpact
    extra = 1


@admin.register(ChangeRequest)
class ChangeRequestAdmin(admin.ModelAdmin):
    list_display = ["description", "sprint", "status", "estimated_hours", "is_charged", "charged_amount", "created_at"]
    list_filter = ["status", "is_charged", "sprint"]
    search_fields = ["description", "detail"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [ChangeRequestPhaseImpactInline]
