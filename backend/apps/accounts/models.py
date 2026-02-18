from django.contrib.auth.models import User
from django.db import models


class Organization(models.Model):
    """Represents a company: Appix (INTERNAL) or a client (EXTERNAL)."""

    class OrgType(models.TextChoices):
        INTERNAL = "INTERNAL", "Internal (Appix)"
        EXTERNAL = "EXTERNAL", "External (Client)"

    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    org_type = models.CharField(
        max_length=10,
        choices=OrgType.choices,
        default=OrgType.EXTERNAL,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.get_org_type_display()})"


class UserProfile(models.Model):
    """OneToOne extension of auth.User with role and organization."""

    class Role(models.TextChoices):
        PM = "PM", "Project Manager"
        DIRECTOR = "DIRECTOR", "Director"
        ADMIN = "ADMIN", "Admin"
        CLIENT = "CLIENT", "Client"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name="members",
    )
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.PM,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["user__last_name", "user__first_name"]

    def __str__(self) -> str:
        return f"{self.user.email} [{self.role}] @ {self.organization.name}"

    @property
    def is_internal(self) -> bool:
        return self.organization.org_type == Organization.OrgType.INTERNAL

    @property
    def is_client(self) -> bool:
        return self.organization.org_type == Organization.OrgType.EXTERNAL

    @property
    def can_see_financials(self) -> bool:
        return self.is_internal

    @property
    def can_see_portfolio(self) -> bool:
        return self.role in (self.Role.DIRECTOR, self.Role.ADMIN)

    @property
    def can_see_personal(self) -> bool:
        return self.role in (self.Role.PM, self.Role.ADMIN)

    @property
    def can_manage_billing_roles(self) -> bool:
        return self.role == self.Role.ADMIN


class ProjectAssignment(models.Model):
    """Links an internal user (PM/Director) to specific projects."""

    user_profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="project_assignments",
        limit_choices_to={"organization__org_type": "INTERNAL"},
    )
    project = models.ForeignKey(
        "finance.Project",
        on_delete=models.CASCADE,
        related_name="assignments",
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assignments_made",
    )

    class Meta:
        unique_together = ("user_profile", "project")
        ordering = ["-assigned_at"]

    def __str__(self) -> str:
        return f"{self.user_profile.user.email} -> {self.project.code}"
