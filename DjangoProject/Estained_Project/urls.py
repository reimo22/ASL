"""
URL configuration for Estained_Project project.

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
from django.urls import path
from Estained_Payroll import views
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.homepage, name='homepage'),
    path('attendance/', views.attendance, name='attendance'),
    path('audit-logs/', views.audit_logs, name='audit_logs'),
    path('calendar/', views.calendar, name='calendar'),
    path('employee-filings/', views.employee_filings, name='employee_filings'),
    path('manage-profiles/', views.manage_profiles, name='manage_profiles'),
    path('payroll/', views.payroll, name='payroll'),
    path('profile/', views.profile, name='profile'),
    path('employee-form/', views.employee_form_view, name='employee_form'),
    path('calendar/', views.calendar_view, name='calendar'),
    path('api/holidays/', views.holiday_api, name='holiday_api'),
    path('filings/', views.filings, name='filings'),
    path('employee-profile/', views.employee_profile, name='employee_profile'),

]
