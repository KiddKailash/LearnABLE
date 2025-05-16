"""
Models for managing Teacher profiles and their associated device sessions.

Includes:
- Teacher model: Stores profile information linked to Django User accounts,
  with validation to prevent duplicate profiles and support for preferences, 
  two-factor authentication, and profile metadata.

- DeviceSession model: Tracks individual device sessions for teachers, including 
  device info, IP address, user agent, session status, and timestamps.

- Signal to enforce uniqueness of teacher profiles per user, preventing duplicates.
"""

from django.contrib.auth.models import User
from django.db import models
from django.core.validators import FileExtensionValidator
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError

class Teacher(models.Model):
    """
    Model representing a Teacher profile linked to a User account.

    Attributes:
        user (OneToOneField): Link to the Django User model.
        school (CharField): Name of the school.
        subject_specialty (CharField): Subject specialty of the teacher.
        profile_picture (ImageField): Profile image.
        phone_number (CharField): Contact phone number.
        bio (TextField): Biography or description.
        preferred_language (CharField): Language preference (default 'en').
        notification_preferences (JSONField): JSON object for notification settings.
        theme_preference (CharField): UI theme preference ('light' default).
        last_password_change (DateTimeField): Timestamp of last password change.
        two_factor_enabled (BooleanField): Whether two-factor authentication is enabled.
        two_factor_secret (CharField): Secret key for 2FA.
        timezone (CharField): Timezone string (default 'UTC').
        is_first_login (BooleanField): Flag for first login status.

    Methods:
        clean(): Validates uniqueness of user and presence of associated user.
        save(): Calls clean before saving to enforce validations.
    """
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
    is_first_login = models.BooleanField(default=True)

    def __str__(self):
        if self.user:
            return self.user.username
        return f"Teacher (no user) #{self.id}"

    def clean(self):
        """
        Validates that each user has only one associated teacher profile
        and that the teacher is linked to a user.
        """
        # Check if this user already has a teacher profile when creating a new one
        if self.user_id and not self.pk:
            if Teacher.objects.filter(user_id=self.user_id).exists():
                raise ValidationError("This user already has a teacher profile")
        
        # If user is None, raise a validation error
        if self.user is None:
            raise ValidationError("Teacher must be associated with a user")

    def save(self, *args, **kwargs):
        """
        Ensures validation runs before saving the teacher instance.
        """
        self.clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Teacher"
        verbose_name_plural = "Teachers"

# Signal to ensure uniqueness of user_id and prevent duplicate teacher profiles
@receiver(pre_save, sender=Teacher)
def prevent_duplicate_teacher(sender, instance, **kwargs):
    """
    Signal to prevent duplicate Teacher profiles for the same user before saving.

    Raises ValidationError if a different Teacher profile for the same user exists.
    """
    if instance.user_id:
        # Check if there's an existing teacher with this user_id that's not this instance
        if Teacher.objects.filter(user_id=instance.user_id).exclude(pk=instance.pk).exists():
            raise ValidationError("This user already has a teacher profile")

class DeviceSession(models.Model):
    """
    Model representing a device session for a teacher.

    Attributes:
        teacher (ForeignKey): The teacher owning this session.
        session_key (CharField): Unique session identifier.
        device_name (CharField): Name of the device.
        browser (CharField): Browser info.
        ip_address (GenericIPAddressField): IP address of the device.
        location (CharField): Location info.
        created_at (DateTimeField): Timestamp when session was created.
        last_active (DateTimeField): Timestamp of last activity.
        is_active (BooleanField): Status of the session.
        user_agent (TextField): User agent string.

    Ordering:
        Sessions are ordered by last_active descending.
    """
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
