from django.core.management.base import BaseCommand
from payroll.models import Employee, Designation
from django.utils import timezone
from datetime import datetime

class Command(BaseCommand):
    help = 'Import employees from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):
        import csv
        csv_file = options['csv_file']
        with open(csv_file, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # Get employee_id and skip if missing/blank
                employee_id = row.get('employee_id', '').strip()
                if not employee_id:
                    print("Skipping row with missing employee_id:", row)
                    continue

                full_name = row['name']
                parts = full_name.split(' ', 1)  # Split name into first and last
                first_name = parts[0]
                last_name = parts[1] if len(parts) > 1 else ''
                designation_name = row.get('role', '')
                status = row.get('status', '')

                # Get date_of_joining from CSV, or use today as fallback
                date_of_joining_str = row.get('date_of_joining', '')
                if date_of_joining_str:
                    try:
                        date_of_joining = datetime.strptime(date_of_joining_str, "%Y-%m-%d").date()
                    except ValueError:
                        date_of_joining = timezone.now().date()
                else:
                    date_of_joining = timezone.now().date()

                # Get basic_salary from CSV, or use a default (e.g., 0.0)
                basic_salary_str = row.get('basic_salary', '')
                try:
                    basic_salary = float(basic_salary_str) if basic_salary_str else 0.0
                except ValueError:
                    basic_salary = 0.0

                # Get annual_ctc from CSV, or use a default (e.g., 0.0)
                annual_ctc_str = row.get('annual_ctc', '')
                try:
                    annual_ctc = float(annual_ctc_str) if annual_ctc_str else 0.0
                except ValueError:
                    annual_ctc = 0.0

                # You may need to fetch or create the Designation object
                designation = None
                if designation_name:
                    designation, _ = Designation.objects.get_or_create(name=designation_name)

                Employee.objects.get_or_create(
                    employee_id=employee_id,
                    first_name=first_name,
                    last_name=last_name,
                    designation=designation,
                    status=status,
                    date_of_joining=date_of_joining,
                    basic_salary=basic_salary,
                    annual_ctc=annual_ctc,
                    # Add other fields as per your Employee model and CSV columns
                )

            
                
