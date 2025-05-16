"""
backend/urls.py

Defines URL routing for the LearnABLE backend project.

This file maps different URL paths to their respective views or included app-level URL configurations.
It also defines some simple views like `home` and `api_view` for basic responses.

Routes:
    - /                      → Welcome message for the platform.
    - /admin/               → Django Admin interface.
    - /api/info/            → Basic API endpoint confirmation.
    - /api/ask-openai/      → Route for handling OpenAI-based queries.
    - /api/teachers/        → Teacher-related API endpoints.
    - /api/classes/         → Class management API endpoints.
    - /api/students/        → Student-related API endpoints.
    - /api/nccdreports/     → NCCD report management endpoints.
    - /api/learning-materials/ → Learning materials upload & adaptation.
    - /api/unit-plans/      → Unit plan generation and management.
"""

from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include
from . import views
from .views import ask_openai
from django.conf import settings
from django.conf.urls.static import static


def home(request):
    """
    Root route of the platform.
    
    Returns:
        HttpResponse: A welcome message.
    """
    return HttpResponse("Welcome to the LearnABLE. The new innovative learning platform!")

def api_view(request):
    """
    Test or confirmation route for API functionality.
    
    Returns:
        HttpResponse: A basic message confirming the API is reachable.
    """
    return HttpResponse("This is the API endpoint!")

urlpatterns = [
    path('api/info/', views.api_view, name='api_view'),
    path('', home, name='home'),  
    path('admin/', admin.site.urls),
    path('api/ask-openai/', ask_openai, name='ask_openai'),
    
    # Include app-specific API routes with "api/" prefix
    path("api/teachers/", include("teachers.urls")),
    path("api/classes/", include("classes.urls")),
    path("api/students/", include("students.urls")),
    path("api/nccdreports/", include("nccdreports.urls")), 
    path("api/learning-materials/", include("learningmaterial.urls")),
    path("api/unit-plans/", include("unitplan.urls")),
]

# Serve media files in dev mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
