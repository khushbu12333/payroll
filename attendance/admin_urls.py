from django.urls import path
from . import admin_views

app_name = 'attendance_admin'

urlpatterns = [
    path('attendance/', admin_views.AttendanceAdminView.as_view(), name='attendance_list'),
    path('attendance/add/', admin_views.AttendanceAdminCreateView.as_view(), name='attendance_add'),
    path('attendance/<int:pk>/change/', admin_views.AttendanceAdminUpdateView.as_view(), name='attendance_change'),
    path('attendance/<int:pk>/delete/', admin_views.AttendanceAdminDeleteView.as_view(), name='attendance_delete'),
] 