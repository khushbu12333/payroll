#!/usr/bin/env python
"""
Development setup script for Exellar Payroll Backend
Run this after setting up the database to create sample data
"""

import os
import sys
import django
from datetime import date, timedelta
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'exellar_backend.settings')
django.setup()

from django.contrib.auth.models import User
from payroll.models import Department, Designation, WorkLocation, SalaryComponent, Employee

def create_sample_data():
    """Create sample data for development"""
    
    print("Creating sample data...")
    
    # Create Departments
    hr_dept, created = Department.objects.get_or_create(
        name="Human Resources",
        defaults={"description": "Human Resources Department"}
    )
    it_dept, created = Department.objects.get_or_create(
        name="Information Technology", 
        defaults={"description": "IT Department"}
    )
    finance_dept, created = Department.objects.get_or_create(
        name="Finance",
        defaults={"description": "Finance Department"}
    )
    
    print(f"✓ Created {Department.objects.count()} departments")
    
    # Create Designations
    manager, created = Designation.objects.get_or_create(
        name="Manager",
        defaults={"description": "Department Manager"}
    )
    developer, created = Designation.objects.get_or_create(
        name="Software Developer",
        defaults={"description": "Software Developer"}
    )
    senior_dev, created = Designation.objects.get_or_create(
        name="Senior Software Developer",
        defaults={"description": "Senior Software Developer"}
    )
    hr_exec, created = Designation.objects.get_or_create(
        name="HR Executive",
        defaults={"description": "Human Resources Executive"}
    )
    
    print(f"✓ Created {Designation.objects.count()} designations")
    
    # Create Work Locations
    head_office, created = WorkLocation.objects.get_or_create(
        name="Head Office",
        defaults={
            "address": "123 Tech Park",
            "city": "Mumbai",
            "state": "Maharashtra", 
            "pincode": "400001",
            "is_filing_address": True
        }
    )
    branch_office, created = WorkLocation.objects.get_or_create(
        name="Branch Office",
        defaults={
            "address": "456 Business Center",
            "city": "Pune",
            "state": "Maharashtra",
            "pincode": "411001",
            "is_filing_address": False
        }
    )
    
    print(f"✓ Created {WorkLocation.objects.count()} work locations")
    
    # Create Salary Components
    # Earnings
    basic_salary, created = SalaryComponent.objects.get_or_create(
        name="Basic Salary",
        defaults={
            "component_type": "EARNING",
            "calculation_type": "FIXED",
            "value": Decimal("0"),
            "is_taxable": True,
            "description": "Basic salary component"
        }
    )
    hra, created = SalaryComponent.objects.get_or_create(
        name="House Rent Allowance",
        defaults={
            "component_type": "EARNING",
            "calculation_type": "PERCENTAGE",
            "value": Decimal("50"),  # 50% of basic
            "is_taxable": True,
            "description": "House Rent Allowance - 50% of basic salary"
        }
    )
    special_allowance, created = SalaryComponent.objects.get_or_create(
        name="Special Allowance",
        defaults={
            "component_type": "EARNING",
            "calculation_type": "FIXED",
            "value": Decimal("5000"),
            "is_taxable": True,
            "description": "Special allowance"
        }
    )
    
    # Deductions
    pf, created = SalaryComponent.objects.get_or_create(
        name="Provident Fund",
        defaults={
            "component_type": "DEDUCTION",
            "calculation_type": "PERCENTAGE",
            "value": Decimal("12"),  # 12% of basic
            "is_taxable": False,
            "description": "Employee Provident Fund - 12% of basic salary"
        }
    )
    pt, created = SalaryComponent.objects.get_or_create(
        name="Professional Tax",
        defaults={
            "component_type": "DEDUCTION",
            "calculation_type": "FIXED",
            "value": Decimal("200"),
            "is_taxable": False,
            "description": "Professional Tax"
        }
    )
    
    print(f"✓ Created {SalaryComponent.objects.count()} salary components")
    
    # Create sample employees
    employees_data = [
        {
            "employee_id": "EMP001",
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@exellar.com",
            "phone": "+91-9876543210",
            "department": it_dept,
            "designation": senior_dev,
            "work_location": head_office,
            "date_of_joining": date.today() - timedelta(days=365),
            "basic_salary": Decimal("50000"),
            "annual_ctc": Decimal("800000"),
            "bank_name": "State Bank of India",
            "account_number": "12345678901",
            "ifsc_code": "SBIN0001234"
        },
        {
            "employee_id": "EMP002",
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane.smith@exellar.com",
            "phone": "+91-9876543211",
            "department": it_dept,
            "designation": developer,
            "work_location": head_office,
            "date_of_joining": date.today() - timedelta(days=180),
            "basic_salary": Decimal("35000"),
            "annual_ctc": Decimal("600000"),
            "bank_name": "HDFC Bank",
            "account_number": "12345678902",
            "ifsc_code": "HDFC0001234"
        },
        {
            "employee_id": "EMP003",
            "first_name": "Mike",
            "last_name": "Johnson",
            "email": "mike.johnson@exellar.com",
            "phone": "+91-9876543212",
            "department": hr_dept,
            "designation": hr_exec,
            "work_location": head_office,
            "date_of_joining": date.today() - timedelta(days=300),
            "basic_salary": Decimal("30000"),
            "annual_ctc": Decimal("500000"),
            "bank_name": "ICICI Bank",
            "account_number": "12345678903",
            "ifsc_code": "ICIC0001234"
        }
    ]
    
    for emp_data in employees_data:
        employee, created = Employee.objects.get_or_create(
            employee_id=emp_data["employee_id"],
            defaults=emp_data
        )
        if created:
            print(f"✓ Created employee: {employee.full_name}")
    
    print(f"✓ Total employees: {Employee.objects.count()}")
    
    print("\n🎉 Sample data created successfully!")
    print("\nYou can now:")
    print("1. Start the development server: python manage.py runserver")
    print("2. Access the API at: http://localhost:8000/api/")
    print("3. Access the admin at: http://localhost:8000/admin/")
    print("4. Create a superuser: python manage.py createsuperuser")

if __name__ == "__main__":
    create_sample_data() 