# backend/urls.py
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include
from . import views
from .views import ask_openai


def home(request):
    return HttpResponse("Welcome to the homepage!")

def api_view(request):
    return HttpResponse("This is the API endpoint!")

urlpatterns = [
    path('api/info/', views.api_view, name='api_view'),
    path('', home, name='home'),  # Root URL
    path("api/teachers/", include("teachers.urls")),
    path("api/students/", include("students.urls")),
    path("api/", include("assessments.urls")),
    path("api/", include("attendancesessions.urls")),
    path("api/classes/", include("classes.urls")),
    path("api/", include("classstudents.urls")),
    path("api/", include("learningmaterial.urls")),
    path("api/", include("studentattendance.urls")),
    path("api/", include("studentgrades.urls")),
    path("api/nccdreports/", include("nccdreports.urls")),
    path('admin/', admin.site.urls),
    path('api/ask-openai/', ask_openai, name='ask_openai'),
]
