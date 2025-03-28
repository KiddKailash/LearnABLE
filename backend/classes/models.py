from django.db import models

class Classes(models.Model):
    class_id = models.AutoField(primary_key=True)
    teacher_id = models.ForeignKey('teachers.Teacher', on_delete=models.CASCADE)
    subject_id = models.ForeignKey('subjects.Subject', on_delete=models.SET_NULL, null=True)
    class_name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.class_name
