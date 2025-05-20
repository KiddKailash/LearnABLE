"""
App configuration for the learningmaterial module.
"""

from django.apps import AppConfig


class LearningmaterialConfig(AppConfig):
    # Default app config for managing learning material-related features
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'learningmaterial'
