from django.db import models
from students.models import Student  # Adjust this import based on your actual app structure
from attendancesessions.models import AttendanceSession  # Ensure the correct import for AttendanceSession

class StudentAttendance(models.Model):
    # attendance_id is automatically created as the primary key
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=10,
        choices=[
            ('Present', 'Present'),
            ('Absent', 'Absent'),
            ('Late', 'Late'),
            ('Excused', 'Excused')
        ],
        default='Absent'
    )
    recorded_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student} - {self.session.date}: {self.status}"
