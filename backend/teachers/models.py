from django.db import models

class Teacher(models.Model):
    first_name = models.CharField(max_length=100, default="Unknown")
    last_name = models.CharField(max_length=100, default="Unknown")  # Default value
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)  # Store hashed passwords
    profile_pic = models.ImageField(
        upload_to="profile-pics/",
        blank=True,
        null=True,
        default="profile-pics/default.png"  # Set default profile picture
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
