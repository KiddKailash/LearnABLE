"""
Signal handlers for the 'classes' app.

This module defines cleanup logic triggered before a Classes instance is deleted.
It ensures related data in ClassStudents and LearningMaterials is also removed
to maintain referential integrity and prevent orphaned records.
"""

from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import Classes
from django.apps import apps


@receiver(pre_delete, sender=Classes)
def clean_up_class_relations(sender, instance, **kwargs):
    """
    Signal handler that cleans up related records when a Classes instance is deleted.

    This function ensures that any related entries in ClassStudents and LearningMaterials
    that reference the deleted class are also removed to prevent orphaned data and maintain database integrity.

    Args:
        sender (Model): The model class sending the signal (Classes).
        instance (Classes): The instance of Classes being deleted.
        **kwargs: Additional keyword arguments.
    """
    try:
        # Get related models dynamically to avoid circular imports
        ClassStudents = apps.get_model('classstudents', 'ClassStudents')
        LearningMaterials = apps.get_model(
            'learningmaterial', 'LearningMaterials')

        # Delete related records
        ClassStudents.objects.filter(class_obj=instance).delete()
        LearningMaterials.objects.filter(class_assigned=instance).delete()

    except Exception as e:
        print(f"Error cleaning up class relations: {e}")
