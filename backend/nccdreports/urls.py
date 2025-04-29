from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import (
    get_all_reports,
    get_report_detail,
    create_report,
    get_reports_by_student
)

urlpatterns = [
    path('', get_all_reports, name='get_all_reports'),
    path('<int:report_id>/', get_report_detail, name='get_report_detail'),
    path('create/', create_report, name='create_report'),
    path('student/<int:student_id>/', get_reports_by_student, name='get_reports_by_student'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
