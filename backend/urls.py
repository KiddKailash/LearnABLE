# project_name/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),  # Default admin route
    path("teachers/", include("teachers.urls")),
    path("classes/", include("classes.urls")),
    path("subjects/", include("subjects.urls")),
    path("students/", include("students.urls")),
    path("assessments/", include("assessments.urls")),
    path("attendancesessions/", include("attendancesessions.urls")),
    path("classes/", include("classes.urls")),
    path("classstudents/", include("classstudents.urls")),
    path("learnmaterial/", include("learnmaterial.urls")),
    path("studentattendance/", include("studentattendance.urls")),
    path("studentgrades/", include("studentgrades.urls")), 
    path("nccdreports/", include("nccdreports.urls")),    
]