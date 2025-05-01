from django.contrib import admin
from .models import Teacher, DeviceSession

@admin.register(Teacher)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'school', 'subject_specialty')

@admin.register(DeviceSession)
class DeviceSessionAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'device_name', 'ip_address', 'last_active', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('teacher__user__username', 'device_name', 'ip_address')
    readonly_fields = ('session_key', 'created_at', 'last_active')
