from django.shortcuts import render, redirect
from . import views 
from django.db.models import Avg, Count, Q, Sum, Max
from django.utils import timezone
from rest_framework import viewsets, status, filters, generics
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Employee, Department, Designation, WorkLocation, SalaryComponent, Payroll, Leave, PaymentInformation, Document
from .serializers import (
    EmployeeListSerializer, EmployeeDetailSerializer, EmployeeBulkCreateSerializer, EmployeeStatsSerializer,
    DepartmentSerializer, DesignationSerializer, WorkLocationSerializer, 
    SalaryComponentSerializer, PayrollSerializer, LeaveSerializer,
    EmployeeSerializer, PaymentInformationSerializer, DocumentSerializer
)
from django.http import JsonResponse
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.filters import SearchFilter
from django.contrib.auth import authenticate, login
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework.views import APIView
import django_filters
from .models import SalaryComponent
from django.core.mail import send_mail
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg
from django.db.models.functions import Coalesce
from .models import Employee  # Import your Employee model
import logging


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing departments
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get department statistics"""
        total_departments = Department.objects.count()
        departments_with_employees = Department.objects.annotate(
            emp_count=Count('employee', filter=Q(employee__status='ACTIVE'))
        ).filter(emp_count__gt=0).count()
        
        return Response({
            'total_departments': total_departments,
            'departments_with_employees': departments_with_employees,
            'departments_without_employees': total_departments - departments_with_employees
        })

class DesignationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing designations
    """
    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    lookup_field = 'name'  # Add this line if you want to lookup by name
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get designation statistics"""
        total_designations = Designation.objects.count()
        designations_with_employees = Designation.objects.annotate(
            emp_count=Count('employee', filter=Q(employee__status='ACTIVE'))
        ).filter(emp_count__gt=0).count()
        
        return Response({
            'total_designations': total_designations,
            'designations_with_employees': designations_with_employees,
            'designations_without_employees': total_designations - designations_with_employees
        })

class WorkLocationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing work locations
    """
    queryset = WorkLocation.objects.all()
    serializer_class = WorkLocationSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'city', 'state']
    filterset_fields = ['city', 'state', 'is_filing_address']
    ordering_fields = ['name', 'city', 'created_at']
    ordering = ['name']
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get work location statistics"""
        total_locations = WorkLocation.objects.count()
        filing_addresses = WorkLocation.objects.filter(is_filing_address=True).count()
        locations_with_employees = WorkLocation.objects.annotate(
            emp_count=Count('employee', filter=Q(employee__status='ACTIVE'))
        ).filter(emp_count__gt=0).count()
        
        return Response({
            'total_locations': total_locations,
            'filing_addresses': filing_addresses,
            'locations_with_employees': locations_with_employees,
            'locations_without_employees': total_locations - locations_with_employees
        })

class SalaryComponentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing salary components
    """
    queryset = SalaryComponent.objects.all()
    serializer_class = SalaryComponentSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['component_type', 'calculation_type']
    filterset_fields = ['component_type', 'calculation_type', 'is_active', 'is_taxable']
    ordering_fields = ['component_type', 'calculation_type']
    ordering = ['component_type', 'name']
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get salary component statistics"""
        total_components = SalaryComponent.objects.count()
        active_components = SalaryComponent.objects.filter(is_active=True).count()
        earnings = SalaryComponent.objects.filter(component_type='EARNING').count()
        deductions = SalaryComponent.objects.filter(component_type='DEDUCTION').count()
        taxable_components = SalaryComponent.objects.filter(is_taxable=True).count()
        
        return Response({
            'total_components': total_components,
            'active_components': active_components,
            'inactive_components': total_components - active_components,
            'earnings': earnings,
            'deductions': deductions,
            'taxable_components': taxable_components
        })

class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing employees with different serializers for list and detail views
    """
    queryset = Employee.objects.all()
    permission_classes = [AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['employee_id', 'first_name', 'last_name', 'work_email']
    filterset_fields = ['department', 'designation', 'work_location', 'employment_type', 'gender']
    ordering_fields = ['employee_id', 'first_name', 'last_name', 'date_of_joining', 'basic_salary', 'annual_ctc']
    ordering = ['employee_id']
    lookup_field = 'employee_id'
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return EmployeeListSerializer
        elif self.action == 'bulk_create':
            return EmployeeBulkCreateSerializer
        return EmployeeDetailSerializer

    def destroy(self, request, *args, **kwargs):
        """Custom delete to avoid FK issues with legacy column names.
        Ensures related leaves and payroll rows are removed before employee.
        """
        employee = self.get_object()
        try:
            # Best effort cleanup of related rows before deleting the employee
            # Use ORM relations when possible
            try:
                Payroll.objects.filter(employee=employee).delete()
            except Exception:
                pass
            try:
                Leave.objects.filter(employee=employee).delete()
            except Exception:
                pass

            # Raw SQL fallback for legacy tables/columns
            from django.db import connection
            with connection.cursor() as cursor:
                try:
                    cursor.execute("DELETE FROM leave WHERE employee_id = %s", [employee.employee_id])
                except Exception:
                    # ignore if column or table not present
                    pass
                try:
                    cursor.execute("DELETE FROM payroll WHERE employee_id = %s", [employee.employee_id])
                except Exception:
                    pass

            return super().destroy(request, *args, **kwargs)
        except Exception as exc:
            return Response({
                'error': 'Failed to delete employee',
                'detail': str(exc)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Bulk create employees"""
        serializer = EmployeeBulkCreateSerializer(data=request.data, many=True)
        if serializer.is_valid():
            employees = serializer.save()
            return Response({
                'message': f'Successfully created {len(employees)} employees',
                'employees': EmployeeListSerializer(employees, many=True).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get employee statistics"""
        total_employees = Employee.objects.count()
        active_employees = Employee.objects.filter(status='ACTIVE').count()
        inactive_employees = Employee.objects.filter(status='INACTIVE').count()
        terminated_employees = Employee.objects.filter(status='TERMINATED').count()
        
        # Department and designation counts
        departments_count = Department.objects.count()
        designations_count = Designation.objects.count()
        work_locations_count = WorkLocation.objects.count()
        
        # Average salary
        average_salary = Employee.objects.filter(status='ACTIVE').aggregate(
            avg_salary=Avg('annual_ctc')
        )['avg_salary'] or 0
        
        # Employment type breakdown
        employment_types = Employee.objects.filter(status='ACTIVE').values('employment_type').annotate(
            count=Count('employee_id')
        )
        
        # Gender breakdown
        gender_breakdown = Employee.objects.filter(status='ACTIVE').values('gender').annotate(
            count=Count('employee_id')
        )
        
        stats_data = {
            'total_employees': total_employees,
            'active_employees': active_employees,
            'inactive_employees': inactive_employees,
            'terminated_employees': terminated_employees,
            'departments_count': departments_count,
            'designations_count': designations_count,
            'work_locations_count': work_locations_count,
            'average_salary': round(average_salary, 2),
            'employment_types': list(employment_types),
            'gender_breakdown': list(gender_breakdown)
        }
        
        serializer = EmployeeStatsSerializer(data=stats_data)
        if serializer.is_valid():
            return Response(serializer.data)
        return Response(stats_data)
    
    @action(detail=True, methods=['post'])
    def add_salary_component(self, request, pk=None):
        """Add a salary component to an employee"""
        employee = self.get_object()
        data = request.data.copy()
        data['employee'] = employee.id
        
        serializer = EmployeeSalaryComponentSerializer(data=data) # type: ignore
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def payroll_history(self, request, pk=None):
        """Get payroll history for a specific employee"""
        employee = self.get_object()
        payrolls = Payroll.objects.filter(employee=employee).order_by('-pay_period_start')
        
        # Pagination
        page = self.paginate_queryset(payrolls)
        if page is not None:
            serializer = PayrollSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = PayrollSerializer(payrolls, many=True)
        return Response(serializer.data)

class PayrollViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing payroll
    """
    queryset = Payroll.objects.select_related('employee').all()
    serializer_class = PayrollSerializer
    permission_classes = [AllowAny]  # Adjust permissions as needed
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['employee__employee_id', 'employee__first_name', 'employee__last_name']
    filterset_fields = ['employee', 'status', 'pay_period_start', 'pay_period_end', 'department']
    ordering_fields = ['pay_period_start', 'employee', 'net_pay', 'gross_pay', 'basic_salary']
    ordering = ['-pay_period_start', 'employee']
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get payroll statistics"""
        total_payrolls = Payroll.objects.count()
        draft_payrolls = Payroll.objects.filter(status='DRAFT').count()
        processed_payrolls = Payroll.objects.filter(status='PROCESSED').count()
        paid_payrolls = Payroll.objects.filter(status='PAID').count()
        
        # Total salary disbursed
        total_disbursed = Payroll.objects.filter(status='PAID').aggregate(
            total=Sum('net_pay')
        )['total'] or 0
        
        # Average salary
        average_salary = Payroll.objects.aggregate(
            avg_salary=Avg('net_pay')
        )['avg_salary'] or 0
        
        # Department-wise statistics
        department_stats = Payroll.objects.filter(status='PAID').values('department').annotate(
            total=Sum('net_pay'),
            count=Count('id'),
            avg=Avg('net_pay')
        )
        
        return Response({
            'total_payrolls': total_payrolls,
            'draft_payrolls': draft_payrolls,
            'processed_payrolls': processed_payrolls,
            'paid_payrolls': paid_payrolls,
            'total_disbursed': round(total_disbursed, 2),
            'average_salary': round(average_salary, 2),
            'department_stats': department_stats
        })
    
    @action(detail=False, methods=['get'])
    def employee_stats(self, request):
        """Get payroll statistics by employee"""
        employee_id = request.query_params.get('employee_id')
        if not employee_id:
            return Response(
                {'error': 'employee_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        stats = Payroll.objects.filter(employee__employee_id=employee_id).aggregate(
            total_payrolls=Count('id'),
            total_earned=Sum('net_pay'),
            average_salary=Avg('net_pay'),
            last_payment=Max('pay_period_end')
        )
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Process a payroll"""
        payroll = self.get_object()
        if payroll.status != 'DRAFT':
            return Response(
                {'error': 'Only draft payrolls can be processed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payroll.status = 'PROCESSED'
        payroll.processed_at = timezone.now()
        
        # Recalculate all fields before saving
        serializer = self.get_serializer(payroll)
        serializer._calculate_fields(payroll)
        
        payroll.save()
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark a payroll as paid"""
        payroll = self.get_object()
        if payroll.status != 'PROCESSED':
            return Response(
                {'error': 'Only processed payrolls can be marked as paid'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payroll.status = 'PAID'
        payroll.paid_at = timezone.now()
        payroll.save()
        
        serializer = self.get_serializer(payroll)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def recalculate(self, request, pk=None):
        """Recalculate payroll fields"""
        payroll = self.get_object()
        if payroll.status == 'PAID':
            return Response(
                {'error': 'Paid payrolls cannot be recalculated'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(payroll)
        serializer._calculate_fields(payroll)
        payroll.save()
        
        return Response(serializer.data)

class LeaveViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing leave requests
    """
    queryset = Leave.objects.select_related('employee', 'approved_by').all()
    serializer_class = LeaveSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access for development
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['employee__first_name', 'employee__last_name', 'reason']
    filterset_fields = ['employee', 'leave_type', 'status', 'start_date', 'end_date']
    ordering_fields = ['start_date', 'end_date', 'created_at', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter queryset based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a leave request"""
        leave = self.get_object()
        
        if leave.status != 'PENDING':
            return Response(
                {'error': 'Only pending leave requests can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        leave.status = 'APPROVED'
        leave.approved_by = request.user.employee
        leave.approved_at = timezone.now()
        leave.save()
        
        serializer = self.get_serializer(leave)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a leave request"""
        leave = self.get_object()
        
        if leave.status != 'PENDING':
            return Response(
                {'error': 'Only pending leave requests can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        leave.status = 'REJECTED'
        leave.approved_by = request.user.employee
        leave.approved_at = timezone.now()
        leave.save()
        
        serializer = self.get_serializer(leave)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a leave request"""
        leave = self.get_object()
        
        if leave.status not in ['PENDING', 'APPROVED']:
            return Response(
                {'error': 'Only pending or approved leave requests can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        leave.status = 'CANCELLED'
        leave.save()
        
        serializer = self.get_serializer(leave)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get leave statistics"""
        total_leaves = Leave.objects.count()
        pending_leaves = Leave.objects.filter(status='PENDING').count()
        approved_leaves = Leave.objects.filter(status='APPROVED').count()
        rejected_leaves = Leave.objects.filter(status='REJECTED').count()
        cancelled_leaves = Leave.objects.filter(status='CANCELLED').count()
        
        # Leave type breakdown
        leave_types = Leave.objects.values('leave_type').annotate(
            count=Count('id')
        )
        
        # Monthly leave trends
        current_year = timezone.now().year
        monthly_leaves = Leave.objects.filter(
            start_date__year=current_year
        ).values('start_date__month').annotate(
            count=Count('id')
        ).order_by('start_date__month')
        
        return Response({
            'total_leaves': total_leaves,
            'pending_leaves': pending_leaves,
            'approved_leaves': approved_leaves,
            'rejected_leaves': rejected_leaves,
            'cancelled_leaves': cancelled_leaves,
            'leave_types': list(leave_types),
            'monthly_trends': list(monthly_leaves)
        })


@csrf_exempt
def login_api(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        # Note: Django's authenticate uses 'username', so we pass the email to it.
        user = authenticate(request, username=user_obj.username, password=password) # type: ignore

        if user is not None:
            login(request, user)

            # 📩 Send email to user's own email
            send_mail(
                subject='Login Successful',
                message='Hi! You have successfully logged in to your account. Welcome to Payroll Management System. "AAPKA SWAGAT HAI PAYROLL SYSTEM MEIN"',
                from_email='rajpalkhushbu4@gmail.com',
                recipient_list=[email],
                fail_silently=False,
            )

            return JsonResponse({'message': 'Login successful and email sent'}, status=200)
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

class DesignationListView(generics.ListAPIView):
    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer

class DepartmentListView(generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class WorkLocationListView(generics.ListAPIView):
    queryset = WorkLocation.objects.all()
    serializer_class = WorkLocationSerializer

class SalaryComponentListView(generics.ListAPIView):
    queryset = SalaryComponent.objects.all()
    serializer_class = SalaryComponentSerializer

class EmployeeListView(generics.ListAPIView):
    queryset = Employee.objects.all()
    filterset_fields = ['department', 'designation']  # removed 'status'
    search_fields = ['first_name', 'last_name']       # removed 'status'
      # Filtering and searching
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['department', 'designation']  # You can add more if needed
    search_fields = ['first_name', 'last_name']


def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            # Send welcome email
            send_mail(
                subject='Login Successful',
                message='Welcome to Payroll Management System.AAPKA SWAGAT HAI PAYROLL SYSTEM MEIN You have successfully logged in to your account.',
                from_email='rajpalkhushbu4@gmail.com',
                recipient_list=[user.email],
                fail_silently=False,
            )
            return redirect('dashboard')  # or wherever you want to redirect
        else:
            # Invalid login
            pass
    return render(request, 'login.html')

class PaymentInformationViewSet(viewsets.ModelViewSet):
    queryset = PaymentInformation.objects.all()
    serializer_class = PaymentInformationSerializer

class EmployeeListCreateView(APIView):
    def post(self, request):
        serializer = EmployeeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    parser_classes = (MultiPartParser, FormParser)
   

logger = logging.getLogger(__name__)

@api_view(['GET'])
def dashboard_stats(request):
    """
    API endpoint to get dashboard statistics
    """
    try:
        logger.info("Fetching dashboard stats...")
        
        # Get all employees and filter active ones
        all_employees = Employee.objects.all()
        active_employees = all_employees.filter(status='ACTIVE')
        
        # Calculate total employees
        total_employees = active_employees.count()
        logger.info(f"Total active employees: {total_employees}")
        
        # Calculate total monthly payroll
        # Using Coalesce to handle null values
        payroll_data = active_employees.aggregate(
            total_annual=Coalesce(Sum('annual_ctc'), 0),
            avg_salary=Coalesce(Avg('annual_ctc'), 0)
        )
        
        total_annual_payroll = float(payroll_data['total_annual'] or 0)
        monthly_payroll = total_annual_payroll / 12 if total_annual_payroll else 0
        
        logger.info(f"Total annual payroll: {total_annual_payroll}")
        logger.info(f"Monthly payroll: {monthly_payroll}")
        
        pending_requests = 0  # TODO: Implement based on your request/leave model
        attendance_rate = 85.5  # TODO: Implement based on your attendance model
        leave_requests = 0  # TODO: Implement based on your leave request model
        
        
        response_data = {
            'totalEmployees': total_employees,
            'totalPayroll': round(monthly_payroll),
            'pendingRequests': pending_requests,
            'attendanceRate': attendance_rate,
            'leaveRequests': leave_requests,  # Fixed: Added missing closing quote
        }
        
        logger.info(f"Dashboard stats response: {response_data}")
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        return Response(
            {
                'error': f'Failed to fetch dashboard stats: {str(e)}',
                'totalEmployees': 0,
                'totalPayroll': 0,
                'pendingRequests': 0,
                'attendanceRate': 0,
                'leaveRequests': 0,
            }, 
            status=500
        )

@api_view(['GET'])
def employee_stats(request):
    """
    Alternative endpoint for employee statistics
    """
    try:
        active_employees = Employee.objects.filter(status='ACTIVE')
        
        stats = {
            'totalEmployees': active_employees.count(),
            'totalPayroll': 0,
            'pendingRequests': 0,
            'attendanceRate': 0,
            'leaveRequests': 0,
        }
        
        # Calculate payroll if employees exist
        if active_employees.exists():
            total_annual = active_employees.aggregate(
                total=Coalesce(Sum('annual_ctc'), 0)
            )['total']
            stats['totalPayroll'] = round(float(total_annual or 0) / 12)
        
        return Response(stats)
        
    except Exception as e:
        logger.error(f"Error fetching employee stats: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=500
        )

@api_view(['GET'])
def api_health_check(request):
    """
    Simple health check endpoint
    """
    return Response({
        'status': 'healthy',
        'message': 'API is working correctly',
        'timestamp': timezone.now().isoformat()
    })

# If you want to add more detailed stats later, here's an example:
@api_view(['GET'])
def detailed_dashboard_stats(request):
    """
    More detailed dashboard statistics
    """
    try:
        from django.utils import timezone
        from datetime import datetime, timedelta
        
        current_month = timezone.now().month
        current_year = timezone.now().year
        
        # Employee statistics
        all_employees = Employee.objects.all()
        active_employees = all_employees.filter(status='ACTIVE')
        
        # Department-wise breakdown
        department_stats = active_employees.values('department__name').annotate(
            count=Count('id'),
            total_salary=Sum('annual_ctc')
        ).order_by('-count')
        
        # Recent hires (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_hires = active_employees.filter(
            date_of_joining__gte=thirty_days_ago
        ).count()
        
        # Employment type breakdown
        employment_breakdown = active_employees.values('employment_type').annotate(
            count=Count('id')
        )
        
        response_data = {
            'totalEmployees': active_employees.count(),
            'totalPayroll': round(float(active_employees.aggregate(
                total=Coalesce(Sum('annual_ctc'), 0)
            )['total'] or 0) / 12),
            'recentHires': recent_hires,
            'departmentStats': list(department_stats),
            'employmentBreakdown': list(employment_breakdown),
            'pendingRequests': 0,  # Implement based on your models
            'attendanceRate': 85.5,  # Implement based on your models
            'leaveRequests': 0,  # Implement based on your models
        }
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Error fetching detailed stats: {str(e)}")
        return Response({'error': str(e)}, status=500)
 