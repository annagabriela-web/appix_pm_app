from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import Organization, ProjectAssignment, UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = "Profile"
    fk_name = "user"


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = (
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "get_role",
        "get_org",
    )

    @admin.display(description="Role")
    def get_role(self, obj):
        if hasattr(obj, "profile"):
            return obj.profile.role
        return "-"

    @admin.display(description="Organization")
    def get_org(self, obj):
        if hasattr(obj, "profile"):
            return obj.profile.organization.name
        return "-"


# Unregister default User admin and re-register with inline
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "org_type", "slug", "is_active", "created_at")
    list_filter = ("org_type", "is_active")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("get_email", "get_name", "role", "organization", "is_active")
    list_filter = ("role", "organization", "is_active")
    search_fields = ("user__email", "user__first_name", "user__last_name")
    raw_id_fields = ("user",)

    @admin.display(description="Email", ordering="user__email")
    def get_email(self, obj):
        return obj.user.email

    @admin.display(description="Name", ordering="user__last_name")
    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"


@admin.register(ProjectAssignment)
class ProjectAssignmentAdmin(admin.ModelAdmin):
    list_display = ("get_user", "get_project", "assigned_at")
    list_filter = ("project",)
    search_fields = ("user_profile__user__email", "project__code", "project__name")
    raw_id_fields = ("user_profile", "project", "assigned_by")

    @admin.display(description="User", ordering="user_profile__user__email")
    def get_user(self, obj):
        return obj.user_profile.user.email

    @admin.display(description="Project", ordering="project__code")
    def get_project(self, obj):
        return f"{obj.project.code} - {obj.project.name}"
