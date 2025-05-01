from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import Student
from django.apps import apps

@receiver(pre_delete, sender=Student)
def clean_up_student_relations(sender, instance, **kwargs):
    """
    This signal ensures that when a Student is deleted, any orphaned related records are also cleaned up.
    """
    try:
        # Handle NCCDreport
        NCCDreport = apps.get_model('nccdreports', 'NCCDreport')
        NCCDreport.objects.filter(student=instance).delete()
        
        # Note: The following relations have CASCADE already configured in their models,
        # but we're ensuring they're cleaned up here for completeness
        
        # Handle StudentGrade
        StudentGrade = apps.get_model('studentgrades', 'StudentGrade')
        StudentGrade.objects.filter(student=instance).delete()
        
        # Handle StudentAttendance
        StudentAttendance = apps.get_model('studentattendance', 'StudentAttendance')
        StudentAttendance.objects.filter(student=instance).delete()
        
        # Handle ClassStudents
        ClassStudents = apps.get_model('classstudents', 'ClassStudents')
        ClassStudents.objects.filter(student=instance).delete()
        
    except Exception as e:
        print(f"Error cleaning up student relations: {e}") 