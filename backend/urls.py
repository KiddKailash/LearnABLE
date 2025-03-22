# project_name/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),  # Default admin route
    path('', include('backend.urls')),  # Include the backend app's URLs
]