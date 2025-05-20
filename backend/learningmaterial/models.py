"""
Models for managing uploaded learning materials and AI-based adaptations.
"""

from django.db import models
from teachers.models import Teacher
from classes.models import Classes


class LearningMaterials(models.Model):
    """
    Represents a learning material resource uploaded by a teacher.

    This model stores the original lesson file (PDF, DOCX, PPTX), metadata 
    about the lesson including title, objectives, and assigned class, and tracks
    AI processing status for adaptive learning workflows.

    Attributes:
        title (str): The title of the learning material.
        content (str, optional): The extracted or AI-adapted textual content of the lesson.
        created_by (Teacher): The teacher who created or uploaded the material.
        class_assigned (Classes, optional): The class or group assigned to this material.
        file (File): The uploaded file containing the original lesson content.
        objective (str, optional): The learning objectives associated with the material.
        ai_processed (bool): Flag indicating whether the material has been processed by the AI adaptation system.
    """
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
