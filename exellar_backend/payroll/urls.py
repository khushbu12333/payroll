from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    EmployeeViewSet, DepartmentViewSet, DesignationViewSet, 
    WorkLocationViewSet, SalaryComponentViewSet, 
    PayrollViewSet, LeaveViewSet,
    login_api, EmployeeListView,
    PaymentInformationViewSet, EmployeeListCreateView, DocumentViewSet
)

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'designations', DesignationViewSet)
router.register(r'work-locations', WorkLocationViewSet)
router.register(r'salary-components', SalaryComponentViewSet)
router.register(r'payroll', PayrollViewSet)
router.register(r'leave', LeaveViewSet)
router.register(r'payment-information', PaymentInformationViewSet)
router.register(r'documents', DocumentViewSet)


# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('login/', login_api, name='login_api'),
    path('employees/', EmployeeListView.as_view()),
    path('employees/', EmployeeListCreateView.as_view(), name='employee-list-create'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    path('employees/stats/', views.employee_stats, name='employee_stats'),
    path('detailed-stats/', views.detailed_dashboard_stats, name='detailed_dashboard_stats'),
    
    # Health check
    path('health/', views.api_health_check, name='api_health_check'),
    path('', views.api_health_check, name='api_root'), 
]