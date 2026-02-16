import logging
from typing import Any

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class ClockifyClient:
    """Cliente HTTP para la API de Clockify."""

    def __init__(self) -> None:
        self.base_url = settings.CLOCKIFY_BASE_URL
        self.workspace_id = settings.CLOCKIFY_WORKSPACE_ID
        self.session = requests.Session()
        self.session.headers.update(
            {
                "X-Api-Key": settings.CLOCKIFY_API_KEY,
                "Content-Type": "application/json",
            }
        )

    def _get(self, endpoint: str, params: dict[str, Any] | None = None) -> Any:
        """GET request with error handling."""
        url = f"{self.base_url}{endpoint}"
        response = self.session.get(url, params=params, timeout=30)
        response.raise_for_status()
        return response.json()

    def fetch_projects(self) -> list[dict[str, Any]]:
        """Obtener lista de proyectos del workspace."""
        return self._get(
            f"/workspaces/{self.workspace_id}/projects",
            params={"page-size": 500},
        )

    def fetch_time_entries(
        self,
        user_id: str,
        start: str | None = None,
        end: str | None = None,
        project_id: str | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> list[dict[str, Any]]:
        """
        Obtener time entries de un usuario.

        Args:
            user_id: ID del usuario en Clockify.
            start: Fecha inicio ISO 8601 (optional).
            end: Fecha fin ISO 8601 (optional).
            project_id: Filtrar por proyecto (optional).
            page: Numero de pagina.
            page_size: Tamanio de pagina (max 200).
        """
        params: dict[str, Any] = {
            "page": page,
            "page-size": page_size,
        }
        if start:
            params["start"] = start
        if end:
            params["end"] = end
        if project_id:
            params["project"] = project_id

        return self._get(
            f"/workspaces/{self.workspace_id}/user/{user_id}/time-entries",
            params=params,
        )

    def fetch_all_time_entries(
        self,
        user_id: str,
        start: str | None = None,
        end: str | None = None,
        project_id: str | None = None,
    ) -> list[dict[str, Any]]:
        """Obtener TODAS las time entries paginando automaticamente."""
        all_entries: list[dict[str, Any]] = []
        page = 1
        page_size = 200

        while True:
            entries = self.fetch_time_entries(
                user_id=user_id,
                start=start,
                end=end,
                project_id=project_id,
                page=page,
                page_size=page_size,
            )
            all_entries.extend(entries)

            if len(entries) < page_size:
                break
            page += 1

        return all_entries

    def fetch_users(self) -> list[dict[str, Any]]:
        """Obtener lista de usuarios del workspace."""
        return self._get(
            f"/workspaces/{self.workspace_id}/users",
            params={"page-size": 500},
        )
