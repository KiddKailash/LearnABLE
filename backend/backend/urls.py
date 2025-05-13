# backend/urls.py
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include
from . import views
from .views import ask_openai
from django.conf import settings
from django.conf.urls.static import static


def home(request):
    return HttpResponse("Welcome to the homepage!")

def api_view(request):
    return HttpResponse("This is the API endpoint!")

urlpatterns = [
    path('api/info/', views.api_view, name='api_view'),
    path('', home, name='home'),  # Root URL
    path('admin/', admin.site.urls),
    path('api/ask-openai/', ask_openai, name='ask_openai'),
    
    # Include all app URL patterns with /api/ prefix
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
