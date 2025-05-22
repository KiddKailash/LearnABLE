from django.contrib import admin
from .models import Classes  # Import your Teacher model

"""
Admin configuration for the Classes model.
This allows the Classes model to be managed via the Django admin interface.
"""

admin.site.register(Classes)
