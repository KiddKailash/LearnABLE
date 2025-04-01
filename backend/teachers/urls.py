from django.urls import path
from .views import register_teacher, login_teacher
from django.conf import settings
from django.conf.urls.static import static
from .views import upload_profile_pic

urlpatterns = [
    path('teachers/register/', register_teacher, name="register_teacher"),
    path('teachers/login/', login_teacher, name="login_teacher"),
    path("api/teachers/upload-profile-pic/", upload_profile_pic, name="upload-profile-pic"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)