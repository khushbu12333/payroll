"""
URL configuration for exellar_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
# from authentication import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('payroll.urls')),
    path('', api_root),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

def api_root(request):
    """Root API endpoint"""
    return JsonResponse({
        'message': 'Payroll API is running',
        'version': '1.0',
        'endpoints': {
            'dashboard_stats': '/api/dashboard/stats/',
            'employee_stats': '/api/employees/stats/',
            'health_check': '/api/health/',
        }
    })

