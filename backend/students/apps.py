"""
Configuration for the Students app.

Defines the StudentsConfig class which registers the app and
executes startup code such as importing signals when the app is ready.
"""

from django.apps import AppConfig

class StudentsConfig(AppConfig):
    """
    Configuration class for the 'students' Django app.

    This class sets the default auto field type for primary keys
    and imports signal handlers when the app is ready to ensure
    signal registration.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'students'

    def ready(self):
        import students.signals
