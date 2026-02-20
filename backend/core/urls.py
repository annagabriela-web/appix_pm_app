from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.finance.auth_urls")),
    path("api/v1/finance/", include("apps.finance.urls")),
    path("api/v1/integrations/", include("apps.integrations.urls")),
    path("api/v1/reports/", include("apps.reports.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
