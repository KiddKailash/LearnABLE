"""
Model representing a Unit Plan document associated with a class.

Includes fields for the document file, metadata such as title,
description, file type, and timestamps for upload and update.
"""

from django.db import models
from django.utils import timezone
import os

def unit_plan_file_path(instance, filename):
    """
    Generate the upload path for a unit plan file based on class ID.

    Args:
        instance (UnitPlan): The UnitPlan instance.
        filename (str): The original filename of the uploaded file.

    Returns:
        str: The path to upload the file, formatted as 'unitplans/<class_id>/<filename>'.
    """
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
        """
        Return a human-readable string representation of the UnitPlan instance.

        Returns:
            str: Description of the unit plan including the related class name.
        """
        return f"Unit Plan for {self.class_instance.class_name}"
    
    def save(self, *args, **kwargs):
        """
        Override the save method to automatically set the file_type based on
        the uploaded document's file extension before saving the model.

        Args:
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.
        """
        # Extract file extension to determine file type
        if self.document:
            filename = self.document.name
            ext = os.path.splitext(filename)[1].lower().strip('.')
            self.file_type = ext
        super().save(*args, **kwargs)
