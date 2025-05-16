"""
Configuration for the Students app.

Defines the StudentsConfig class which registers the app and
executes startup code such as importing signals when the app is ready.
"""

from django.apps import AppConfig


class StudentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'students'

    def ready(self):
        import students.signals
