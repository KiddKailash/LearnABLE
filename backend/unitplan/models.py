from django.db import models
from django.utils import timezone
import os

def unit_plan_file_path(instance, filename):
    # Generate path for file: unitplans/class_id/filename
    return f'unitplans/{instance.class_instance.id}/{filename}'

class UnitPlan(models.Model):
    class_instance = models.OneToOneField('classes.Classes', on_delete=models.CASCADE, related_name='unit_plan')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    document = models.FileField(upload_to=unit_plan_file_path)
    file_type = models.CharField(max_length=20, blank=True, null=True)  # e.g., 'pdf', 'docx', 'xlsx'
    uploaded_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Unit Plan for {self.class_instance.class_name}"
    
    def save(self, *args, **kwargs):
        # Extract file extension to determine file type
        if self.document:
            filename = self.document.name
            ext = os.path.splitext(filename)[1].lower().strip('.')
            self.file_type = ext
        super().save(*args, **kwargs)
