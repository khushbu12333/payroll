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
                colcount integer;
                has_employee_id boolean;
            BEGIN
                -- Detect if 'leave' table exists without columns (corrupted/empty)
                SELECT COUNT(*) INTO colcount
                FROM information_schema.columns
                WHERE table_schema='public' AND table_name='leave';

                IF colcount = 0 THEN
                    -- Drop and recreate the 'leave' table with the correct schema
                    EXECUTE 'DROP TABLE IF EXISTS public."leave" CASCADE';
                    EXECUTE '
                        CREATE TABLE public."leave" (
                            id BIGSERIAL PRIMARY KEY,
                            employee_id VARCHAR(20) NOT NULL,
                            leave_type VARCHAR(20) NOT NULL,
                            start_date DATE NOT NULL,
                            end_date DATE NOT NULL,
                            reason TEXT NOT NULL,
                            status VARCHAR(20) NOT NULL,
                            approved_by_id VARCHAR(20),
                            approved_at TIMESTAMPTZ,
                            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                            updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
                        )
                    ';

                    EXECUTE '
                        ALTER TABLE public."leave"
                        ADD CONSTRAINT leave_employee_id_fkey
                        FOREIGN KEY (employee_id)
                        REFERENCES public."employee"(employee_id)
                        ON DELETE CASCADE
                    ';

                    EXECUTE '
                        ALTER TABLE public."leave"
                        ADD CONSTRAINT leave_approved_by_id_fkey
                        FOREIGN KEY (approved_by_id)
                        REFERENCES public."employee"(employee_id)
                        ON DELETE SET NULL
                    ';

                ELSE
                    -- Ensure employee_id column exists
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema='public' AND table_name='leave' AND column_name='employee_id'
                    ) INTO has_employee_id;

                    IF NOT has_employee_id THEN
                        EXECUTE 'ALTER TABLE public."leave" ADD COLUMN employee_id VARCHAR(20)';
                    END IF;

                    -- Drop existing FK on employee_id if present
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
                        REFERENCES public."employee"(employee_id)
                        ON DELETE CASCADE
                    ';
                END IF;
            END $$;
            """,
            reverse_sql=r"""
            -- Best-effort reverse: drop the recreated FKs; table will remain
            ALTER TABLE IF EXISTS public."leave" DROP CONSTRAINT IF EXISTS leave_employee_id_fkey;
            ALTER TABLE IF EXISTS public."leave" DROP CONSTRAINT IF EXISTS leave_approved_by_id_fkey;
            """,
        ),
    ]

