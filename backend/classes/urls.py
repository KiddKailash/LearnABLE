from django.urls import path
from .views import (
    create_class,
    get_all_classes,
    upload_students_csv,
    add_student_to_class,
    class_detail,  # handles both PUT and DELETE
)

urlpatterns = [
    path('create/', create_class, name='create_class'),
    path('', get_all_classes, name='get_all_classes'),
    path('upload-csv/', upload_students_csv, name='upload_students_csv'),
    path('<int:class_id>/add-student/', add_student_to_class, name='add_student_to_class'),
    path('<int:class_id>/', class_detail, name='class_detail'),  # <- handles PUT + DELETE
]
