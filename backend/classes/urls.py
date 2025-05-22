"""
URL configuration for the 'classes' app.

Defines the following endpoints under the `/api/classes/` prefix:

- create/          → Create a new class (POST)
-                   → List all classes (GET)
- upload-csv/      → Bulk-upload students into a class via CSV (POST)
- <id>/add-student/→ Add a single student to a class (POST)
- <id>/            → Retrieve, update, or delete a specific class (GET, PUT, DELETE)
"""

from django.urls import path
from .views import (
    create_class,
    get_all_classes,
    upload_students_csv,
    add_student_to_class,
    class_detail,  # handles both PUT and DELETE
)

urlpatterns = [
    path('create/',
         create_class,
         name='create_class'
         ),  # Create a new class

    path(
        '',
        get_all_classes,
        name='get_all_classes'
    ),  # Retrieve a list of all classes

    path(
        'upload-csv/',
        upload_students_csv,
        name='upload_students_csv'
    ),  # Bulk upload students to a class via CSV file

    path(
        '<int:class_id>/add-student/',
        add_student_to_class,
        name='add_student_to_class'
    ),  # Add a student (by ID or payload) to the specified class

    path(
        '<int:class_id>/',
        class_detail,
        # Retrieve (GET), update (PUT), or delete (DELETE) a specific class
        name='class_detail'),
]
