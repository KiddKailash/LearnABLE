from django.db import models

class Classes(models.Model):
    # Updated foreign key references to other apps
    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.CASCADE)
    subject = models.ForeignKey('subjects.Subject', on_delete=models.SET_NULL, null=True)
    
    # Define class_name as a character field with a max length of 100
    class_name = models.CharField(max_length=100)
    
    # Optionally, add a __str__ method to represent the object by its class name
    def __str__(self):
        return self.class_name
