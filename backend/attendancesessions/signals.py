from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import AttendanceSession
from django.apps import apps

@receiver(pre_delete, sender=AttendanceSession)
def clean_up_attendance_session_relations(sender, instance, **kwargs):
    """
    This signal ensures that when an AttendanceSession is deleted, all related student attendance records are also deleted.
    """
    try:
        # Handle StudentAttendance
        StudentAttendance = apps.get_model('studentattendance', 'StudentAttendance')
        StudentAttendance.objects.filter(session=instance).delete()
    except Exception as e:
        print(f"Error cleaning up attendance session relations: {e}") 