"""
Signal handlers for cleaning up related data when a Student instance is deleted.

This module listens for the pre_delete signal on Student objects and
ensures that all related records in other apps (like NCCD reports,
grades, attendance, and class memberships) are also deleted to maintain
data integrity and prevent orphaned records.
"""

from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import Student
from django.apps import apps

@receiver(pre_delete, sender=Student)
def clean_up_student_relations(sender, instance, **kwargs):
    """
    Signal handler triggered before a Student instance is deleted.

    Deletes related records across multiple apps that reference the Student,
    including NCCD reports, grades, attendance records, and class membership entries,
    to avoid orphaned foreign key references and maintain database integrity.

    Args:
        sender (Model class): The model class (Student).
        instance (Student): The specific Student instance about to be deleted.
        **kwargs: Additional keyword arguments provided by the signal.

    Logs:
        Prints any exceptions raised during the cleanup process.
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