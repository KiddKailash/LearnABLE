from django.urls import path
from .views import register_teacher

urlpatterns = [
    path('teachers/register/', register_teacher, name="register_teacher"),
]
