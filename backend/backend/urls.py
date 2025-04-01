# backend/urls.py
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include
from . import views


# Define a simple view for the root URL
def home(request):
    return HttpResponse("Welcome to the homepage!")

def api_view(request):
    return HttpResponse("This is the API endpoint!")

urlpatterns = [
    path('api/', views.api_view, name='api_view'),
    path('', home, name='home'),  # Root URL
    path("", include("teachers.urls")),
    path("", include("students.urls")),
    path("", include("assessments.urls")),
    path("", include("attendancesessions.urls")),
    path("", include("classes.urls")),
    path("", include("classstudents.urls")),
    path("", include("learningmaterial.urls")),
    path("", include("studentattendance.urls")),
    path("", include("studentgrades.urls")),
    path("", include("nccdreports.urls")),
    path('admin/', admin.site.urls)
]
