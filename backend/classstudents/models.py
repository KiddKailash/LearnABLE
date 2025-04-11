from django.db import models
from students.models import Student  # Ensure correct import path
from classes.models import Classes  # Ensure correct import path

class ClassStudents(models.Model):
    class_obj = models.ForeignKey(Classes, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('class_obj', 'student')  # Composite primary key

    def __str__(self):
        return f"{self.student} in {self.class_obj}"
