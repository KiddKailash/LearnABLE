from django.contrib.auth.models import User
from django.db import models
from django.core.validators import FileExtensionValidator
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError

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
        if self.user:
            return self.user.username
        return f"Teacher (no user) #{self.id}"

    def clean(self):
        # Check if this user already has a teacher profile when creating a new one
        if self.user_id and not self.pk:
            if Teacher.objects.filter(user_id=self.user_id).exists():
                raise ValidationError("This user already has a teacher profile")
        
        # If user is None, raise a validation error
        if self.user is None:
            raise ValidationError("Teacher must be associated with a user")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Teacher"
        verbose_name_plural = "Teachers"

# Signal to ensure uniqueness of user_id and prevent duplicate teacher profiles
@receiver(pre_save, sender=Teacher)
def prevent_duplicate_teacher(sender, instance, **kwargs):
    if instance.user_id:
        # Check if there's an existing teacher with this user_id that's not this instance
        if Teacher.objects.filter(user_id=instance.user_id).exclude(pk=instance.pk).exists():
            raise ValidationError("This user already has a teacher profile")

class DeviceSession(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='device_sessions')
    session_key = models.CharField(max_length=40, unique=True)
    device_name = models.CharField(max_length=100, blank=True)
    browser = models.CharField(max_length=200, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    location = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    user_agent = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.teacher.user.username} - {self.device_name}"
    
    class Meta:
        verbose_name = "Device Session"
        verbose_name_plural = "Device Sessions"
        ordering = ['-last_active']
