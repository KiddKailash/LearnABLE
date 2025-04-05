from django.db import models

#TODO: year levels prep to 12 only, maybe even prep to 10
class Student(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    year_level = models.IntegerField()
    student_email = models.EmailField(max_length=100, default='missing')
    disability_info = models.TextField(blank=True)
    guardian_email = models.EmailField(max_length=100)
    guardian_first_name = models.CharField(max_length=50, default='missing')
    guardian_last_name = models.CharField(max_length=50, default='missing')


    def __str__(self):
        return f"{self.first_name} {self.last_name}"
