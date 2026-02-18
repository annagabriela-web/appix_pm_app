from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response


@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_view(request: Request) -> Response:
    """GET /api/v1/auth/csrf/ - Sets CSRF cookie."""
    return Response({"detail": "CSRF cookie set."})


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request: Request) -> Response:
    """POST /api/v1/auth/login/ - Email + password -> session."""
    email = request.data.get("email", "")
    password = request.data.get("password", "")

    user = authenticate(request._request, username=email, password=password)
    if user is None:
        return Response(
            {"detail": "Credenciales invalidas."},
            status=401,
        )

    login(request._request, user)
    return Response(
        {
            "id": user.pk,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request: Request) -> Response:
    """POST /api/v1/auth/logout/"""
    logout(request._request)
    return Response({"detail": "Sesion cerrada."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request: Request) -> Response:
    """GET /api/v1/auth/me/ - Returns current user data with role and permissions."""
    user = request.user

    # Base data
    data = {
        "id": user.pk,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }

    # Add role/org/permissions from profile
    if hasattr(user, "profile"):
        profile = user.profile
        data.update(
            {
                "role": profile.role,
                "org_id": profile.organization_id,
                "org_name": profile.organization.name,
                "org_type": profile.organization.org_type,
                "permissions": {
                    "can_see_portfolio": profile.can_see_portfolio,
                    "can_see_projects": True,
                    "can_see_personal": profile.can_see_personal,
                    "can_manage_billing_roles": profile.can_manage_billing_roles,
                    "can_see_financials": profile.can_see_financials,
                },
            }
        )
    else:
        # Superuser without profile — default to full ADMIN access
        data.update(
            {
                "role": "ADMIN",
                "org_id": None,
                "org_name": "Appix",
                "org_type": "INTERNAL",
                "permissions": {
                    "can_see_portfolio": True,
                    "can_see_projects": True,
                    "can_see_personal": True,
                    "can_manage_billing_roles": True,
                    "can_see_financials": True,
                },
            }
        )

    return Response(data)
