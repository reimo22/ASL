# Generated by Django 5.2 on 2025-05-02 11:23

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='EmployeeProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('employee_id', models.CharField(max_length=10)),
                ('employee_name', models.CharField(max_length=100)),
                ('department', models.CharField(max_length=100)),
                ('hire_date', models.CharField(max_length=20)),
                ('pay_rate', models.DecimalField(decimal_places=2, max_digits=10)),
                ('address', models.CharField(max_length=255)),
                ('age', models.PositiveIntegerField()),
            ],
        ),
    ]
