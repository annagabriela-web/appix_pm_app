from django.urls import path

from . import views

app_name = "reports"

urlpatterns = [
    path(
        "projects/<int:project_id>/pdf/",
        views.export_project_pdf,
        name="project-pdf",
    ),
    path(
        "projects/<int:project_id>/excel/",
        views.export_project_excel,
        name="project-excel",
    ),
]
