import logging
from decimal import Decimal
from typing import Any

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

QUANTIZE = Decimal("0.01")


class JiraClient:
    """Cliente para la API de Jira."""

    def __init__(self) -> None:
        self.base_url = settings.JIRA_BASE_URL.rstrip("/")
        self.session = requests.Session()
        self.session.auth = (settings.JIRA_USER_EMAIL, settings.JIRA_API_TOKEN)
        self.session.headers.update(
            {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        )

    def _get(self, endpoint: str, params: dict[str, Any] | None = None) -> Any:
        """GET request with error handling."""
        url = f"{self.base_url}{endpoint}"
        response = self.session.get(url, params=params, timeout=30)
        response.raise_for_status()
        return response.json()

    def fetch_project_progress(self, jira_project_key: str) -> Decimal:
        """
        Calcular progreso del proyecto basado en Story Points.

        progress_percent = (story_points_done / story_points_total) * 100

        Busca todos los issues del proyecto y suma story points por status.
        """
        jql = f"project = {jira_project_key}"

        total_points = Decimal("0")
        done_points = Decimal("0")
        start_at = 0
        max_results = 100

        while True:
            result = self._get(
                "/rest/api/3/search",
                params={
                    "jql": jql,
                    "startAt": start_at,
                    "maxResults": max_results,
                    "fields": "status,customfield_10016",  # story points
                },
            )

            issues = result.get("issues", [])
            for issue in issues:
                fields = issue.get("fields", {})
                story_points = fields.get("customfield_10016")
                if story_points is not None:
                    sp = Decimal(str(story_points))
                    total_points += sp

                    status_category = (
                        fields.get("status", {})
                        .get("statusCategory", {})
                        .get("key", "")
                    )
                    if status_category == "done":
                        done_points += sp

            if start_at + max_results >= result.get("total", 0):
                break
            start_at += max_results

        if total_points == 0:
            return Decimal("0")

        return (done_points / total_points * 100).quantize(QUANTIZE)

    def fetch_sprint_data(self, jira_project_key: str) -> dict[str, Any]:
        """Obtener datos del sprint activo del proyecto."""
        boards = self._get(
            "/rest/agile/1.0/board",
            params={"projectKeyOrId": jira_project_key},
        )

        board_list = boards.get("values", [])
        if not board_list:
            return {"active_sprint": None, "issues": []}

        board_id = board_list[0]["id"]

        sprints = self._get(
            f"/rest/agile/1.0/board/{board_id}/sprint",
            params={"state": "active"},
        )

        sprint_list = sprints.get("values", [])
        if not sprint_list:
            return {"active_sprint": None, "issues": []}

        active_sprint = sprint_list[0]
        sprint_id = active_sprint["id"]

        sprint_issues = self._get(
            f"/rest/agile/1.0/sprint/{sprint_id}/issue",
            params={"fields": "status,summary,customfield_10016"},
        )

        return {
            "active_sprint": active_sprint,
            "issues": sprint_issues.get("issues", []),
        }
