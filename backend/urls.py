# project_name/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),  # Default admin route
    path("teachers/", include("teachers.urls")),
    path("classes/", include("classes.urls")),
    path("subjects/", include("subjects.urls")),
    path("students/", include("students.urls")),  # Include the backend app's URLs
]