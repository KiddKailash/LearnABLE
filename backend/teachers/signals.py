from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Teacher, DeviceSession
from django.apps import apps

@receiver(post_save, sender=User)
def create_teacher_profile(sender, instance, created, **kwargs):
    if created:  # Remove the instance.is_staff condition
        Teacher.objects.create(user=instance)

@receiver(pre_delete, sender=Teacher)
def clean_up_teacher_relations(sender, instance, **kwargs):
    """
    This signal ensures that when a Teacher is deleted, any orphaned related records are also cleaned up.
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
            LearningMaterials = apps.get_model('learningmaterial', 'LearningMaterials')
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
            AttendanceSession = apps.get_model('attendancesessions', 'AttendanceSession')
            attendance_sessions = AttendanceSession.objects.filter(class_id=class_obj)
            
            # For each attendance session, clean up attendance records
            for session in attendance_sessions:
                StudentAttendance = apps.get_model('studentattendance', 'StudentAttendance')
                StudentAttendance.objects.filter(session=session).delete()
            
            # Delete the attendance sessions
            attendance_sessions.delete()
        
        # Delete the classes
        classes_to_delete.delete()
        
        # Handle LearningMaterials created by this teacher but not assigned to a class
        LearningMaterials = apps.get_model('learningmaterial', 'LearningMaterials')
        LearningMaterials.objects.filter(created_by=instance, class_assigned=None).delete()
        
    except Exception as e:
        print(f"Error cleaning up teacher relations: {e}")
