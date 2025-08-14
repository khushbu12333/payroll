from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("payroll", "0012_alter_leave_employee"),
    ]

    operations = [
        migrations.RunSQL(
            sql=r"""
            DO $$
            DECLARE
                constraint_name text;
            BEGIN
                -- Find existing FK constraint on leave.employee_id
                SELECT conname INTO constraint_name
                FROM pg_constraint c
                JOIN pg_class t ON c.conrelid = t.oid
                JOIN pg_namespace n ON n.oid = t.relnamespace
                WHERE t.relname = 'leave'
                  AND n.nspname = 'public'
                  AND c.contype = 'f'
                  AND array_position(c.conkey, (
                        SELECT attnum FROM pg_attribute
                        WHERE attrelid = t.oid AND attname = 'employee_id'
                  )) IS NOT NULL
                LIMIT 1;

                IF constraint_name IS NOT NULL THEN
                    EXECUTE format('ALTER TABLE public."leave" DROP CONSTRAINT %I', constraint_name);
                END IF;

                -- Recreate FK with ON DELETE CASCADE
                EXECUTE '
                    ALTER TABLE public."leave"
                    ADD CONSTRAINT leave_employee_id_fkey
                    FOREIGN KEY (employee_id)
                    REFERENCES public.payroll_employee(id)
                    ON DELETE CASCADE
                ';
            END $$;
            """,
            reverse_sql=r"""
            -- Best-effort reverse: drop the recreated FK; Django will manage re-adding as needed
            ALTER TABLE IF EXISTS public."leave" DROP CONSTRAINT IF EXISTS leave_employee_id_fkey;
            """,
        ),
    ]

