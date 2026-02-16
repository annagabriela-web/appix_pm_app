from django.db import models


class SyncLog(models.Model):
    """Registro de cada ejecucion de sincronizacion."""

    SYNC_TYPES = [
        ("clockify", "Clockify"),
        ("jira", "Jira"),
    ]
    STATUS_CHOICES = [
        ("success", "Success"),
        ("error", "Error"),
        ("partial", "Partial"),
    ]

    sync_type = models.CharField(max_length=20, choices=SYNC_TYPES)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="success")
    entries_synced = models.IntegerField(default=0)
    error_message = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-started_at"]

    def __str__(self) -> str:
        return f"{self.sync_type} | {self.started_at:%Y-%m-%d %H:%M} | {self.status}"
