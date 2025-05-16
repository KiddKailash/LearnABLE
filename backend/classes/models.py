from django.db import models
from students.models import Student

class Classes(models.Model):
    """
    Model representing a school class.

    Attributes:
        teacher (ForeignKey): Reference to the Teacher who manages this class.
        year_level (CharField): The year level of the class (optional).
        class_name (CharField): The name of the class.
        students (ManyToManyField): Many-to-many relationship with Student model,
                                   indicating students enrolled in this class.
    """
    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.CASCADE)
    year_level = models.CharField(max_length=100, null=True, blank=True)
    class_name = models.CharField(max_length=100)

    # Many students can belong to many classes
    students = models.ManyToManyField('students.Student', related_name='classes') #Many students can be in many classes

    def __str__(self):
        """
        String representation of the Classes model.

        Returns:
            str: The class name.
        """
        return self.class_name
