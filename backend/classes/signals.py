from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import Classes
from django.apps import apps

@receiver(pre_delete, sender=Classes)
def clean_up_class_relations(sender, instance, **kwargs):
    """
    This signal ensures that when a Class is deleted, any orphaned related records are also cleaned up.
    """
    try:
        # Handle ClassStudents
        ClassStudents = apps.get_model('classstudents', 'ClassStudents')
        ClassStudents.objects.filter(class_obj=instance).delete()
        
        # Handle LearningMaterials
        LearningMaterials = apps.get_model('learningmaterial', 'LearningMaterials')
        LearningMaterials.objects.filter(class_assigned=instance).delete()
        
        # Handle Assessments
        Assessment = apps.get_model('assessments', 'Assessment')
        Assessment.objects.filter(class_obj=instance).delete()
        
        # Handle AttendanceSession
        AttendanceSession = apps.get_model('attendancesessions', 'AttendanceSession')
        AttendanceSession.objects.filter(class_id=instance).delete()
        
    except Exception as e:
        print(f"Error cleaning up class relations: {e}") 