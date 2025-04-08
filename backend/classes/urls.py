from django.urls import path
from .views import create_class, get_all_classes, upload_students_csv

urlpatterns = [
    path('create/', create_class, name='create_class'),
    path('', get_all_classes, name="get_all_classes"),
    path("upload-csv/", upload_students_csv, name="upload_students_csv"),
]
