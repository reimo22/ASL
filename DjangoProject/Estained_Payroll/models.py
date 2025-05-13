from django.db import models
from django.forms import FileField
from django.utils import timezone
# Create your models here.

class EmployeeProfile(models.Model):
    employee_id = models.IntegerField(unique=True)
    employee_name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    position = models.CharField(max_length=100, default="Employee")
    hire_date = models.DateField()
    address = models.CharField(max_length=255)
    age = models.PositiveIntegerField(null=True, default=0)
    pay_rate = models.DecimalField(max_digits=10, decimal_places=2)
    SSS = models.PositiveIntegerField(null=True, default=0)
    PHILHEALTH = models.PositiveIntegerField(null=True, default=0)
    LOANS = models.PositiveIntegerField(null=True, default=0)
    OTHERS = models.PositiveIntegerField(null=True, default=0)


    def __str__(self):
        return f"{self.employee_id}"


class Holiday(models.Model):
    """Model for storing holiday information"""
    HOLIDAY_TYPES = (
        ('none', 'None'),
        ('special-non-working', 'Special Non-Working Holiday'),
        ('local', 'Local Holiday'),
        ('national', 'National Holiday'),
    )

    date = models.DateField()
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=HOLIDAY_TYPES, null=False)

    class Meta:
        unique_together = ['date']  # Ensure each date only has one holiday entry

    def __str__(self):
        return f"{self.name} on {self.date}"


class stagingAttendance(models.Model):
    payroll_id= models.CharField(max_length=20)
    date = models.DateField()
    employee_id = models.CharField(max_length=20)
    morning_in = models.CharField(max_length=5, blank=True, null=True)
    morning_out = models.CharField(max_length=5, blank=True, null=True)
    afternoon_in = models.CharField(max_length=5, blank=True, null=True)
    afternoon_out = models.CharField(max_length=5, blank=True, null=True)
    normal_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        # Ensure we don't have duplicate entries for the same employee, date, and pay period
        unique_together = ('payroll_id', 'date', 'employee_id')

    def __str__(self):
        return self.employee_id

class ActualAttendance(models.Model):
    payroll_id= models.CharField(max_length=25)
    date = models.DateField()
    employee_id = models.CharField(max_length=20)
    morning_in = models.CharField(max_length=5, blank=True, null=True)
    morning_out = models.CharField(max_length=5, blank=True, null=True)
    afternoon_in = models.CharField(max_length=5, blank=True, null=True)
    afternoon_out = models.CharField(max_length=5, blank=True, null=True)
    normal_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        # Ensure we don't have duplicate entries for the same employee, date, and pay period
        unique_together = ('payroll_id', 'date', 'employee_id')

    def __str__(self):
        return self.employee_id

class payperiod(models.Model):
    period_id = models.CharField(max_length=20 ,unique=True)
    start_date = models.DateField(unique=True)
    end_date = models.DateField(unique=True)

    def __str__(self):
        return self.period_id

class Payrates(models.Model):
    Type = models.CharField(max_length=20)
    Rate = models.DecimalField(max_digits=3, decimal_places=2)

class Payroll(models.Model):
    payroll_period = models.ForeignKey(payperiod, on_delete=models.CASCADE)
    employee = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name="salary_details")
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    normal_time = models.DecimalField(max_digits=10, decimal_places=2)
    overtime = models.DecimalField(max_digits=10, decimal_places=2)
    normal_time_salary = models.DecimalField(max_digits=10, decimal_places=2)
    overtime_salary = models.DecimalField(max_digits=10, decimal_places=2)
    gross_salary = models.DecimalField(max_digits=10, decimal_places=2)
    deductions = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2)
    adjustment = models.DecimalField(max_digits=10, decimal_places=2)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2)
    salary_given = models.DecimalField(max_digits=10, decimal_places=2, default = 0)
    status = models.BooleanField(default=False)

    def __str__(self):
        return f"Salary for {self.employee.employee_name} ({self.employee.employee_id})"

class audits(models.Model):
    User = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    Action = models.CharField(max_length=40)
    module = models.CharField(max_length=40)
    section = models.CharField(max_length=40)
    target = models.CharField(max_length=40)
    old_value = models.CharField(max_length=40)
    New_Value = models.CharField(max_length=40)

    def __str__(self):
        return self.Action

class Filings(models.Model):
    FILING_TYPES = (
        ('none', 'None'),
        ('Overtime', 'Overtime'),
        ('Official Business', 'Official Business'),
        ('Sick Leave', 'Sick Leave'),
        ('Vacation Leave', 'Vacation Leave'),
    )

    STATUS_TYPES = (
        ('Rejected', 'Rejected'),
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
    )
    employee_id = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE)
    Filing_Type = models.CharField(max_length=40, choices=FILING_TYPES, null = False)
    Effective_Date = models.DateField(null = False, blank = False)
    Reason = models.CharField(max_length=40, null = False, blank = False)
    attachments = models.FileField(upload_to='attachments/', null = True, blank = True)
    status = models.CharField(max_length=40, choices=STATUS_TYPES, default='Pending')

    def __str__(self):
        return self.Filing_Type