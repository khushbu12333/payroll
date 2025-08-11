from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Employee, Department, Designation, WorkLocation, SalaryComponent, Payroll, Leave, PaymentInformation, Document
from rest_framework.response import Response
from rest_framework import status

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()
  
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 
                 'employee_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_employee_count(self, obj):
      return obj.employees.count()
    
    def get_head_of_department_name(self, obj):
        if obj.head_of_department:
            return obj.head_of_department.full_name
        return None

class DesignationSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Designation
        fields = ['id', 'name', 'description', 'employee_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_employee_count(self, obj):
        return Employee.objects.filter(designation=obj.name).count()

class WorkLocationSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkLocation
        fields = ['id', 'name', 'address', 'address2', 'city', 'state', 'pincode', 
                 'is_filing_address', 'employee_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_employee_count(self, obj):
        return Employee.objects.filter(work_location=obj.name).count()

class SalaryComponentSerializer(serializers.ModelSerializer):
    component_type_display = serializers.CharField(source='get_component_type_display', read_only=True)
    calculation_type_display = serializers.CharField(source='get_calculation_type_display', read_only=True)
    
    class Meta:
        model = SalaryComponent
        fields = [
            'id', 'name', 'component_type', 'component_type_display', 'calculation_type', 'calculation_type_display', 'value',
            'is_taxable', 'is_active', 'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class EmployeeListSerializer(serializers.ModelSerializer):
    """Simplified serializer for employee list views"""
    department = serializers.CharField(source='department.name', read_only=True)
    # In current model, designation is a CharField, not a FK
    designation_name = serializers.CharField(source='designation', read_only=True)
    # In current model, work_location is a CharField, not a FK
    work_location_name = serializers.CharField(source='work_location', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    # employment_type has no choices helper now; return raw value
    employment_type_display = serializers.CharField(source='employment_type', read_only=True)
    
    class Meta:
        model = Employee
        fields = ['employee_id', 'first_name', 'last_name', 'full_name', 'work_email', 'personal_email', 
                 'mobile_number','phone_number', 'department', 'designation', 'designation_name',
                 'work_location', 'work_location_name', 'employment_type', 'employment_type_display',
                 'date_of_joining', 'basic_salary', 'annual_ctc', 'monthly_ctc', 'status_display']

class EmployeeDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for employee detail views"""
    user = UserSerializer(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    # designation and work_location are CharFields in current model
    designation_name = serializers.CharField(source='designation', read_only=True)
    work_location_name = serializers.CharField(source='work_location', read_only=True)
    # manager field was removed; keep compatibility by returning None
    manager_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    # return raw values for fields without choices helpers
    employment_type_display = serializers.CharField(source='employment_type', read_only=True)
    gender_display = serializers.CharField(source='gender', read_only=True)
    
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'monthly_ctc', 'full_name']
    
    def validate_employee_id(self, value):
        """Ensure employee_id is unique"""
        if self.instance:
            # If updating, exclude current instance from uniqueness check
            if Employee.objects.filter(employee_id=value).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError("Employee ID already exists.")
        else:
            # If creating, check for any existing employee with this ID
            if Employee.objects.filter(employee_id=value).exists():
                raise serializers.ValidationError("Employee ID already exists.")
        return value
    
    def validate(self, data):
        """Custom validation for employee data"""
        # Validate that date_of_leaving is after date_of_joining
        if data.get('date_of_leaving') and data.get('date_of_joining'):
            if data['date_of_leaving'] <= data['date_of_joining']:
                raise serializers.ValidationError("Date of leaving must be after date of joining.")
        
        # Validate basic salary should not exceed annual CTC
        if data.get('basic_salary') and data.get('annual_ctc'):
            if data['basic_salary'] * 12 > data['annual_ctc']:
                raise serializers.ValidationError("Basic salary cannot exceed annual CTC when multiplied by 12.")
        
        return data

    def get_manager_name(self, obj):
        manager = getattr(obj, 'manager', None)
        return getattr(manager, 'full_name', None) if manager else None

class PayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Payroll
        fields = [
            'id', 'employee', 'employee_name', 'employee_id', 
            'pay_period_start', 'pay_period_end', 'designation',
            'department', 'days_worked', 'total_income', 'basic_salary',
            'hra', 'conveyance', 'meal_allowance', 'telephone_allowance',
            'medical_allowance', 'personal_pay', 'bonus', 'overtime',
            'profession_tax', 'advance', 'gross_pay', 'total_deductions',
            'net_pay', 'status', 'status_display', 'processed_at', 'paid_at',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'gross_pay', 'net_pay', 
            'total_deductions', 'total_income'
        ]
    
    def validate_employee(self, value):
        """Validate that the employee exists"""
        if not value:
            raise serializers.ValidationError("Employee is required")
        return value
    
    def validate(self, data):
        """Custom validation for payroll data"""
        # Validate pay period
        if data.get('pay_period_end') and data.get('pay_period_start'):
            if data['pay_period_end'] <= data['pay_period_start']:
                raise serializers.ValidationError("Pay period end must be after pay period start.")
        
        # Calculate fields if needed
        if 'basic_salary' in data:
            # You might want to calculate allowances based on basic salary here
            pass
            
        return data
    
    def create(self, validated_data):
        # Calculate derived fields before creation
        instance = super().create(validated_data)
        self._calculate_fields(instance)
        instance.save()
        return instance
    
    def update(self, instance, validated_data):
        # Calculate derived fields before update
        instance = super().update(instance, validated_data)
        self._calculate_fields(instance)
        instance.save()
        return instance
    
    def _calculate_fields(self, instance):
        """Helper method to calculate all derived fields"""
        # Calculate total income (basic salary + allowances)
        instance.total_income = (
            instance.basic_salary + 
            instance.hra +
            instance.conveyance +
            instance.meal_allowance +
            instance.telephone_allowance +
            instance.medical_allowance +
            instance.personal_pay +
            instance.bonus +
            instance.overtime
        )
        
        # Calculate total deductions
        instance.total_deductions = (
            instance.profession_tax +
            instance.advance
        )
        
        # Calculate gross pay (same as total income in this case)
        instance.gross_pay = instance.total_income
        
        # Calculate net pay
        instance.net_pay = instance.gross_pay - instance.total_deductions

# Additional serializers for bulk operations
class EmployeeBulkCreateSerializer(serializers.ModelSerializer):
    """Serializer for bulk employee creation"""
    class Meta:
        model = Employee
        fields = ['employee_id', 'first_name', 'last_name', 'email', 'phone', 
                 'department', 'designation', 'work_location', 'employment_type',
                 'date_of_joining', 'basic_salary', 'annual_ctc']
    
    def validate_employee_id(self, value):
        if Employee.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError(f"Employee ID {value} already exists.")
        return value

class EmployeeStatsSerializer(serializers.Serializer):
    """Serializer for employee statistics"""
    total_employees = serializers.IntegerField()
    active_employees = serializers.IntegerField()
    inactive_employees = serializers.IntegerField()
    departments_count = serializers.IntegerField()
    designations_count = serializers.IntegerField()
    work_locations_count = serializers.IntegerField()
    average_salary = serializers.DecimalField(max_digits=10, decimal_places=2)

class LeaveSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Leave
        fields = [
            'id', 'employee', 'employee_name', 'leave_type', 'start_date', 
            'end_date', 'reason', 'status', 'approved_by', 'approved_by_name',
            'approved_at', 'created_at', 'updated_at', 'duration'
        ]
        read_only_fields = ['status', 'approved_by', 'approved_at', 'created_at', 'updated_at']
    
    def get_employee_name(self, obj):
        return obj.employee.get_full_name()
    
    def get_approved_by_name(self, obj):
        return obj.approved_by.get_full_name() if obj.approved_by else None
    
    def get_duration(self, obj):
        return obj.duration
    
    def validate(self, data):
        """Validate leave request dates"""
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("End date must be after start date")
        
        # Check for overlapping leaves
        overlapping_leaves = Leave.objects.filter(
            employee=data['employee'],
            status__in=['PENDING', 'APPROVED'],
            start_date__lte=data['end_date'],
            end_date__gte=data['start_date']
        )
        
        if self.instance:
            overlapping_leaves = overlapping_leaves.exclude(id=self.instance.id)
        
        if overlapping_leaves.exists():
            raise serializers.ValidationError("You have overlapping leave requests for these dates")
        
        return data 

class PaymentInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentInformation
        fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
    salarycomponent_set = SalaryComponentSerializer(many=True, read_only=True)
    paymentinformation_set = PaymentInformationSerializer(many=True, read_only=True)

    class Meta:
        model = Employee
        fields = '__all__' 

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'name', 'type', 'employee', 'department', 'description', 
                'status', 'upload_date', 'size', 'file_path']
        
