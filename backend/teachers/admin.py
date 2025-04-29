from django.contrib import admin
from .models import Teacher

@admin.register(Teacher)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'school', 'subject_specialty')
