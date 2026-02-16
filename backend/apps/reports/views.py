from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request

from apps.finance.models import Project

from .excel_generator import generate_project_excel
from .pdf_generator import generate_project_pdf


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_project_pdf(request: Request, project_id: int) -> HttpResponse:
    """GET /api/v1/reports/projects/{id}/pdf/ -> Descarga PDF."""
    project = Project.objects.get(pk=project_id)
    pdf_bytes = generate_project_pdf(project)

    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = (
        f'attachment; filename="reporte-{project.code}.pdf"'
    )
    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_project_excel(request: Request, project_id: int) -> HttpResponse:
    """GET /api/v1/reports/projects/{id}/excel/ -> Descarga XLSX."""
    project = Project.objects.get(pk=project_id)
    excel_bytes = generate_project_excel(project)

    response = HttpResponse(
        excel_bytes,
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    response["Content-Disposition"] = (
        f'attachment; filename="reporte-{project.code}.xlsx"'
    )
    return response
