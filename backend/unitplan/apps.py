"""
Django AppConfig for the Unit Plans application.

Defines the configuration for the 'unitplan' app including
the default primary key field type and a human-readable
verbose name for display in the admin interface.
"""

from django.apps import AppConfig


class UnitplanConfig(AppConfig):
    """
    Django AppConfig for the 'unitplan' app.

    Sets up configuration options including:
    - Default primary key field type as BigAutoField
    - Application name as 'unitplan'
    - Human-readable name as 'Unit Plans'
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'unitplan'
    verbose_name = 'Unit Plans'
