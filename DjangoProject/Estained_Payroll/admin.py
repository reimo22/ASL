

# Register your models here.
from django.contrib import admin
from Estained_Payroll.models import EmployeeProfile, Holiday, Filings

admin.site.register(EmployeeProfile)
admin.site.register(Holiday)
admin.site.register(Filings)
