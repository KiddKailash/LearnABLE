"""
Admin configuration for the Classes model.
This allows the Classes model to be managed via the Django admin interface.
"""

from django.contrib import admin
from .models import Classes  

admin.site.register(Classes)
