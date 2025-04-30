from django.contrib.auth.models import User
from django.db import models
from django.core.validators import FileExtensionValidator

class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True)
    school = models.CharField(max_length=100, blank=True)
    subject_specialty = models.CharField(max_length=100, blank=True)
    profile_picture = models.ImageField(upload_to='teacher_profiles/', null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    bio = models.TextField(blank=True)
    preferred_language = models.CharField(max_length=10, default='en')
    notification_preferences = models.JSONField(default=dict)
    theme_preference = models.CharField(max_length=20, default='light')
    last_password_change = models.DateTimeField(auto_now=True)
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=32, blank=True)
    timezone = models.CharField(max_length=50, default='UTC')

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name = "Teacher"
        verbose_name_plural = "Teachers"
