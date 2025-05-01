from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import Assessment
from django.apps import apps

@receiver(pre_delete, sender=Assessment)
def clean_up_assessment_relations(sender, instance, **kwargs):
    """
    This signal ensures that when an Assessment is deleted, all related student grades are also deleted.
    """
    try:
        # Handle StudentGrade
        StudentGrade = apps.get_model('studentgrades', 'StudentGrade')
        StudentGrade.objects.filter(assessment=instance).delete()
    except Exception as e:
        print(f"Error cleaning up assessment relations: {e}") 