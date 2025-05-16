"""
URL configuration for the students app.

Defines routes for student management including:
- Retrieving all students
- Creating a new student
- Fetching a student by ID or email
- Updating (full or partial) and deleting a student
- Listing students by class
- Bulk uploading students via CSV to a class

Each route maps to a corresponding view function handling the HTTP requests.
"""


from django.urls import path
from .views import (
    get_all_students,
    create_student,
    get_student,
    update_student,
    partial_update_student,
    delete_student,
    get_students_by_class,
    get_student_by_email,
    upload_csv_to_class
)

urlpatterns = [
    # Retrieve a list of all students
    path('', get_all_students, name="get_all_students"),
    
    # Create a new student record
    path('create/', create_student, name="create_student"),
    
    # Retrieve a student by their email address (query param expected)
    path('by-email/', get_student_by_email, name="get_student_by_email"),
    
    # Retrieve details of a student by their ID
    path('<int:student_id>/', get_student, name="get_student"),
    
    # Partially update a student's details by their ID (PATCH request)
    path('<int:student_id>/patch/', partial_update_student, name="partial_update_student"),
    
    # Delete a student record by their ID
    path('<int:student_id>/delete/', delete_student, name="delete_student"),
    
    # Get a list of students belonging to a specific class by class ID
    path('classes/<int:class_id>/', get_students_by_class, name="get_students_by_class"),
    
    # Upload a CSV file to bulk add students to a class
    path('classes/upload-csv/', upload_csv_to_class, name="upload_csv_to_class"),
]

