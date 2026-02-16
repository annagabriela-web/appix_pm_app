from django.urls import path

from . import views

app_name = "integrations"

urlpatterns = [
    path("sync/trigger/", views.trigger_sync, name="trigger-sync"),
    path("sync/status/", views.sync_status, name="sync-status"),
]
