"""
URL Configuration for NCCD Reports API

This module defines URL routes for managing NCCD reports, lesson effectiveness records,
and related data for students and classes. It includes endpoints for:

- Listing all NCCD reports accessible to the authenticated user.
- Retrieving, creating, updating, and deleting specific NCCD reports.
- Fetching reports associated with a particular student.
- Ensuring that all students in a class have NCCD reports.
- Creating lesson effectiveness records linked to reports.
- Fetching lesson effectiveness trends for a student.

In development mode, this configuration also serves media files (such as uploaded evidence documents).

Each route is linked to a view function that handles the respective HTTP methods and permissions.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import (
    get_all_reports,
    get_report_detail,
    create_report,
    get_reports_by_student,
    ensure_reports_for_class,
    create_lesson_effectiveness,
    get_effectiveness_trend,
    students_without_nccd_report
)

# URL patterns for the NCCD Reports module
urlpatterns = [
    path('', get_all_reports, name='get_all_reports'),
    # Fetch a specific report by ID
    path('<int:report_id>/', get_report_detail, name='get_report_detail'),
    # Create a new NCCD report
    path('create/', create_report, name='create_report'),
    # Get all reports associated with a specific student
    path('student/<int:student_id>/', get_reports_by_student, name='get_reports_by_student'),
    # Ensure every student in a class has a report created
    path('class/<int:class_id>/check-report/', ensure_reports_for_class, name='ensure_reports_for_class'),
    # Create a lesson effectiveness record for a given report
    path('create-lesson-effectiveness/<int:report_id>/', create_lesson_effectiveness, name='create_lesson_effectiveness'),
    # Get the effectiveness trend data for a student
    path('effectiveness-trend/<int:student_id>/', get_effectiveness_trend, name='effectiveness-trend'),
    path('students/no-nccd-report/', students_without_nccd_report, name="no_nccd_report"),
]

# Serve media files (like uploaded evidence) during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import NCCDreportViewSet

# router = DefaultRouter()
# router.register(r'', NCCDreportViewSet, basename='nccdreports')

# urlpatterns = router.urls + [
#     path('create/', NCCDreportViewSet.as_view({'post': 'create'}), name='create_report'),
# ]

