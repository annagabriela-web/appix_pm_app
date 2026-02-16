from datetime import timedelta
from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from .models import (
    BillingRole,
    HealthSnapshot,
    Phase,
    Project,
    ProjectHealthAlert,
    TimeEntry,
)
from .serializers import (
    AlertSerializer,
    BillingRoleSerializer,
    BurndownPointSerializer,
    HealthSnapshotSerializer,
    PhaseComparisonSerializer,
    PortfolioProjectSerializer,
    ProjectDetailSerializer,
    ProjectListSerializer,
)

QUANTIZE = Decimal("0.01")


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para proyectos con endpoints financieros adicionales."""

    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["current_health_status"]
    ordering_fields = ["name", "code", "updated_at"]

    def get_queryset(self):  # type: ignore[no-untyped-def]
        return Project.objects.all()

    def get_serializer_class(self):  # type: ignore[no-untyped-def]
        if self.action == "retrieve":
            return ProjectDetailSerializer
        return ProjectListSerializer

    @action(detail=True, methods=["get"], url_path="burndown")
    def burndown(self, request: Request, pk: int | None = None) -> Response:
        """
        GET /api/v1/finance/projects/{id}/burndown/
        Genera serie temporal para Financial Burndown Chart.
        """
        project = self.get_object()

        # Obtener rango de fechas de time entries
        first_entry = project.time_entries.order_by("date").first()
        if not first_entry:
            return Response([])

        start_date = first_entry.date
        end_date = timezone.now().date()
        total_days = (end_date - start_date).days or 1

        # Budget line: proyeccion lineal
        daily_budget = project.client_invoice_amount / total_days

        # Calcular costos acumulados por dia
        points = []
        current_date = start_date
        cumulative_cost = Decimal("0.00")

        while current_date <= end_date:
            day_cost = (
                project.time_entries.filter(date=current_date).aggregate(
                    total=Sum("cost")
                )["total"]
                or Decimal("0.00")
            )
            cumulative_cost += day_cost

            days_elapsed = (current_date - start_date).days + 1
            budget_line = (daily_budget * days_elapsed).quantize(QUANTIZE)

            # Earned value from closest snapshot
            snapshot = (
                project.health_snapshots.filter(
                    timestamp__date__lte=current_date
                )
                .order_by("-timestamp")
                .first()
            )
            ev = snapshot.earned_value if snapshot else Decimal("0.00")

            points.append(
                {
                    "date": current_date,
                    "budget_line": budget_line,
                    "actual_cost_cumulative": cumulative_cost.quantize(QUANTIZE),
                    "earned_value_cumulative": ev,
                }
            )
            current_date += timedelta(days=1)

        serializer = BurndownPointSerializer(points, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="phase-comparison")
    def phase_comparison(self, request: Request, pk: int | None = None) -> Response:
        """
        GET /api/v1/finance/projects/{id}/phase-comparison/
        Comparacion Estimado vs Real por fase.
        """
        project = self.get_object()
        phases = project.phases.all()

        data = []
        for phase in phases:
            actual = (
                phase.time_entries.aggregate(total=Sum("duration_hours"))["total"]
                or Decimal("0")
            )
            data.append(
                {
                    "phase_name": phase.name,
                    "estimated_hours": phase.estimated_hours,
                    "actual_hours": actual.quantize(QUANTIZE),
                }
            )

        serializer = PhaseComparisonSerializer(data, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="health-history")
    def health_history(self, request: Request, pk: int | None = None) -> Response:
        """
        GET /api/v1/finance/projects/{id}/health-history/
        Historial de snapshots de salud.
        """
        project = self.get_object()
        snapshots = project.health_snapshots.all()
        serializer = HealthSnapshotSerializer(snapshots, many=True)
        return Response(serializer.data)


class BillingRoleViewSet(viewsets.ModelViewSet):
    """CRUD completo para BillingRoles."""

    queryset = BillingRole.objects.all()
    serializer_class = BillingRoleSerializer
    permission_classes = [IsAuthenticated]


class AlertViewSet(viewsets.ModelViewSet):
    """ViewSet para alertas con accion de marcar como leida."""

    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_read", "alert_type"]
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):  # type: ignore[no-untyped-def]
        return ProjectHealthAlert.objects.all()

    @action(detail=True, methods=["patch"], url_path="read")
    def mark_read(self, request: Request, pk: int | None = None) -> Response:
        """PATCH /api/v1/finance/alerts/{id}/read/ - Marcar como leida."""
        alert = self.get_object()
        alert.is_read = True
        alert.save(update_fields=["is_read"])
        return Response(AlertSerializer(alert).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def portfolio_view(request: Request) -> Response:
    """GET /api/v1/finance/portfolio/ - Vista resumen de todos los proyectos."""
    projects = Project.objects.all()
    serializer = PortfolioProjectSerializer(projects, many=True)
    return Response(serializer.data)
