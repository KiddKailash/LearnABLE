from django.urls import path
from .views import get_all_students, create_student, update_student

urlpatterns = [
    path('', get_all_students, name='get_all_students'),
    path('create/', create_student, name='create_student'),
    path('<int:student_id>/update/', update_student, name='update_student'),
]
