from django.contrib import admin
from .models import UnitPlan

@admin.register(UnitPlan)
class UnitPlanAdmin(admin.ModelAdmin):
    list_display = ('title', 'class_instance', 'file_type', 'uploaded_at', 'updated_at')
    search_fields = ('title', 'class_instance__class_name')
    list_filter = ('file_type', 'uploaded_at')
    readonly_fields = ('file_type', 'uploaded_at', 'updated_at')
