from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods

from Estained_Project.forms import EmployeeForm
from Estained_Payroll.models import EmployeeProfile, Holiday
from Estained_Project.forms import EmployeeForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from datetime import datetime, timedelta, date

#def login(request):
#   return render(request, 'login.html')

def homepage(request):
    return render(request, 'homepage.html')
def attendance(request):
    return render(request, 'attendance.html')

def audit_logs(request):
    return render(request, 'audit-logs.html')

def calendar(request):
    return render(request, 'calender.html')

def employee_filings(request):
    return render(request, 'employeeFilings.html')

def manage_profiles(request):
    employees = EmployeeProfile.objects.all()

    # Initialize the form (this could be for creating a new profile or updating an existing one)
    form = EmployeeForm()

    # Pass employees and form to the template
    return render(request, 'manageProfiles.html', {'form': form, 'employees': employees})

def payroll(request):
    return render(request, 'payroll.html')

def profile(request):
    return render(request, 'profile.html')


def employee_form_view(request):
    print("🛠️ ENTERED employee_form_view")

    if request.method == 'POST':
        employee_id = request.POST.get('employee_id')
        action = request.POST.get('action')  # add or update
        print("🛠️ ENTERED request")
        try:
            instance = EmployeeProfile.objects.get(employee_id=employee_id)
            print("same profile")
        except EmployeeProfile.DoesNotExist:
            instance = None
            print("not profile")

        form = EmployeeForm(request.POST, instance=instance)

        if form.is_valid():
            form.save()
            print("✅ Saved:", form.cleaned_data)
            return redirect('employee_form')
        else:
            print("❌ Invalid Form:", form.errors)

    else:
        form = EmployeeForm()

    employees = EmployeeProfile.objects.all()
    return render(request, 'manageProfiles.html', {'form': form, 'employees': employees})


def calendar_view(request):
    """Render the calendar page"""
    return render(request, 'calendar.html')

# employee profile and filings
def filings(request):
    return render(request, 'personalAttendance.html')

def employee_profile(request):
    return render(request, 'employee-profile.html')



@require_http_methods(["GET", "POST", "DELETE"])
def holiday_api(request):
    """API endpoint for managing holidays"""

    # Helper: Load predefined national holidays
    def preload_national_holidays():
        current_year = datetime.now().year
        holidays_to_create = []

        fixed_holidays = [
            {"month": 1, "day": 1, "name": "New Year's Day", "type": "national"},
            {"month": 4, "day": 9, "name": "Araw ng Kagitingan", "type": "national"},
            {"month": 5, "day": 1, "name": "Labor Day", "type": "national"},
            {"month": 6, "day": 12, "name": "Independence Day", "type": "national"},
            {"month": 8, "day": 26, "name": "National Heroes Day", "type": "national"},
            # Last Monday of August (adjustable)
            {"month": 11, "day": 30, "name": "Bonifacio Day", "type": "national"},
            {"month": 12, "day": 25, "name": "Christmas Day", "type": "national"},
            {"month": 12, "day": 30, "name": "Rizal Day", "type": "national"},

            # Special (Non-Working) Holidays
            {"month": 2, "day": 25, "name": "EDSA People Power Revolution Anniversary", "type": "special-non-working"},
            {"month": 8, "day": 21, "name": "Ninoy Aquino Day", "type": "special-non-working"},
            {"month": 11, "day": 1, "name": "All Saints' Day", "type": "special-non-working"},
            {"month": 12, "day": 8, "name": "Feast of the Immaculate Conception", "type": "special-non-working"},
            {"month": 12, "day": 31, "name": "New Year's Eve", "type": "special-non-working"},
        ]

        for year in range(current_year, current_year + 5):
            for h in fixed_holidays:
                holiday_date = date(year, h["month"], h["day"])
                if not Holiday.objects.filter(date=holiday_date).exists():
                    holidays_to_create.append(Holiday(
                        date=holiday_date,
                        name=h["name"],
                        type=h["type"]
                    ))

        Holiday.objects.bulk_create(holidays_to_create)

    if request.method == "GET":
        # Preload if empty
        if not Holiday.objects.exists():
            preload_national_holidays()

        # Get holidays for a specific year or month
        year = request.GET.get('year')
        month = request.GET.get('month')

        if year and month:
            holidays = Holiday.objects.filter(
                date__year=year,
                date__month=month
            )
        elif year:
            holidays = Holiday.objects.filter(date__year=year)
        else:
            holidays = Holiday.objects.all()

        holiday_list = [
            {
                'date': holiday.date.strftime('%Y-%m-%d'),
                'name': holiday.name,
                'type': holiday.type
            }
            for holiday in holidays
        ]

        return JsonResponse({'holidays': holiday_list})

    elif request.method == "POST":
        # Add or update a holiday
        try:
            data = json.loads(request.body)
            date_str = data.get('date')
            name = data.get('name')
            holiday_type = data.get('type')

            if not all([date_str, name, holiday_type]):
                return JsonResponse({
                    'success': False,
                    'error': 'Missing required fields'
                }, status=400)

            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()

            holiday, created = Holiday.objects.update_or_create(
                date=date_obj,
                defaults={
                    'name': name,
                    'type': holiday_type
                }
            )

            return JsonResponse({
                'success': True,
                'created': created,
                'holiday': {
                    'date': holiday.date.strftime('%Y-%m-%d'),
                    'name': holiday.name,
                    'type': holiday.type
                }
            })

        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=400)

    elif request.method == "DELETE":
        try:
            data = json.loads(request.body)
            date_str = data.get('date')

            if not date_str:
                return JsonResponse({
                    'success': False,
                    'error': 'Date required'
                }, status=400)

            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()

            try:
                holiday = Holiday.objects.get(date=date_obj)
                holiday.delete()
                return JsonResponse({
                    'success': True,
                    'message': f'Holiday on {date_str} deleted'
                })
            except Holiday.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': f'No holiday found for {date_str}'
                }, status=404)

        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=400)
    return None


