from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = "finance"

router = DefaultRouter()
router.register("projects", views.ProjectViewSet, basename="project")
router.register("billing-roles", views.BillingRoleViewSet, basename="billing-role")
router.register("alerts", views.AlertViewSet, basename="alert")
router.register("advances", views.AdvanceViewSet, basename="advance")
router.register("simple-changes", views.SimpleChangeViewSet, basename="simple-change")

urlpatterns = [
    path("portfolio/", views.portfolio_view, name="portfolio"),
    path("", include(router.urls)),
]
