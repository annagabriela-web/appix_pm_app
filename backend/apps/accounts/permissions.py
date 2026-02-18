from rest_framework.permissions import BasePermission


class HasUserProfile(BasePermission):
    """
    Allows access only to authenticated users who have a UserProfile.
    Superusers without a profile are also allowed (legacy/admin).
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return hasattr(request.user, "profile") and request.user.profile.is_active


class IsInternalUser(BasePermission):
    """Only Appix employees (INTERNAL org)."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return (
            hasattr(request.user, "profile")
            and request.user.profile.is_internal
        )


class IsAdmin(BasePermission):
    """Only ADMIN role users."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return (
            hasattr(request.user, "profile")
            and request.user.profile.role == "ADMIN"
        )


class CanSeePortfolio(BasePermission):
    """DIRECTOR and ADMIN can see portfolio view."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return (
            hasattr(request.user, "profile")
            and request.user.profile.can_see_portfolio
        )


class CanManageBillingRoles(BasePermission):
    """
    ADMIN can write billing roles.
    All internal users can read.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        if not hasattr(request.user, "profile"):
            return False
        profile = request.user.profile
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return profile.is_internal
        return profile.can_manage_billing_roles
