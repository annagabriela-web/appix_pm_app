from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("finance", "0007_cr_financial_impact"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="is_internal",
            field=models.BooleanField(
                default=False,
                help_text="True for internal Appix projects, False for client projects.",
            ),
        ),
    ]
