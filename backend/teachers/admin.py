"""
Admin configuration for Teacher and DeviceSession models.

- TeacherProfileAdmin: Customizes admin interface for Teacher profiles.
- DeviceSessionAdmin: Customizes admin interface for device sessions linked to teachers,
  including display, filtering, searching, and read-only fields.
"""

from django.contrib import admin
from .models import Teacher, DeviceSession

@admin.register(Teacher)
class TeacherProfileAdmin(admin.ModelAdmin):
    """
    Admin model for managing Teacher profiles.

    Displays:
        - User associated with the teacher
        - School of the teacher
        - Subject specialty of the teacher
    """
    list_display = ('user', 'school', 'subject_specialty')

@admin.register(DeviceSession)
class DeviceSessionAdmin(admin.ModelAdmin):
    """
    Admin interface customization for the DeviceSession model.
    
    Displays and manages device sessions linked to teachers, 
    enabling admin users to monitor active sessions, filter by status and creation date,
    and search by teacher username, device name, or IP address.
    
    Attributes:
        list_display (tuple): Fields displayed in the session list view.
        list_filter (tuple): Fields available to filter the session list.
        search_fields (tuple): Fields searchable via the admin search box.
        readonly_fields (tuple): Fields shown as read-only in the detail view.
    """
    list_display = ('teacher', 'device_name', 'ip_address', 'last_active', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('teacher__user__username', 'device_name', 'ip_address')
    readonly_fields = ('session_key', 'created_at', 'last_active')
