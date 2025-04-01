from django.db import models
from students.models import Student

class NCCDreport(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=[('InProgress', 'InProgress'), ('Approved', 'Approved'), ('NotStart', 'NotStart')],
        default='NotStarted'
    )
    has_diagonsed_disability = models.BooleanField(default=False)
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
    evidence = models.FileField(upload_to='nccdreports/')  # Stores files in MEDIA_ROOT/nccdreports/

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name}"
