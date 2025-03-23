# project_name/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),  # Default admin route
    path("teachers/", include("teachers.urls")),  # Include the backend app's URLs
]