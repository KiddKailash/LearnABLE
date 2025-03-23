from django.urls import path
from .views import register_teacher, login_teacher

urlpatterns = [
    path('teachers/register/', register_teacher, name="register_teacher"),
    path('teachers/login/', login_teacher, name="login_teacher"),
]
