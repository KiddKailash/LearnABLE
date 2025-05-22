"""
Registers the LearningMaterials model to the Django admin interface for easy management.
"""

from django.contrib import admin
from .models import LearningMaterials  # Import your model

admin.site.register(LearningMaterials)
