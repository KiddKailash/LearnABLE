"""
URL routing configuration for the teachers app.

Defines endpoints for teacher registration, login with two-factor authentication,
profile management (including updates, password changes, and preferences),
session management, profile picture uploads, and account data export and deletion.

Includes conditional serving of media files during development.
"""

from django.urls import path
from .views import register_teacher, login_teacher, verify_login_2fa
from django.conf import settings
from django.conf.urls.static import static
from .views import upload_profile_pic
from . import views

urlpatterns = [
    path('register/', views.register_teacher, name='register_teacher'),
    path('login/', views.login_teacher, name='login_teacher'),
    path('verify-login-2fa/', verify_login_2fa, name='verify_login_2fa'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.get_profile, name='get_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/password/change/', views.change_password, name='change_password'),
    path('profile/2fa/setup/', views.setup_2fa, name='setup_2fa'),
    path('profile/2fa/verify/', views.verify_2fa, name='verify_2fa'),
    path('profile/2fa/disable/', views.disable_2fa, name='disable_2fa'),
    path('profile/notifications/', views.update_notification_preferences, name='update_notifications'),
    path('profile/theme/', views.update_theme, name='update_theme'),
    path("upload-profile-pic/", upload_profile_pic, name="upload-profile-pic"),
    path('profile/sessions/', views.get_active_sessions, name='get_active_sessions'),
    path('profile/sessions/terminate/', views.terminate_session, name='terminate_session'),
    path('profile/sessions/terminate-all/', views.terminate_all_sessions, name='terminate_all_sessions'),
    path('profile/export-data/', views.export_account_data, name='export_account_data'),
    path('profile/delete-account/', views.delete_account, name='delete_account'),
    path('profile/connect-google/', views.connect_google_account, name='connect_google_account'),
    path('profile/disconnect-google/', views.disconnect_google_account, name='disconnect_google_account'),
    path('profile/first-login/', views.update_first_login_status, name='update_first_login_status'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)