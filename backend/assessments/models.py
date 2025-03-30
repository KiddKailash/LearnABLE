from django.db import models
from classes.models import Classes  # Ensure correct import path

class Assessment(models.Model):
    class_obj = models.ForeignKey(Classes, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)  # Now a simple CharField
    description = models.TextField()
    total_marks = models.IntegerField()

    def __str__(self):
        return f"{self.title} - {self.class_obj}"

    def clean(self):
        """Ensure total_marks is greater than 0."""
        from django.core.exceptions import ValidationError
        if self.total_marks <= 0:
            raise ValidationError({'total_marks': "Total marks must be greater than 0."})
