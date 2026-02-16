import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def sync_clockify_time_entries(self):  # type: ignore[no-untyped-def]
    """
    Tarea programada cada hora via Celery Beat.
    Sincroniza time entries de Clockify para todos los proyectos vinculados.
    """
    from .clockify_sync_service import ClockifySyncService

    try:
        service = ClockifySyncService()
        total = service.sync_all_projects()
        logger.info("Clockify sync completed: %d entries synced", total)
        return {"status": "success", "entries_synced": total}
    except Exception as exc:
        logger.exception("Clockify sync failed: %s", exc)
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def sync_jira_progress(self):  # type: ignore[no-untyped-def]
    """
    Obtener progreso de Jira para todos los proyectos vinculados.
    Se ejecuta 5 min despues de sync de Clockify.
    """
    from decimal import Decimal

    from django.utils import timezone

    from apps.finance.models import Project

    from .jira_client import JiraClient
    from .models import SyncLog

    sync_log = SyncLog.objects.create(sync_type="jira")

    try:
        client = JiraClient()
        projects = Project.objects.exclude(jira_project_key="")
        synced = 0

        for project in projects:
            progress = client.fetch_project_progress(project.jira_project_key)
            # Store progress temporarily as a tag on the sync log
            # The evaluate task will use HealthSnapshot for actual storage
            logger.info(
                "Jira progress for %s: %s%%", project.code, progress
            )
            synced += 1

        sync_log.status = "success"
        sync_log.entries_synced = synced
        sync_log.finished_at = timezone.now()
        sync_log.save()

        return {"status": "success", "projects_synced": synced}

    except Exception as exc:
        logger.exception("Jira sync failed: %s", exc)
        sync_log.status = "error"
        sync_log.error_message = str(exc)
        sync_log.finished_at = timezone.now()
        sync_log.save()
        raise self.retry(exc=exc)


@shared_task
def evaluate_all_projects_health():  # type: ignore[no-untyped-def]
    """
    Combina datos de Clockify (consumo) y Jira (progreso) para
    ejecutar TripleAxisService.run_evaluation() en cada proyecto activo.
    """
    from decimal import Decimal

    from apps.finance.models import Project
    from apps.finance.services import TripleAxisService

    from .jira_client import JiraClient

    client = JiraClient()
    projects = Project.objects.exclude(jira_project_key="")
    evaluated = 0

    for project in projects:
        try:
            progress = client.fetch_project_progress(project.jira_project_key)
            TripleAxisService.run_evaluation(project, progress)
            evaluated += 1
            logger.info(
                "Health evaluated for %s: %s",
                project.code,
                project.current_health_status,
            )
        except Exception:
            logger.exception("Failed to evaluate health for %s", project.code)

    return {"status": "success", "projects_evaluated": evaluated}
