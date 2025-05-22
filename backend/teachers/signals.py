"""
Signal handlers for automatic management of Teacher and related model lifecycle events.

Includes creation of Teacher profiles upon User creation and comprehensive cleanup of
related data when a Teacher instance is deleted, to maintain data integrity.
"""

from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Teacher, DeviceSession
from django.apps import apps


@receiver(post_save, sender=User)
def create_teacher_profile(sender, instance, created, **kwargs):
    """
    Signal handler to automatically create a Teacher profile when a new User is created.

    Args:
        sender (Model): The model class sending the signal (User).
        instance (User): The User instance that was saved.
        created (bool): Indicates whether a new User was created.
        **kwargs: Additional keyword arguments.
    """
    if created:  # Remove the instance.is_staff condition
        Teacher.objects.create(user=instance)


@receiver(pre_delete, sender=Teacher)
def clean_up_teacher_relations(sender, instance, **kwargs):
    """
    Signal handler to clean up related objects when a Teacher instance is deleted.

    This includes deletion of device sessions, classes, class students, learning materials,
    assessments, student grades, attendance sessions, and student attendance records
    related to the teacher to prevent orphaned data.

    Args:
        sender (Model): The model class sending the signal (Teacher).
        instance (Teacher): The Teacher instance about to be deleted.
        **kwargs: Additional keyword arguments.
    """
    try:
        # Handle DeviceSession
        DeviceSession.objects.filter(teacher=instance).delete()

        # Handle Classes
        Classes = apps.get_model('classes', 'Classes')
        classes_to_delete = Classes.objects.filter(teacher=instance)

        # For each class, clean up associated records
        for class_obj in classes_to_delete:
            # Handle ClassStudents
            ClassStudents = apps.get_model('classstudents', 'ClassStudents')
            ClassStudents.objects.filter(class_obj=class_obj).delete()

            # Handle LearningMaterials
            LearningMaterials = apps.get_model(
                'learningmaterial', 'LearningMaterials')
            LearningMaterials.objects.filter(class_assigned=class_obj).delete()

            # Handle Assessments
            Assessment = apps.get_model('assessments', 'Assessment')
            assessments = Assessment.objects.filter(class_obj=class_obj)

            # For each assessment, clean up grades
            for assessment in assessments:
                StudentGrade = apps.get_model('studentgrades', 'StudentGrade')
                StudentGrade.objects.filter(assessment=assessment).delete()

            # Delete the assessments
            assessments.delete()

            # Handle AttendanceSession
            AttendanceSession = apps.get_model(
                'attendancesessions', 'AttendanceSession')
            attendance_sessions = AttendanceSession.objects.filter(
                class_id=class_obj)

            # For each attendance session, clean up attendance records
            for session in attendance_sessions:
                StudentAttendance = apps.get_model(
                    'studentattendance', 'StudentAttendance')
                StudentAttendance.objects.filter(session=session).delete()

            # Delete the attendance sessions
            attendance_sessions.delete()

        # Delete the classes
        classes_to_delete.delete()

        # Handle LearningMaterials created by this teacher but not assigned to a class
        LearningMaterials = apps.get_model(
            'learningmaterial', 'LearningMaterials')
        LearningMaterials.objects.filter(
            created_by=instance, class_assigned=None).delete()

    except Exception as e:
        print(f"Error cleaning up teacher relations: {e}")
