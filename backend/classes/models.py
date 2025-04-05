from django.db import models

class Classes(models.Model):
    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.CASCADE)
    subject = models.ForeignKey('subjects.Subject', on_delete=models.SET_NULL, null=True)
    class_name = models.CharField(max_length=100)

    students = models.ManyToManyField('students.Student', related_name='classes') #Many students can be in many classes

    def __str__(self):
        return self.class_name
