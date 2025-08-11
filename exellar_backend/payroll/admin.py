from datetime import timezone
from django.contrib import admin
from payroll.serializers import PayrollSerializer  # Direct import
from .models import Employee, Department, Designation, WorkLocation, SalaryComponent, Payroll, PaymentInformation, Document
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

# Register your models here.

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    ordering = ['name']

@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    ordering = ['name']

@admin.register(WorkLocation)
class WorkLocationAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'state', 'is_filing_address', 'created_at']
    list_filter = ['city', 'state', 'is_filing_address', 'created_at']
    search_fields = ['name', 'city', 'state', 'address']
    ordering = ['name']

@admin.register(SalaryComponent)
class SalaryComponentAdmin(admin.ModelAdmin):
    list_display = (
        'employee', 'monthly_ctc', 'basic_salary', 'basic_calculation_type', 'basic_percentage',
        'house_rent_allowance', 'hra_calculation_type', 'hra_percentage', 'conveyance_allowance',
        'meal_allowance', 'medical_allowance', 'personal_pay', 'fixed_allowance', 'total_earnings'
    )
    ordering = ('employee',)
    list_filter = ('basic_calculation_type', 'hra_calculation_type')

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        'employee_id', 'first_name', 'last_name', 'work_email', 'personal_email', 'department', 'designation', 'date_of_joining'
    )
    list_filter = (
        'department', 'designation', 'work_location', 'gender', 'date_of_joining'
    )
    search_fields = ['employee_id', 'first_name', 'last_name', 'work_email', 'personal_email', 'mobile_number']
    ordering = ['employee_id']
    readonly_fields = ['full_name', 'monthly_ctc', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('employee_id', 'first_name', 'last_name', 'work_email', 'personal_email', 'mobile_number', 'phone_number', 'date_of_birth', 'gender', 'address')
        }),
        ('Employment Information', {
            'fields': ('department', 'designation', 'work_location', 'employment_type', 'date_of_joining', 'date_of_leaving')
        }),
        ('Salary Information', {
            'fields': ('basic_salary', 'annual_ctc', 'monthly_ctc')
        }),
        ('Bank Information', {
            'fields': ('bank_name', 'account_number', 'ifsc_code', 'pan_number', 'aadhar_number'),
            'classes': ('collapse',)
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'type', 'employee', 'department', 'upload_date', 'size', 'status')
    list_filter = ('type', 'department', 'status', 'upload_date')
    search_fields = ('name', 'employee', 'department')
    ordering = ('-upload_date',)

@admin.register(PaymentInformation)
class PaymentInformationAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'employee', 
        'payment_method', 
        'is_automated', 
        'created_at', 
        'updated_at'
    )
    list_filter = ('payment_method', 'is_automated', 'created_at')
    search_fields = ('employee', 'payment_description')
    ordering = ('-created_at',)

@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):

    
    
    list_display = (
        'employee_name', 'pay_period_display', 'designation', 'department', 'days_worked',
        'basic_salary', 'total_income', 'gross_pay', 'total_deductions', 'net_pay', 'status'
    )
    list_filter = ['status', 'department', 'pay_period_start', 'pay_period_end', 'created_at']
    search_fields = ['employee__employee_id', 'employee__first_name', 'employee__last_name']
    ordering = ['-pay_period_start', 'employee']
    readonly_fields = ['created_at', 'updated_at', 'gross_pay', 'net_pay', 'total_deductions', 'total_income']
    list_select_related = ['employee']
    date_hierarchy = 'pay_period_start'
    actions = ['mark_as_processed', 'mark_as_paid']
    
    fieldsets = (
        ('Employee Information', {
            'fields': ('employee', 'designation', 'department')
        }),
        ('Pay Period', {
            'fields': ('pay_period_start', 'pay_period_end', 'days_worked')
        }),
        ('Earnings', {
            'fields': (
                'basic_salary', 'hra', 'conveyance', 'meal_allowance',
                'telephone_allowance', 'medical_allowance', 'personal_pay',
                'bonus', 'overtime', 'total_income', 'gross_pay'
            )
        }),
        ('Deductions', {
            'fields': ('profession_tax', 'advance', 'total_deductions')
        }),
        ('Net Pay', {
            'fields': ('net_pay',)
        }),
        ('Status & Dates', {
            'fields': ('status', 'processed_at', 'paid_at', 'notes')
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def employee_name(self, obj):
        return obj.employee.full_name if obj.employee else ''
    employee_name.short_description = 'Employee Name'
    employee_name.admin_order_field = 'employee__first_name'

    def pay_period_display(self, obj):
        return f"{obj.pay_period_start.strftime('%b %d')} - {obj.pay_period_end.strftime('%b %d, %Y')}"
    pay_period_display.short_description = 'Pay Period'
    pay_period_display.admin_order_field = 'pay_period_start'

    @admin.action(description='Mark selected payrolls as PROCESSED')
    def mark_as_processed(self, request, queryset):
        updated = queryset.filter(status='DRAFT').update(
            status='PROCESSED',
            processed_at=timezone.now()
        )
        self.message_user(request, f"{updated} payroll(s) marked as processed.")

    @admin.action(description='Mark selected payrolls as PAID')
    def mark_as_paid(self, request, queryset):
        updated = queryset.filter(status='PROCESSED').update(
            status='PAID',
            paid_at=timezone.now()
        )
        self.message_user(request, f"{updated} payroll(s) marked as paid.")

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('employee')

    def save_model(self, request, obj, form, change):
        # Recalculate fields before saving
        serializer = PayrollSerializer(data=form.cleaned_data, instance=obj)
        if serializer.is_valid():
            serializer._calculate_fields(obj)
        super().save_model(request, obj, form, change)

