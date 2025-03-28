from django.db import models

class Student(models.Model):
    student_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    year_level = models.IntegerField()
    learning_needs = models.TextField()
    guardian_email = models.EmailField(max_length=100)
    disability_status = models.CharField(max_length=100, blank=True, null=True)
    support_level = models.CharField(
        max_length=31,
        choices=[
            ('Quality Differentiated Teaching', 'Quality Differentiated Teaching'),
            ('Supplementary', 'Supplementary'),
            ('Substantial', 'Substantial'),
            ('Extensive', 'Extensive')
        ]
    )
    funding_eligibility = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
