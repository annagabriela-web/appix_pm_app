from rest_framework import serializers

from .models import SyncLog


class SyncLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SyncLog
        fields = [
            "id",
            "sync_type",
            "started_at",
            "finished_at",
            "status",
            "entries_synced",
            "error_message",
        ]
        read_only_fields = fields


class SyncTriggerSerializer(serializers.Serializer):
    sync_type = serializers.ChoiceField(choices=["clockify", "jira"])
