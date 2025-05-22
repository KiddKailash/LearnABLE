"""
Admin configuration for the 'nccdreports' app.

Registers the NCCDreport model to the Django admin site.
"""

from django.contrib import admin
from .models import NCCDreport  # Import your model

admin.site.register(NCCDreport)
