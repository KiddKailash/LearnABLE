"""
Admin configuration for the Student model.

Registers the Student model with the Django admin site
to allow admin management through the Django admin interface.
"""

from django.contrib import admin
from .models import Student

admin.site.register(Student)

