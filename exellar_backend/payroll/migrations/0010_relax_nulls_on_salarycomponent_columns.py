from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('payroll', '0009_allow_null_employee_in_salarycomponent'),
    ]

    operations = [
        migrations.RunSQL(
            sql=(
                """
                ALTER TABLE salary_components
                    ALTER COLUMN monthly_ctc DROP NOT NULL,
                    ALTER COLUMN basic_salary DROP NOT NULL,
                    ALTER COLUMN house_rent_allowance DROP NOT NULL;
                """
            ),
            reverse_sql=(
                """
                ALTER TABLE salary_components
                    ALTER COLUMN monthly_ctc SET NOT NULL,
                    ALTER COLUMN basic_salary SET NOT NULL,
                    ALTER COLUMN house_rent_allowance SET NOT NULL;
                """
            ),
        ),
    ]

