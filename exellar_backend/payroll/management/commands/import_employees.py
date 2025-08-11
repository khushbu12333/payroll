import csv
from datetime import datetime, timezone
from payroll.models import Employee, Designation

def import_employees(file_path):
    with open(file_path, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
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

            # Get basic_salary from CSV, or use a default (e.g., 0)
            basic_salary_str = row.get('basic_salary', '')
            try:
                basic_salary = float(basic_salary_str) if basic_salary_str else 0.0
            except ValueError:
                basic_salary = 0.0

            # You may need to fetch or create the Designation object
            designation = None
            if designation_name:
                designation, _ = Designation.objects.get_or_create(name=designation_name)

            Employee.objects.get_or_create(
                first_name=first_name,
                last_name=last_name,
                designation=designation,
                status=status,
                date_of_joining=date_of_joining,
                basic_salary=basic_salary,
                # Add other fields as per your Employee model and CSV columns
            )
