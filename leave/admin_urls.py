from django.urls import path
from . import admin_views

app_name = 'leave_admin'

urlpatterns = [
    path('leavetype/', admin_views.LeaveTypeAdminView.as_view(), name='leavetype_list'),
    path('leavetype/add/', admin_views.LeaveTypeAdminCreateView.as_view(), name='leavetype_add'),
    path('leavetype/<int:pk>/change/', admin_views.LeaveTypeAdminUpdateView.as_view(), name='leavetype_change'),
    path('leavetype/<int:pk>/delete/', admin_views.LeaveTypeAdminDeleteView.as_view(), name='leavetype_delete'),
] 