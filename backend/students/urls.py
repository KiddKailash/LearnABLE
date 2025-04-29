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
    path('', get_all_students, name="get_all_students"),
    path('create/', create_student, name="create_student"),
    path('by-email/', get_student_by_email, name="get_student_by_email"),
    path('<int:student_id>/', get_student, name="get_student"),
    path('<int:student_id>/patch/', partial_update_student, name="partial_update_student"),
    path('<int:student_id>/delete/', delete_student, name="delete_student"),
    path('class/<int:class_id>/', get_students_by_class, name="get_students_by_class"),
    path('classes/upload-csv/', upload_csv_to_class, name="upload_csv_to_class"),
]
