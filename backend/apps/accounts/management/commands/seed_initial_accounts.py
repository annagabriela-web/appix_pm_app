"""
Creates the Appix organization and assigns UserProfiles to all existing users.
Safe to run multiple times (idempotent).
"""

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from apps.accounts.models import Organization, UserProfile


class Command(BaseCommand):
    help = "Create Appix org and UserProfile for all existing users"

    def handle(self, *args, **options):
        # 1. Create or get Appix organization
        org, created = Organization.objects.get_or_create(
            slug="appix",
            defaults={
                "name": "Appix",
                "org_type": Organization.OrgType.INTERNAL,
            },
        )
        status = "Created" if created else "Already exists"
        self.stdout.write(f"  Organization 'Appix': {status}")

        # 2. Create UserProfile for every User that doesn't have one
        users_without_profile = User.objects.filter(profile__isnull=True)
        count = 0
        for user in users_without_profile:
            UserProfile.objects.create(
                user=user,
                organization=org,
                role=UserProfile.Role.ADMIN,
            )
            count += 1
            self.stdout.write(f"  Created ADMIN profile for {user.email}")

        if count == 0:
            self.stdout.write("  All users already have profiles.")

        self.stdout.write(
            self.style.SUCCESS(f"Done. {count} profile(s) created.")
        )
