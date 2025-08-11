from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('payroll', '0008_alter_salarycomponent_calculation_type_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            sql=(
                "ALTER TABLE salary_components ALTER COLUMN employee_id DROP NOT NULL;"
            ),
            reverse_sql=(
                "ALTER TABLE salary_components ALTER COLUMN employee_id SET NOT NULL;"
            ),
        ),
    ]

