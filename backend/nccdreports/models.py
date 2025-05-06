from django.db import models
from students.models import Student
from teachers.models import Teacher

class NCCDreport(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=[('InProgress', 'InProgress'), ('Approved', 'Approved'), ('NotStart', 'NotStart')],
        default='NotStarted'
    )
    # REMOVE THIS LINE (no longer stored in DB)
    # has_diagonsed_disability = models.BooleanField(default=False)

    disability_category = models.CharField(
        max_length=20,
        choices=[('Cognitive', 'Cognitive'), ('Physical', 'Physical'), ('Social/Emotional', 'Social/Emotional'), ('Sensory', 'Sensory')],
        default='None'
    )
    level_of_adjustment = models.CharField(
        max_length=20,
        choices=[('QDTP', 'QDTP'), ('Supplementary', 'Supplementary'), ('Substantial', 'Substantial'), ('Extensive', 'Extensive')],
        default='None'
    )
    evidence = models.FileField(upload_to='nccdreports/')

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name}"

    @property
    def has_diagonsed_disability(self):
        """
        Dynamically check the linked student's decrypted disability_info.
        Returns True if non-empty.
        """
        return bool(self.student.disability_info.strip())

class LessonEffectivenessRecord(models.Model):
    report = models.ForeignKey(NCCDreport, on_delete=models.CASCADE, related_name='effectiveness_records')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, null=True, blank=True)
    lesson_date = models.DateField(auto_now_add=True)
    was_effective = models.BooleanField()

    def __str__(self):
        return f"{self.report.student} on {self.lesson_date}: {'Yes' if self.was_effective else 'No'}"