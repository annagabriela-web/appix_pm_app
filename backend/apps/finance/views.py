from datetime import timedelta
from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.filters import OrderingFilter
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.request import Request
from rest_framework.response import Response

from apps.accounts.permissions import (
    CanManageBillingRoles,
    CanSeePortfolio,
    HasUserProfile,
    IsInternalUser,
)
from apps.accounts.querysets import get_alerts_for_user, get_projects_for_user

from .models import (
    Advance,
    BillingRole,
    ChangeRequest,
    HealthSnapshot,
    Phase,
    Project,
    ProjectHealthAlert,
    SimpleChangeRequest,
    TimeEntry,
)
from .serializers import (
    AdvanceSerializer,
    AlertSerializer,
    AnticipoUpdateSerializer,
    BillingRoleSerializer,
    BurndownPointSerializer,
    ChangeRequestSerializer,
    ChangeRequestWriteSerializer,
    ClientProjectDetailSerializer,
    ClientProjectListSerializer,
    HealthSnapshotSerializer,
    PhaseComparisonSerializer,
    PortfolioProjectSerializer,
    ProjectDetailSerializer,
    ProjectListSerializer,
    PhaseUpdateSerializer,
    SimpleChangeRequestSerializer,
    SprintDetailSerializer,
)
from .services import AnticipoCoverageService

QUANTIZE = Decimal("0.01")


def _is_client(user) -> bool:
    """Check if user has CLIENT role."""
    if user.is_superuser and not hasattr(user, "profile"):
        return False
    return hasattr(user, "profile") and user.profile.role == "CLIENT"


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para proyectos con endpoints financieros adicionales."""

    permission_classes = [HasUserProfile]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["current_health_status"]
    ordering_fields = ["name", "code", "updated_at"]

    def get_queryset(self):  # type: ignore[no-untyped-def]
        return get_projects_for_user(self.request.user)

    def get_serializer_class(self):  # type: ignore[no-untyped-def]
        if _is_client(self.request.user):
            if self.action == "retrieve":
                return ClientProjectDetailSerializer
            return ClientProjectListSerializer
        if self.action == "retrieve":
            return ProjectDetailSerializer
        return ProjectListSerializer

    @action(detail=True, methods=["get"], url_path="burndown")
    def burndown(self, request: Request, pk: int | None = None) -> Response:
        """
        GET /api/v1/finance/projects/{id}/burndown/
        Genera serie temporal para Financial Burndown Chart.
        Restricted to internal users only.
        """
        if _is_client(request.user):
            return Response(
                {"detail": "No tiene permisos para ver datos financieros."},
                status=status.HTTP_403_FORBIDDEN,
            )

        project = self.get_object()

        first_entry = project.time_entries.order_by("date").first()
        if not first_entry:
            return Response([])

        start_date = first_entry.date
        end_date = timezone.now().date()
        total_days = (end_date - start_date).days or 1

        daily_budget = project.client_invoice_amount / total_days

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
        if _is_client(request.user):
            return Response(
                {"detail": "No tiene permisos para ver datos financieros."},
                status=status.HTTP_403_FORBIDDEN,
            )

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
        if _is_client(request.user):
            return Response(
                {"detail": "No tiene permisos para ver datos financieros."},
                status=status.HTTP_403_FORBIDDEN,
            )

        project = self.get_object()
        snapshots = project.health_snapshots.all()
        serializer = HealthSnapshotSerializer(snapshots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="sprints")
    def sprints(self, request: Request, pk: int | None = None) -> Response:
        """GET /api/v1/finance/projects/{id}/sprints/"""
        project = self.get_object()
        qs = project.sprints.prefetch_related(
            "tasks", "time_entries", "advances", "simple_changes",
            "change_requests", "change_requests__phase_impacts__phase",
        ).all()
        serializer = SprintDetailSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="advances")
    def create_advance(self, request: Request, pk: int | None = None) -> Response:
        """POST /api/v1/finance/projects/{id}/advances/"""
        if _is_client(request.user):
            return Response(
                {"detail": "No permitido."},
                status=status.HTTP_403_FORBIDDEN,
            )
        project = self.get_object()
        serializer = AdvanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sprint_id = serializer.validated_data["sprint"].id
        if not project.sprints.filter(id=sprint_id).exists():
            return Response(
                {"detail": "Sprint no pertenece a este proyecto."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="change-requests")
    def create_change_request(self, request: Request, pk: int | None = None) -> Response:
        """POST /api/v1/finance/projects/{id}/change-requests/"""
        if _is_client(request.user):
            return Response(
                {"detail": "No permitido."},
                status=status.HTTP_403_FORBIDDEN,
            )
        project = self.get_object()
        serializer = ChangeRequestWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sprint_id = serializer.validated_data["sprint"].id
        if not project.sprints.filter(id=sprint_id).exists():
            return Response(
                {"detail": "Sprint no pertenece a este proyecto."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        cr = serializer.save()
        return Response(
            ChangeRequestSerializer(cr).data, status=status.HTTP_201_CREATED
        )

    @action(
        detail=True,
        methods=["patch"],
        url_path="anticipo",
        parser_classes=[MultiPartParser, JSONParser],
    )
    def update_anticipo(self, request: Request, pk: int | None = None) -> Response:
        """PATCH /api/v1/finance/projects/{id}/anticipo/"""
        if _is_client(request.user):
            return Response(
                {"detail": "No permitido."},
                status=status.HTTP_403_FORBIDDEN,
            )
        project = self.get_object()
        serializer = AnticipoUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        clear_file = serializer.validated_data.pop("clear_anticipo_file", False)
        if clear_file and project.anticipo_file:
            project.anticipo_file.delete(save=False)
            project.anticipo_file = None

        project.anticipo_amount = serializer.validated_data["anticipo_amount"]
        project.anticipo_date = serializer.validated_data["anticipo_date"]
        if "anticipo_file" in serializer.validated_data:
            project.anticipo_file = serializer.validated_data["anticipo_file"]
        project.save()

        AnticipoCoverageService.recompute(project)

        return Response(
            ProjectDetailSerializer(project, context={"request": request}).data
        )


class AdvanceViewSet(viewsets.GenericViewSet):
    """Review advances."""

    serializer_class = AdvanceSerializer
    permission_classes = [HasUserProfile, IsInternalUser]
    queryset = Advance.objects.all()

    @action(detail=True, methods=["patch"], url_path="review")
    def review(self, request: Request, pk: int | None = None) -> Response:
        """PATCH /api/v1/finance/advances/{id}/review/"""
        advance = self.get_object()
        new_status = request.data.get("status")
        if new_status not in ("pending", "accepted"):
            return Response(
                {"detail": "Estado invalido."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        advance.status = new_status
        advance.observations = request.data.get("observations", advance.observations)
        advance.save(update_fields=["status", "observations", "updated_at"])
        return Response(AdvanceSerializer(advance).data)


class SimpleChangeViewSet(viewsets.GenericViewSet):
    """Review simple change requests."""

    serializer_class = SimpleChangeRequestSerializer
    permission_classes = [HasUserProfile, IsInternalUser]
    queryset = SimpleChangeRequest.objects.all()

    @action(detail=True, methods=["patch"], url_path="review")
    def review(self, request: Request, pk: int | None = None) -> Response:
        """PATCH /api/v1/finance/simple-changes/{id}/review/"""
        change = self.get_object()
        new_status = request.data.get("status")
        valid = ("in_process", "pending_review", "accepted", "rejected")
        if new_status not in valid:
            return Response(
                {"detail": "Estado invalido."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        change.status = new_status
        change.review_comments = request.data.get(
            "review_comments", change.review_comments
        )
        change.save(update_fields=["status", "review_comments", "updated_at"])
        return Response(SimpleChangeRequestSerializer(change).data)


class ChangeRequestViewSet(viewsets.GenericViewSet):
    """Update change requests (status, charging, phase impacts)."""

    serializer_class = ChangeRequestWriteSerializer
    permission_classes = [HasUserProfile, IsInternalUser]
    queryset = ChangeRequest.objects.all()

    def partial_update(self, request: Request, pk: int | None = None) -> Response:
        """PATCH /api/v1/finance/change-requests/{id}/"""
        cr = self.get_object()
        serializer = ChangeRequestWriteSerializer(cr, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ChangeRequestSerializer(cr).data)


class PhaseViewSet(viewsets.GenericViewSet):
    """Update invoice fields on a project phase."""

    serializer_class = PhaseUpdateSerializer
    permission_classes = [HasUserProfile, IsInternalUser]
    parser_classes = [MultiPartParser, JSONParser]
    queryset = Phase.objects.select_related("project").all()

    def partial_update(self, request: Request, pk: int | None = None) -> Response:
        """PATCH /api/v1/finance/phases/{id}/"""
        from .serializers import PhaseSerializer

        phase = self.get_object()
        serializer = PhaseUpdateSerializer(phase, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(PhaseSerializer(phase, context={"request": request}).data)


class BillingRoleViewSet(viewsets.ModelViewSet):
    """CRUD completo para BillingRoles."""

    queryset = BillingRole.objects.all()
    serializer_class = BillingRoleSerializer
    permission_classes = [CanManageBillingRoles]


class AlertViewSet(viewsets.ModelViewSet):
    """ViewSet para alertas con accion de marcar como leida."""

    serializer_class = AlertSerializer
    permission_classes = [HasUserProfile, IsInternalUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_read", "alert_type"]
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):  # type: ignore[no-untyped-def]
        return get_alerts_for_user(self.request.user)

    @action(detail=True, methods=["patch"], url_path="read")
    def mark_read(self, request: Request, pk: int | None = None) -> Response:
        """PATCH /api/v1/finance/alerts/{id}/read/ - Marcar como leida."""
        alert = self.get_object()
        alert.is_read = True
        alert.save(update_fields=["is_read"])
        return Response(AlertSerializer(alert).data)


@api_view(["GET"])
@permission_classes([CanSeePortfolio])
def portfolio_view(request: Request) -> Response:
    """GET /api/v1/finance/portfolio/ - Vista resumen de todos los proyectos."""
    projects = get_projects_for_user(request.user)
    serializer = PortfolioProjectSerializer(projects, many=True)
    return Response(serializer.data)
