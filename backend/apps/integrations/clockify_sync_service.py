import logging
from datetime import datetime, timedelta
from decimal import Decimal

from django.utils import timezone

from apps.finance.models import (
    BillingRole,
    Phase,
    Project,
    ProjectRoleRate,
    TimeEntry,
)

from .clockify_client import ClockifyClient
from .models import SyncLog

logger = logging.getLogger(__name__)

QUANTIZE = Decimal("0.01")


class ClockifySyncService:
    """
    Servicio de sincronizacion Clockify -> Base de datos local.

    Flujo:
    1. Obtiene time entries desde la ultima sync exitosa
    2. Para cada entry: mapea proyecto, fase, rol, calcula costo
    3. Upsert por clockify_id (crear o actualizar)
    """

    def __init__(self) -> None:
        self.client = ClockifyClient()

    def get_last_sync_time(self) -> datetime | None:
        """Obtener timestamp de la ultima sync exitosa."""
        last_log = (
            SyncLog.objects.filter(sync_type="clockify", status="success")
            .order_by("-started_at")
            .first()
        )
        if last_log and last_log.finished_at:
            return last_log.finished_at
        return None

    def _get_hourly_rate(self, project: Project, role: BillingRole | None) -> Decimal:
        """Obtener tarifa horaria: override de proyecto o default del rol."""
        if role is None:
            return Decimal("0.00")

        project_rate = ProjectRoleRate.objects.filter(
            project=project, billing_role=role
        ).first()

        if project_rate:
            return project_rate.hourly_rate
        return role.default_hourly_rate

    def _map_tags_to_phase(
        self, tags: list[dict[str, str]], project: Project
    ) -> Phase | None:
        """Mapear Clockify Tags a una Phase del proyecto."""
        for tag in tags:
            tag_name = tag.get("name", "")
            phase = Phase.objects.filter(project=project, name__iexact=tag_name).first()
            if phase:
                return phase
        return None

    def _map_user_to_role(self, user_email: str) -> BillingRole | None:
        """Mapear usuario a un BillingRole (por convencion o mapping futuro)."""
        # Default: retorna el primer BillingRole disponible
        # En produccion, esto se extendera con un mapping user -> role
        return BillingRole.objects.first()

    def _parse_duration_to_hours(self, duration_str: str) -> Decimal:
        """Convertir duracion ISO 8601 (PT1H30M) a horas decimales."""
        if not duration_str:
            return Decimal("0")

        hours = Decimal("0")
        duration_str = duration_str.replace("PT", "")

        if "H" in duration_str:
            h_part, duration_str = duration_str.split("H")
            hours += Decimal(h_part)

        if "M" in duration_str:
            m_part, duration_str = duration_str.split("M")
            hours += Decimal(m_part) / Decimal("60")

        if "S" in duration_str:
            s_part = duration_str.replace("S", "")
            hours += Decimal(s_part) / Decimal("3600")

        return hours.quantize(Decimal("0.0001"))

    def sync_all_projects(self) -> int:
        """
        Sincronizar time entries de todos los proyectos vinculados.

        Returns:
            Numero total de entries sincronizadas.
        """
        sync_log = SyncLog.objects.create(sync_type="clockify")
        total_synced = 0

        try:
            last_sync = self.get_last_sync_time()
            start_date = None
            if last_sync:
                start_date = (last_sync - timedelta(hours=2)).isoformat() + "Z"

            users = self.client.fetch_users()
            projects_with_clockify = Project.objects.exclude(clockify_project_id="")

            project_map = {
                p.clockify_project_id: p for p in projects_with_clockify
            }

            for user in users:
                user_id = user["id"]
                user_name = user.get("name", "Unknown")
                user_email = user.get("email", "")

                entries = self.client.fetch_all_time_entries(
                    user_id=user_id,
                    start=start_date,
                )

                for entry in entries:
                    project_id = entry.get("projectId", "")
                    if project_id not in project_map:
                        continue

                    project = project_map[project_id]
                    tags = entry.get("tags", [])
                    phase = self._map_tags_to_phase(tags, project)
                    role = self._map_user_to_role(user_email)
                    hourly_rate = self._get_hourly_rate(project, role)

                    duration_str = entry.get("timeInterval", {}).get("duration", "")
                    duration_hours = self._parse_duration_to_hours(duration_str)
                    cost = (duration_hours * hourly_rate).quantize(QUANTIZE)

                    start_str = entry.get("timeInterval", {}).get("start", "")
                    entry_date = (
                        datetime.fromisoformat(start_str.replace("Z", "+00:00")).date()
                        if start_str
                        else timezone.now().date()
                    )

                    TimeEntry.objects.update_or_create(
                        clockify_id=entry["id"],
                        defaults={
                            "project": project,
                            "phase": phase,
                            "billing_role": role,
                            "user_name": user_name,
                            "user_email": user_email,
                            "description": entry.get("description", ""),
                            "duration_hours": duration_hours,
                            "cost": cost,
                            "date": entry_date,
                        },
                    )
                    total_synced += 1

            sync_log.status = "success"
            sync_log.entries_synced = total_synced

        except Exception as e:
            logger.exception("Error syncing Clockify: %s", e)
            sync_log.status = "error"
            sync_log.error_message = str(e)

        finally:
            sync_log.finished_at = timezone.now()
            sync_log.save()

        return total_synced
