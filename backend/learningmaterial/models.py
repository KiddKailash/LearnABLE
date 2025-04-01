from django.db import models
from subjects.models import Subject
from teachers.models import Teacher

class LearningMaterials(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    target_audience = models.CharField(max_length=20)
    file = models.FileField(upload_to='learning_materials/')  # Stores files in MEDIA_ROOT/learning_materials/

    def __str__(self):
        return self.title
