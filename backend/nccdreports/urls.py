from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import (
    get_all_reports,
    get_report_detail,
    create_report,
    get_reports_by_student,
    ensure_reports_for_class,
    create_lesson_effectiveness
)

urlpatterns = [
    path('', get_all_reports, name='get_all_reports'),
    path('<int:report_id>/', get_report_detail, name='get_report_detail'),
    path('create/', create_report, name='create_report'),
    path('student/<int:student_id>/', get_reports_by_student, name='get_reports_by_student'),
    path('class/<int:class_id>/check-report', ensure_reports_for_class, name='ensure_reports_for_class'),
    path('create-lesson-effectiveness', create_lesson_effectiveness, name='create_lesson_effectiveness')
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import NCCDreportViewSet

# router = DefaultRouter()
# router.register(r'', NCCDreportViewSet, basename='nccdreports')

# urlpatterns = router.urls + [
#     path('create/', NCCDreportViewSet.as_view({'post': 'create'}), name='create_report'),
# ]

