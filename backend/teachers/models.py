from django.db import models

class Teacher(models.Model):
    first_name = models.CharField(max_length=100, default="Unknown")
    last_name = models.CharField(max_length=100, default="Unknown")  # Default value
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)  # Store hashed passwords

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
