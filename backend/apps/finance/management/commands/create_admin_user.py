from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Creates the Appix admin user if it does not already exist."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True)
        parser.add_argument("--password", required=True)
        parser.add_argument("--first-name", default="Ana")
        parser.add_argument("--last-name", default="Gabriela")

    def handle(self, *args, **options):
        email = options["email"]
        if User.objects.filter(username=email).exists():
            self.stdout.write(self.style.WARNING(f"User {email} already exists."))
            return

        User.objects.create_superuser(
            username=email,
            email=email,
            password=options["password"],
            first_name=options["first_name"],
            last_name=options["last_name"],
        )
        self.stdout.write(self.style.SUCCESS(f"User {email} created."))
