from django.contrib import admin

from .models import SyncLog


@admin.register(SyncLog)
class SyncLogAdmin(admin.ModelAdmin):
    list_display = ["sync_type", "started_at", "finished_at", "status", "entries_synced"]
    list_filter = ["sync_type", "status"]
    readonly_fields = [
        "sync_type",
        "started_at",
        "finished_at",
        "status",
        "entries_synced",
        "error_message",
    ]
