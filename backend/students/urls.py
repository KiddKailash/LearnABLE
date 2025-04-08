from django.urls import path
from .views import (
    get_all_students,
    get_student,
    create_student,
    update_student,
    delete_student,
    partial_update_student,
    get_students_by_class
)

urlpatterns = [
    path('', get_all_students, name="get_all_students"),
    path('students/create/', create_student, name="create_student"),
    path('students/<int:student_id>/', get_student, name="get_student"),
    path('students/<int:student_id>/update/', update_student, name="update_student"),
    path('students/<int:student_id>/patch/', partial_update_student, name="partial_update_student"),
    path('students/<int:student_id>/delete/', delete_student, name="delete_student"),
    path('class/<int:class_id>/', get_students_by_class, name="get_students_by_class"),
]
