from django.db import models
from students.models import Student  
from assessments.models import Assessment  

class StudentGrade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    marks_obtained = models.IntegerField()
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student} - {self.assessment}: {self.marks_obtained}"

    def clean(self):
        """Ensure marks_obtained is non-negative."""
        from django.core.exceptions import ValidationError
        if self.marks_obtained < 0:
            raise ValidationError({'marks_obtained': "Marks obtained cannot be negative."})
