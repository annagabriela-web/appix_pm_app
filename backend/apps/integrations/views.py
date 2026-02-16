from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from .models import SyncLog
from .serializers import SyncLogSerializer
from .tasks import (
    evaluate_all_projects_health,
    sync_clockify_time_entries,
    sync_jira_progress,
)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def trigger_sync(request: Request) -> Response:
    """Forzar sincronizacion manual."""
    sync_type = request.data.get("sync_type", "clockify")

    if sync_type == "clockify":
        sync_clockify_time_entries.delay()
    elif sync_type == "jira":
        sync_jira_progress.delay()
    elif sync_type == "evaluate":
        evaluate_all_projects_health.delay()
    else:
        return Response(
            {"detail": "Invalid sync_type. Use: clockify, jira, evaluate"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {"detail": f"Sync '{sync_type}' triggered successfully."},
        status=status.HTTP_202_ACCEPTED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sync_status(request: Request) -> Response:
    """Obtener estado de las ultimas sincronizaciones."""
    latest_clockify = (
        SyncLog.objects.filter(sync_type="clockify").order_by("-started_at").first()
    )
    latest_jira = (
        SyncLog.objects.filter(sync_type="jira").order_by("-started_at").first()
    )

    data = {
        "clockify": SyncLogSerializer(latest_clockify).data if latest_clockify else None,
        "jira": SyncLogSerializer(latest_jira).data if latest_jira else None,
    }

    return Response(data)
