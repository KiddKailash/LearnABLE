"""
App configuration for the 'classes' Django application.

This module defines the configuration class used by Django to set up 
and initialize the 'classes' app, including the registration of any 
signal handlers upon application readiness.
"""

from django.apps import AppConfig

class ClassesConfig(AppConfig):
    """
    Configuration class for the 'classes' Django app.

    Attributes:
        default_auto_field (str): The default primary key field type to use for models.
        name (str): The full Python path to the application.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'classes'

    def ready(self):
        """
        Called when the Django app registry is fully populated.
        Imports the signal handlers for the 'classes' app to ensure they are registered.
        """
        import classes.signals
