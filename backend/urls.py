from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),  # Admin dashboard
    path("teachers/", include("teachers.urls")),
    path("classes/", include("classes.urls")),
    path("subjects/", include("subjects.urls")),
    path("students/", include("students.urls")),
    path("assessments/", include("assessments.urls")),
    path("attendancesessions/", include("attendancesessions.urls")),
    path("classstudents/", include("classstudents.urls")),
    path("studentattendance/", include("studentattendance.urls")),
    path("studentgrades/", include("studentgrades.urls")), 
    path("nccdreports/", include("nccdreports.urls")), 

    # ✅ API routes (this should come after all other app includes)
    path("api/", include("learnmaterial.urls")),
]

# ✅ Serve media files in dev mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
