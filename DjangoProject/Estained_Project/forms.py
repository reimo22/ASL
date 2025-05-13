from django import forms
from Estained_Payroll.models import EmployeeProfile  # adjust this based on your actual model

class EmployeeForm(forms.ModelForm):
    class Meta:
        model = EmployeeProfile
        fields = ['employee_id', 'employee_name', 'department', 'hire_date', 'pay_rate', 'address', 'age']

        widgets = {
            'employee_id': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter ID'}),
            'employee_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter name'}),
            'department': forms.Select(attrs={'class': 'form-control'}),
            'hire_date': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'YYYY-MM-DD'}),
            'pay_rate': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': '0.00'}),
            'address': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter address'}),
            'age': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Enter age'}),
        }