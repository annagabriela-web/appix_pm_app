import io
from decimal import Decimal

from django.db.models import Sum
from django.template.loader import render_to_string
from weasyprint import HTML

from apps.finance.models import Project
from apps.finance.services import TripleAxisService


def generate_project_pdf(project: Project) -> bytes:
    """
    Genera un reporte PDF del proyecto con resumen ejecutivo y metricas.

    Returns:
        bytes del PDF generado.
    """
    consumed_hours = TripleAxisService.calculate_consumed_hours(project)
    consumption_pct = TripleAxisService.calculate_consumption_percent(project)
    actual_cost = TripleAxisService.calculate_actual_cost(project)

    latest_snapshot = project.health_snapshots.order_by("-timestamp").first()
    progress_pct = latest_snapshot.progress_percent if latest_snapshot else Decimal("0")
    earned_value = latest_snapshot.earned_value if latest_snapshot else Decimal("0")
    health_score = latest_snapshot.health_score if latest_snapshot else 50

    # Phase comparison data
    phases_data = []
    for phase in project.phases.all():
        actual = (
            phase.time_entries.aggregate(total=Sum("duration_hours"))["total"]
            or Decimal("0")
        )
        phases_data.append(
            {
                "name": phase.name,
                "estimated": phase.estimated_hours,
                "actual": actual,
                "deviation": actual - phase.estimated_hours,
            }
        )

    # Recent time entries
    recent_entries = project.time_entries.order_by("-date")[:20]

    context = {
        "project": project,
        "consumed_hours": consumed_hours,
        "consumption_pct": consumption_pct,
        "actual_cost": actual_cost,
        "progress_pct": progress_pct,
        "earned_value": earned_value,
        "health_score": health_score,
        "phases": phases_data,
        "recent_entries": recent_entries,
        "health_color": {
            "CRITICAL": "#EF4444",
            "WARNING": "#F59E0B",
            "HEALTHY": "#10B981",
        }.get(project.current_health_status, "#64748B"),
    }

    html_string = render_to_string("reports/project_report.html", context)
    pdf_buffer = io.BytesIO()
    HTML(string=html_string).write_pdf(pdf_buffer)

    return pdf_buffer.getvalue()
