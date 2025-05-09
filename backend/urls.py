from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),  # Admin dashboard
    path("api/teachers/", include("teachers.urls")),
    path("api/classes/", include("classes.urls")),
    path("api/subjects/", include("subjects.urls")),
    path("api/students/", include("students.urls")),
    path("api/assessments/", include("assessments.urls")),
    path("api/attendancesessions/", include("attendancesessions.urls")),
    path("api/classstudents/", include("classstudents.urls")),
    path("api/studentattendance/", include("studentattendance.urls")),
    path("api/studentgrades/", include("studentgrades.urls")), 
    path("api/nccdreports/", include("nccdreports.urls")), 
    path("api/learning-materials/", include("learningmaterial.urls")),
    path("api/unit-plans/", include("unitplan.urls")),
]

# ✅ Serve media files in dev mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
