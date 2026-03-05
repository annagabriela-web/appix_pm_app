"""
Central queryset filtering based on user role and organization.
"""

from django.contrib.auth.models import User
from django.db.models import QuerySet

from apps.finance.models import Project, ProjectHealthAlert


def get_projects_for_user(user: User) -> QuerySet[Project]:
    """
    Return the filtered Project queryset based on the user's role:
    - DIRECTOR: all projects (internal + client)
    - ADMIN: only internal projects (is_internal=True)
    - PM: only client projects assigned via ProjectAssignment
    - CLIENT: only projects where client_org matches user's organization
    - Superuser without profile: all projects (legacy)
    """
    if user.is_superuser and not hasattr(user, "profile"):
        return Project.objects.all()

    profile = user.profile

    if profile.role == "DIRECTOR":
        return Project.objects.all()

    if profile.role == "ADMIN":
        return Project.objects.filter(is_internal=True)

    if profile.role == "PM":
        assigned_ids = profile.project_assignments.values_list("project_id", flat=True)
        return Project.objects.filter(is_internal=False, id__in=assigned_ids)

    if profile.role == "CLIENT":
        return Project.objects.filter(client_org=profile.organization)

    return Project.objects.none()


def get_alerts_for_user(user: User) -> QuerySet[ProjectHealthAlert]:
    """
    Return alerts only for projects the user can see.
    """
    visible_projects = get_projects_for_user(user)
    return ProjectHealthAlert.objects.filter(project__in=visible_projects)
