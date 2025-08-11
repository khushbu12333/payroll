from datetime import timezone
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from django.contrib.postgres.fields import ArrayField
from django.db import models
import os
from django.conf import settings



# Create your models here.

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']

class Designation(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']

class WorkLocation(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    address2 = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    pincode = models.CharField(max_length=10)
    is_filing_address = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.city}"
    
    class Meta:
        ordering = ['name']

class Employee(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    EMPLOYMENT_TYPE_CHOICES = [
        ('FULL_TIME', 'Full Time'),
        ('PART_TIME', 'Part Time'),
        ('INTERN', 'Intern'),
    ]

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        # add more as needed
    ]
    
    # Personal Information
    employee_id = models.CharField(max_length=20, primary_key=True)
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=50)
    work_email = models.EmailField(unique=True)
    personal_email = models.EmailField(null=True, blank=True)
    date_of_joining = models.DateField()
    date_of_birth = models.DateField()
    age = models.IntegerField(blank=True, null=True)
    mobile_number = models.CharField(max_length=20, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(default='Default Address')
    gender = models.CharField(max_length=20, default='M')
    work_location = models.CharField(max_length=50, blank=True, null=True)
    designation = models.CharField(max_length=100, default='Employee')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='employees')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Employment Information
    employment_type = models.CharField(max_length=50, blank=True, null=True)
    date_of_leaving = models.DateField(blank=True, null=True)
    
    # Salary Information
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    annual_ctc = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))])
    
    # Bank Information
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    account_number = models.CharField(max_length=20, blank=True, null=True)
    ifsc_code = models.CharField(max_length=11, blank=True, null=True)
    pan_number = models.CharField(max_length=10, blank=True, null=True)
    aadhar_number = models.CharField(max_length=12, blank=True, null=True)
    
    def __str__(self):
        return f"{self.employee_id} - {self.first_name} {self.last_name}"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def monthly_ctc(self):
        if self.annual_ctc:
            return self.annual_ctc / 12
        return 0  # or Decimal('0.00')

    class Meta:
        ordering = ['employee_id']
        db_table = 'employee'  # <-- Add this line

class SalaryComponent(models.Model):
    COMPONENT_TYPE_CHOICES = [
        ('EARNING', 'Earning'),
        ('DEDUCTION', 'Deduction'),
    ]
    
    CALCULATION_TYPE_CHOICES = [
        ('FIXED', 'Fixed Amount'),
        ('PERCENTAGE', 'Percentage of Basic'),
        ('PERCENTAGE_CTC', 'Percentage of CTC'),
        ('CUSTOM', 'Custom Formula'),
    ]
    
    
    id = models.AutoField(primary_key=True)
    employee = models.OneToOneField('Employee', on_delete=models.CASCADE, null=True, blank=True)
    monthly_ctc = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    basic_calculation_type = models.CharField(max_length=20, default='percentage')
    basic_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    house_rent_allowance = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0.00)
    hra_calculation_type = models.CharField(max_length=20, default='percentage')
    hra_percentage = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    conveyance_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    meal_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    medical_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    personal_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fixed_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    component_type = models.CharField(
        max_length=20,
        choices=COMPONENT_TYPE_CHOICES,
        default='EARNING'
    )
    calculation_type = models.CharField(
        max_length=20,
        choices=CALCULATION_TYPE_CHOICES,
        default='FIXED'
    )
    is_active = models.BooleanField(default=True)
    is_taxable = models.BooleanField(default=True)
    name = models.CharField(max_length=100, default='Basic Salary')
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        employee_part = self.employee.full_name if getattr(self, 'employee', None) else 'Unassigned'
        return f"{employee_part} - {self.name}"
    
    class Meta:
        ordering = ['employee']
        db_table = 'salary_components'  # <-- Add this line

class PaymentInformation(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    payment_method = models.CharField(max_length=50)
    payment_description = models.TextField(blank=True, null=True)
    is_automated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payment_information'


class Payroll(models.Model):
    PAYROLL_STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PROCESSED', 'Processed'), 
        ('PAID', 'Paid'),
        ('CANCELLED', 'Cancelled'),
    ]

    employee = models.ForeignKey('Employee', on_delete=models.CASCADE, related_name='payrolls', db_column='employee_id')
    pay_period_start = models.DateField()
    pay_period_end = models.DateField()
    designation = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    days_worked = models.IntegerField(default=30)
    total_income = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    hra = models.DecimalField("House Rent Allowance", max_digits=10, decimal_places=2, default=0.00)
    conveyance = models.DecimalField("Conveyance Allowance", max_digits=10, decimal_places=2, default=0.00)
    meal_allowance = models.DecimalField("Meal Allowance", max_digits=10, decimal_places=2, default=0.00)
    telephone_allowance = models.DecimalField("Telephone Allowance", max_digits=10, decimal_places=2, default=0.00)
    medical_allowance = models.DecimalField("Medical Allowance", max_digits=10, decimal_places=2, default=0.00)
    personal_pay = models.DecimalField("Personal Pay", max_digits=10, decimal_places=2, default=0.00)
    bonus = models.DecimalField("Bonus", max_digits=10, decimal_places=2, default=0.00)
    overtime = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    profession_tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    advance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    gross_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    net_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=PAYROLL_STATUS_CHOICES, default='DRAFT')
    processed_at = models.DateTimeField(blank=True, null=True)
    paid_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee.full_name} - {self.pay_period_start} to {self.pay_period_end}"
    
    class Meta:
        ordering = ['-pay_period_start', 'employee']
        unique_together = ['employee', 'pay_period_start', 'pay_period_end']
        db_table = 'payroll'

class Leave(models.Model):
    LEAVE_TYPES = [
        ('CASUAL', 'Casual Leave'),
        ('SICK', 'Sick Leave'),
        ('ANNUAL', 'Annual Leave'),
        ('UNPAID', 'Unpaid Leave'),
        ('OTHER', 'Other')
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled')
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leaves')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    approved_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'leave'

        
    def __str__(self):
        return f"{self.employee.get_full_name()} - {self.leave_type} ({self.start_date} to {self.end_date})"
    
    @property
    def duration(self):
        """Calculate the duration of leave in days"""
        return (self.end_date - self.start_date).days + 1

class Document(models.Model):
    DOCUMENT_TYPES = [
        ('Salary Report', 'Salary Report'),
        ('Tax Document', 'Tax Document'),
        ('Bonus Report', 'Bonus Report'),
        ('Leave Record', 'Leave Record'),
        ('Other', 'Other'),
    ]

    DEPARTMENTS = [
        ('Engineering', 'Engineering'),
        ('Marketing', 'Marketing'),
        ('Sales', 'Sales'),
        ('HR', 'HR'),
        ('Finance', 'Finance'),
    ]

    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Pending', 'Pending'),
        ('Archived', 'Archived'),
    ]

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    employee = models.CharField(max_length=100)
    department = models.CharField(max_length=50, choices=DEPARTMENTS)
    description = models.TextField(blank=True)
    file_path = models.TextField(blank=True)  # Match database column
    upload_date = models.DateField(auto_now_add=True)
    # size = models.CharField(max_length=20, blank=True)  # Remove the property conflict
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')

    @property
    def size(self):
        if self.file_path:
            try:
                # Build full file path
                full_path = os.path.join(settings.MEDIA_ROOT, self.file_path.lstrip('/media/'))
                if os.path.exists(full_path):
                    file_size = os.path.getsize(full_path)
                    return f"{file_size / (1024 * 1024):.1f} MB"
            except:
                pass
        return "0.0 MB"
    
    @property
    def size_bytes(self):
        """Return size in bytes for calculations"""
        if self.file_path:
            try:
                full_path = os.path.join(settings.MEDIA_ROOT, self.file_path.lstrip('/media/'))
                if os.path.exists(full_path):
                    return os.path.getsize(full_path)
            except:
                pass
        return 0


    def __str__(self):
        return self.name

    class Meta:
        db_table = 'documents'

