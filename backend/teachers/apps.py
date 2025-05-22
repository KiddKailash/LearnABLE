"""
Configuration for the 'teachers' Django app.

Defines the app's default primary key field type and performs setup actions when the app is ready,
such as importing signal handlers.
"""

from django.apps import AppConfig


class TeachersConfig(AppConfig):
    """
    Configuration class for the 'teachers' app.

    Attributes:
        default_auto_field (str): Specifies the default field type for primary keys.
        name (str): The full Python path to the application.
    """

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'teachers'

    def ready(self):
        """
        Called when the Django app registry is fully populated.

        Used here to import signal handlers to connect signal receivers.
        """
        import teachers.signals
