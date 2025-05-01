from django.db import models
from teachers.models import Teacher
from classes.models import Classes


class LearningMaterials(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    class_assigned = models.ForeignKey(Classes, on_delete=models.CASCADE, null=True, blank=True)
    file = models.FileField(upload_to='learning_materials/')
    objective = models.TextField(blank=True, null=True)
    ai_processed = models.BooleanField(blank=False, null=False, default=False)

    class Meta:
        verbose_name = "Learning material"
        verbose_name_plural = "Learning materials"

    def __str__(self):
        return self.title
