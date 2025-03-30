from django.db import models
from classes.models import Classes  # Make sure the 'Classes' model is correctly imported

class AttendanceSession(models.Model):
    # session_id is automatically created as the primary key
    class_id = models.ForeignKey(Classes, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(
        max_length=10,
        choices=[('Open', 'Open'), ('Closed', 'Closed')],
        default='Open'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session {self.session_id} - {self.date} ({self.status})"
