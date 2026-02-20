# Generated manually

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0006_project_anticipo'),
    ]

    operations = [
        migrations.AddField(
            model_name='changerequest',
            name='is_charged',
            field=models.BooleanField(
                default=False,
                help_text='True si el costo de este CR se cobro al cliente',
            ),
        ),
        migrations.AddField(
            model_name='changerequest',
            name='charged_amount',
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                help_text='Monto cobrado al cliente por este CR',
                max_digits=12,
                null=True,
            ),
        ),
        migrations.CreateModel(
            name='ChangeRequestPhaseImpact',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('estimated_hours', models.DecimalField(
                    decimal_places=2,
                    help_text='Horas estimadas que este CR agrega a esta fase',
                    max_digits=8,
                )),
                ('change_request', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='phase_impacts',
                    to='finance.changerequest',
                )),
                ('phase', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='cr_impacts',
                    to='finance.phase',
                )),
            ],
            options={
                'ordering': ['phase__sort_order'],
                'unique_together': {('change_request', 'phase')},
            },
        ),
        migrations.AddField(
            model_name='changerequest',
            name='affected_phases',
            field=models.ManyToManyField(
                blank=True,
                related_name='change_requests_affecting',
                through='finance.ChangeRequestPhaseImpact',
                to='finance.phase',
            ),
        ),
    ]
