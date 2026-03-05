from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncMonth
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
    CanSeePersonal,
    CanSeePortfolio,
    HasUserProfile,
    IsInternalUser,
)
from apps.accounts.querysets import get_alerts_for_user, get_projects_for_user

from .models import (
    Advance,
    BillingRole,
    ChangeRequest,
    ChangeRequestPhaseImpact,
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


@api_view(["GET"])
@permission_classes([CanSeePortfolio])
def ceo_dashboard(request: Request) -> Response:
    """GET /api/v1/finance/ceo-dashboard/ - Dashboard ejecutivo agregado.

    Query params:
        date_from: YYYY-MM-DD — filter time entries from this date
        date_to:   YYYY-MM-DD — filter time entries up to this date
    """
    from datetime import date as date_type

    projects = get_projects_for_user(request.user)

    # Parse optional date filters
    date_from_str = request.query_params.get("date_from")
    date_to_str = request.query_params.get("date_to")
    date_from = None
    date_to = None
    try:
        if date_from_str:
            date_from = date_type.fromisoformat(date_from_str)
        if date_to_str:
            date_to = date_type.fromisoformat(date_to_str)
    except ValueError:
        pass

    # --- Revenue ---
    total_contracted = projects.aggregate(
        total=Sum("client_invoice_amount")
    )["total"] or Decimal("0")

    phases = Phase.objects.filter(project__in=projects)
    total_invoiced = phases.filter(
        invoice_amount__gt=0,
    ).aggregate(total=Sum("invoice_amount"))["total"] or Decimal("0")

    total_collected_phases = phases.filter(
        is_paid=True,
    ).aggregate(total=Sum("invoice_amount"))["total"] or Decimal("0")
    total_anticipos = projects.aggregate(
        total=Sum("anticipo_amount")
    )["total"] or Decimal("0")
    total_collected = total_collected_phases + total_anticipos

    collection_rate = (
        (total_collected / total_contracted * 100) if total_contracted > 0
        else Decimal("0")
    )

    # --- Costs ---
    entries = TimeEntry.objects.filter(project__in=projects)
    if date_from:
        entries = entries.filter(date__gte=date_from)
    if date_to:
        entries = entries.filter(date__lte=date_to)
    total_actual_cost = entries.aggregate(
        total=Sum("cost")
    )["total"] or Decimal("0")
    total_budget_hours = projects.aggregate(
        total=Sum("budget_hours")
    )["total"] or Decimal("0")
    total_consumed_hours = entries.aggregate(
        total=Sum("duration_hours")
    )["total"] or Decimal("0")
    overall_margin = (
        ((total_contracted - total_actual_cost) / total_contracted * 100)
        if total_contracted > 0 else Decimal("0")
    )
    target_margin_avg = Decimal("0")
    margin_projects = projects.filter(target_margin__gt=0)
    if margin_projects.exists():
        target_margin_avg = (
            margin_projects.aggregate(avg=Sum("target_margin"))["avg"]
            / margin_projects.count()
        )

    # CR absorbed cost
    absorbed_impacts = ChangeRequestPhaseImpact.objects.filter(
        phase__project__in=projects,
        change_request__is_charged=False,
        change_request__status__in=[
            "accepted", "to_start", "in_process",
            "pending_acceptance", "completed",
        ],
    )
    cr_absorbed_hours = absorbed_impacts.aggregate(
        total=Sum("estimated_hours")
    )["total"] or Decimal("0")
    effective_rate = (
        (total_actual_cost / total_consumed_hours) if total_consumed_hours > 0
        else Decimal("500")
    )
    cr_absorbed_cost = cr_absorbed_hours * effective_rate

    # --- Health ---
    health_counts = projects.values("current_health_status").annotate(
        count=Count("id")
    )
    health_map = {h["current_health_status"]: h["count"] for h in health_counts}

    at_risk_projects = []
    for p in projects.filter(current_health_status__in=["CRITICAL", "WARNING"]):
        consumed = p.time_entries.aggregate(
            total=Sum("duration_hours")
        )["total"] or Decimal("0")
        consumption_pct = (
            (consumed / p.budget_hours * 100) if p.budget_hours > 0
            else Decimal("0")
        )
        latest = p.health_snapshots.order_by("-timestamp").first()
        progress = latest.progress_percent if latest else Decimal("0")
        at_risk_projects.append({
            "id": p.id,
            "name": p.name,
            "code": p.code,
            "health_status": p.current_health_status,
            "consumption_percent": str(consumption_pct.quantize(QUANTIZE)),
            "progress_percent": str(progress),
            "deviation": str(abs(consumption_pct - progress).quantize(QUANTIZE)),
        })

    # --- Team utilization ---
    team_data = (
        entries.values("user_name")
        .annotate(
            hours=Sum("duration_hours"),
            cost=Sum("cost"),
            project_count=Count("project", distinct=True),
        )
        .order_by("-hours")
    )

    # --- Team utilization split (internal vs client) ---
    team_split_qs = (
        entries.values("user_name", "project__is_internal")
        .annotate(hours=Sum("duration_hours"))
        .order_by("user_name")
    )
    utilization_map: dict[str, dict[str, Decimal]] = {}
    for row in team_split_qs:
        name = row["user_name"]
        if name not in utilization_map:
            utilization_map[name] = {"internal": Decimal("0"), "client": Decimal("0")}
        key = "internal" if row["project__is_internal"] else "client"
        utilization_map[name][key] += row["hours"]

    team_utilization = [
        {
            "name": name,
            "internal_hours": str(hrs["internal"].quantize(QUANTIZE)),
            "client_hours": str(hrs["client"].quantize(QUANTIZE)),
        }
        for name, hrs in sorted(
            utilization_map.items(),
            key=lambda x: x[1]["internal"] + x[1]["client"],
            reverse=True,
        )
    ]

    # --- Team flow (person -> project, for Sankey) ---
    team_flow_qs = (
        entries.values("user_name", "project__name", "project__is_internal")
        .annotate(hours=Sum("duration_hours"))
        .order_by("-hours")
    )
    team_flow = [
        {
            "person": row["user_name"],
            "project": row["project__name"],
            "is_internal": row["project__is_internal"],
            "hours": str(row["hours"].quantize(QUANTIZE)),
        }
        for row in team_flow_qs
        if row["hours"] > 0
    ]

    # --- Top overbudget ---
    overbudget = []
    for p in projects.filter(budget_hours__gt=0):
        consumed = p.time_entries.aggregate(
            total=Sum("duration_hours")
        )["total"] or Decimal("0")
        if consumed > p.budget_hours:
            overage_pct = ((consumed - p.budget_hours) / p.budget_hours * 100)
            actual_cost = p.time_entries.aggregate(
                total=Sum("cost")
            )["total"] or Decimal("0")
            overbudget.append({
                "id": p.id,
                "name": p.name,
                "code": p.code,
                "budget_hours": str(p.budget_hours),
                "consumed_hours": str(consumed.quantize(QUANTIZE)),
                "overage_percent": str(overage_pct.quantize(QUANTIZE)),
                "actual_cost": str(actual_cost.quantize(QUANTIZE)),
                "contracted_amount": str(p.client_invoice_amount),
            })
    overbudget.sort(key=lambda x: float(x["overage_percent"]), reverse=True)

    # --- Invoice pipeline ---
    pipeline = []
    for phase in phases.filter(invoice_amount__gt=0).select_related("project").order_by(
        "project__name", "sort_order"
    ):
        pipeline.append({
            "project_id": phase.project_id,
            "project_name": phase.project.name,
            "phase_name": phase.name,
            "sort_order": phase.sort_order,
            "invoice_amount": str(phase.invoice_amount),
            "is_paid": phase.is_paid,
            "invoice_date": str(phase.invoice_date) if phase.invoice_date else None,
        })

    # --- Hour compliance heatmap (person x month) ---
    # Use date-filtered entries; if no filter, default to 2026-01+ (real data)
    compliance_entries = entries
    if not date_from and not date_to:
        from datetime import date as date_cls
        compliance_entries = entries.filter(date__gte=date_cls(2026, 1, 1))
    compliance_qs = (
        compliance_entries
        .annotate(month=TruncMonth("date"))
        .values("user_name", "month")
        .annotate(hours=Sum("duration_hours"))
        .order_by("user_name", "month")
    )
    hour_compliance = [
        {
            "name": row["user_name"],
            "month": row["month"].strftime("%Y-%m"),
            "hours": str(row["hours"].quantize(QUANTIZE)),
        }
        for row in compliance_qs
    ]

    # --- Development goals (task-level classification) ---
    from .classifiers import (
        classify_time_entry, is_hr_no_laboral, SUSPICIOUS_TASKS_RE,
        ALL_GOAL_CATEGORIES, GOAL_CATEGORY_LABELS,
    )

    internal_entries_raw = (
        entries.filter(project__is_internal=True)
        .values_list("description", "project__name", "duration_hours", "user_name")
    )

    goal_hours: dict[str, Decimal] = {}
    general_by_person: dict[str, Decimal] = {}
    data_quality_alerts: list[dict] = []
    hr_no_laboral_h = Decimal("0")
    no_desc_count = 0
    suspicious_h = Decimal("0")

    for desc, proj_name, hours, user_name in internal_entries_raw:
        desc = desc or ""
        if not desc.strip():
            no_desc_count += 1
        if is_hr_no_laboral(desc):
            hr_no_laboral_h += hours
            continue
        if SUSPICIOUS_TASKS_RE.search(desc):
            suspicious_h += hours
        cat = classify_time_entry(desc, proj_name)
        if cat is None:
            continue
        goal_hours[cat] = goal_hours.get(cat, Decimal("0")) + hours
        if cat == "APPIX_GENERAL":
            general_by_person[user_name] = (
                general_by_person.get(user_name, Decimal("0")) + hours
            )

    # Build alerts
    if hr_no_laboral_h > 0:
        data_quality_alerts.append({
            "type": "WARNING",
            "code": "HR_NO_LABORAL",
            "message": f'{hr_no_laboral_h.quantize(QUANTIZE)}h de HR marcadas "no laboral" excluidas',
            "hours": str(hr_no_laboral_h.quantize(QUANTIZE)),
        })
    if no_desc_count > 0:
        data_quality_alerts.append({
            "type": "WARNING",
            "code": "MISSING_DESCRIPTION",
            "message": f"{no_desc_count} entradas internas sin descripción",
            "count": no_desc_count,
        })
    if suspicious_h > 0:
        data_quality_alerts.append({
            "type": "WARNING",
            "code": "MISCLASSIFIED",
            "message": f'AT-156 "Guías de Embarque" ({suspicious_h.quantize(QUANTIZE)}h) debería estar en proyecto La Moderna',
            "hours": str(suspicious_h.quantize(QUANTIZE)),
        })

    # Build 9-category response
    development_goals = []
    for cat in ALL_GOAL_CATEGORIES:
        hrs = goal_hours.get(cat, Decimal("0"))
        item = {
            "category": cat,
            "category_label": GOAL_CATEGORY_LABELS[cat],
            "hours": str(hrs.quantize(QUANTIZE)),
            "has_data": hrs > 0,
        }
        if cat == "APPIX_GENERAL" and general_by_person:
            item["person_breakdown"] = [
                {"name": name, "hours": str(h.quantize(QUANTIZE))}
                for name, h in sorted(
                    general_by_person.items(), key=lambda x: x[1], reverse=True
                )
            ]
        development_goals.append(item)

    # Total client / internal hours for summary
    total_client_hours = (
        entries.filter(project__is_internal=False)
        .aggregate(total=Sum("duration_hours"))["total"] or Decimal("0")
    )
    total_internal_hours = (
        entries.filter(project__is_internal=True)
        .aggregate(total=Sum("duration_hours"))["total"] or Decimal("0")
    )

    # --- Overdue invoices (pending payment with past date) ---
    from datetime import date as date_cls_import
    today = date_cls_import.today()
    overdue_phases = phases.filter(
        is_paid=False,
        invoice_amount__gt=0,
        invoice_date__lt=today,
    )
    overdue_count = overdue_phases.count()
    overdue_amount = overdue_phases.aggregate(
        total=Sum("invoice_amount")
    )["total"] or Decimal("0")

    return Response({
        "date_range": {
            "date_from": str(date_from) if date_from else None,
            "date_to": str(date_to) if date_to else None,
        },
        "revenue": {
            "total_contracted": str(total_contracted.quantize(QUANTIZE)),
            "total_invoiced": str(total_invoiced.quantize(QUANTIZE)),
            "total_collected": str(total_collected.quantize(QUANTIZE)),
            "collection_rate": str(collection_rate.quantize(QUANTIZE)),
        },
        "costs": {
            "total_actual_cost": str(total_actual_cost.quantize(QUANTIZE)),
            "total_budget_hours": str(total_budget_hours.quantize(QUANTIZE)),
            "total_consumed_hours": str(total_consumed_hours.quantize(QUANTIZE)),
            "overall_margin": str(overall_margin.quantize(QUANTIZE)),
            "target_margin_avg": str(target_margin_avg.quantize(QUANTIZE)),
            "cr_absorbed_cost": str(cr_absorbed_cost.quantize(QUANTIZE)),
            "cr_absorbed_hours": str(cr_absorbed_hours.quantize(QUANTIZE)),
        },
        "health": {
            "total_projects": projects.count(),
            "critical": health_map.get("CRITICAL", 0),
            "warning": health_map.get("WARNING", 0),
            "healthy": health_map.get("HEALTHY", 0),
            "at_risk_projects": at_risk_projects,
        },
        "team": {
            "total_members": team_data.count(),
            "total_hours": str(total_consumed_hours.quantize(QUANTIZE)),
            "members": [
                {
                    "name": m["user_name"],
                    "hours": str(m["hours"].quantize(QUANTIZE)),
                    "cost": str(m["cost"].quantize(QUANTIZE)),
                    "project_count": m["project_count"],
                }
                for m in team_data
            ],
        },
        "team_utilization": team_utilization,
        "team_flow": team_flow,
        "hour_compliance": hour_compliance,
        "top_overbudget": overbudget[:10],
        "invoice_pipeline": pipeline,
        "development_goals": development_goals,
        "development_summary": {
            "total_internal_hours": str(total_internal_hours.quantize(QUANTIZE)),
            "total_client_hours": str(total_client_hours.quantize(QUANTIZE)),
        },
        "data_quality_alerts": data_quality_alerts,
        "overdue_invoices": {
            "count": overdue_count,
            "total_amount": str(overdue_amount.quantize(QUANTIZE)),
        },
    })


@api_view(["GET"])
@permission_classes([HasUserProfile, CanSeePersonal])
def personal_dashboard(request: Request) -> Response:
    """Per-person hour distribution with internal breakdown and data quality flags."""
    date_from = request.query_params.get("date_from")
    date_to = request.query_params.get("date_to")
    if date_from:
        date_from = date_from.strip()
    if date_to:
        date_to = date_to.strip()

    projects = get_projects_for_user(request.user)
    entries = TimeEntry.objects.filter(project__in=projects)
    if date_from:
        entries = entries.filter(date__gte=date_from)
    if date_to:
        entries = entries.filter(date__lte=date_to)

    # Default: only 2026+ data if no filter
    if not date_from and not date_to:
        from datetime import date as date_cls
        entries = entries.filter(date__gte=date_cls(2026, 1, 1))

    CATEGORY_LABELS = dict(Project.INTERNAL_CATEGORY_CHOICES)

    # --- Per-person aggregation ---
    # Hours by person + internal/client
    person_split_qs = (
        entries.values("user_name", "project__is_internal")
        .annotate(hours=Sum("duration_hours"))
        .order_by("user_name")
    )
    person_hours: dict[str, dict[str, Decimal]] = {}
    for row in person_split_qs:
        name = row["user_name"]
        if name not in person_hours:
            person_hours[name] = {"internal": Decimal("0"), "client": Decimal("0")}
        key = "internal" if row["project__is_internal"] else "client"
        person_hours[name][key] += row["hours"]

    # Internal breakdown by category per person
    cat_qs = (
        entries.filter(project__is_internal=True, project__internal_category__gt="")
        .values("user_name", "project__internal_category")
        .annotate(hours=Sum("duration_hours"))
        .order_by("user_name", "-hours")
    )
    person_categories: dict[str, list] = {}
    for row in cat_qs:
        name = row["user_name"]
        if name not in person_categories:
            person_categories[name] = []
        person_categories[name].append({
            "category": row["project__internal_category"],
            "category_label": CATEGORY_LABELS.get(
                row["project__internal_category"],
                row["project__internal_category"],
            ),
            "hours": str(row["hours"].quantize(QUANTIZE)),
        })

    # Client projects per person
    client_proj_qs = (
        entries.filter(project__is_internal=False)
        .values("user_name", "project__id", "project__name", "project__code", "project__jira_project_key")
        .annotate(hours=Sum("duration_hours"))
        .order_by("user_name", "-hours")
    )
    person_client_projects: dict[str, list] = {}
    for row in client_proj_qs:
        name = row["user_name"]
        if name not in person_client_projects:
            person_client_projects[name] = []
        person_client_projects[name].append({
            "id": row["project__id"],
            "name": row["project__name"],
            "code": row["project__code"],
            "hours": str(row["hours"].quantize(QUANTIZE)),
            "has_jira_key": bool(row["project__jira_project_key"]),
        })

    # Data quality per person
    dq_qs = (
        entries.values("user_name")
        .annotate(
            total_entries=Count("id"),
            missing_description=Count("id", filter=Q(description="")),
            client_no_jira=Count(
                "id",
                filter=Q(project__is_internal=False, project__jira_project_key=""),
            ),
        )
        .order_by("user_name")
    )
    person_dq = {row["user_name"]: row for row in dq_qs}

    # Non-productive hours (DAILYS category)
    nonprod_qs = (
        entries.filter(project__internal_category="DAILYS")
        .values("user_name")
        .annotate(hours=Sum("duration_hours"))
    )
    person_nonprod = {row["user_name"]: row["hours"] for row in nonprod_qs}

    # Suspicious entries: internal entries with Jira keys in description
    # (may indicate misclassified work)
    import re
    jira_re = re.compile(r"\[([A-Z]+-\d+)\]")
    # Known internal Jira prefixes (legitimate internal boards)
    INTERNAL_JIRA_PREFIXES = {"AT", "AP", "DA", "VA", "DD", "HR"}
    suspicious_by_person: dict[str, list] = {}
    internal_with_desc = (
        entries.filter(project__is_internal=True)
        .exclude(description="")
        .values_list("user_name", "description", "duration_hours", "project__code")
    )
    for user_name, description, hours, proj_code in internal_with_desc:
        match = jira_re.search(description)
        if match:
            jira_key = match.group(1)
            prefix = jira_key.split("-")[0]
            if prefix not in INTERNAL_JIRA_PREFIXES:
                # Non-internal Jira prefix → suspicious
                if user_name not in suspicious_by_person:
                    suspicious_by_person[user_name] = []
                suspicious_by_person[user_name].append({
                    "jira_key": jira_key,
                    "description": description[:100],
                    "hours": str(hours.quantize(QUANTIZE)),
                    "project_code": proj_code,
                })

    # Build members list
    all_names = sorted(
        person_hours.keys(),
        key=lambda n: person_hours[n]["internal"] + person_hours[n]["client"],
        reverse=True,
    )

    members = []
    total_productive = Decimal("0")
    total_client = Decimal("0")
    total_all = Decimal("0")

    for name in all_names:
        hrs = person_hours[name]
        total_h = hrs["internal"] + hrs["client"]
        nonprod = person_nonprod.get(name, Decimal("0"))
        productive = total_h - nonprod
        dq = person_dq.get(name, {"total_entries": 0, "missing_description": 0, "client_no_jira": 0})

        total_productive += productive
        total_client += hrs["client"]
        total_all += total_h

        members.append({
            "name": name,
            "total_hours": str(total_h.quantize(QUANTIZE)),
            "client_hours": str(hrs["client"].quantize(QUANTIZE)),
            "internal_hours": str(hrs["internal"].quantize(QUANTIZE)),
            "productive_hours": str(productive.quantize(QUANTIZE)),
            "non_productive_hours": str(nonprod.quantize(QUANTIZE)),
            "internal_breakdown": person_categories.get(name, []),
            "client_projects": person_client_projects.get(name, []),
            "data_quality": {
                "total_entries": dq["total_entries"],
                "missing_description": dq["missing_description"],
                "client_entries_without_jira": dq["client_no_jira"],
            },
            "suspicious_entries": suspicious_by_person.get(name, []),
        })

    avg_productive_pct = (
        (total_productive / total_all * 100) if total_all > 0 else Decimal("0")
    )
    avg_client_pct = (
        (total_client / total_all * 100) if total_all > 0 else Decimal("0")
    )

    return Response({
        "members": members,
        "summary": {
            "total_members": len(members),
            "avg_productive_percent": str(avg_productive_pct.quantize(QUANTIZE)),
            "avg_client_percent": str(avg_client_pct.quantize(QUANTIZE)),
        },
    })
