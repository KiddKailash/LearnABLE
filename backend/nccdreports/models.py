"""
Models for managing NCCD reports, lesson effectiveness records, and teacher questionnaires.

This module defines:

- NCCDreport: Stores information about a student's disability, adjustments, and supporting evidence.
- LessonEffectivenessRecord: Tracks the effectiveness of lessons with adjustments for students.
- Questionnaire: Captures teacher feedback on the effectiveness of adjustments for a student.

These models support tracking and documenting student needs and educational outcomes
in compliance with NCCD reporting requirements.
"""


from django.db import models
from students.models import Student
from teachers.models import Teacher

class NCCDreport(models.Model):
    """
    Model representing an NCCD report for a student,
    detailing their disability category, adjustment level, and evidence.
    """
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=[('InProgress', 'InProgress'), ('Approved',
                                                'Approved'), ('NotStart', 'NotStart')],
        default='NotStarted'
    )

    disability_category = models.CharField(
        max_length=20,
        choices=[('Cognitive', 'Cognitive'), ('Physical', 'Physical'),
                 ('Social/Emotional', 'Social/Emotional'), ('Sensory', 'Sensory')],
        default='None'
    )
    level_of_adjustment = models.CharField(
        max_length=20,
        choices=[('QDTP', 'QDTP'), ('Supplementary', 'Supplementary'),
                 ('Substantial', 'Substantial'), ('Extensive', 'Extensive')],
        default='None'
    )
    has_evidence = models.BooleanField(default=False)
    evidence = models.FileField(
        upload_to='nccdreports/', null=True, blank=True)
    under_dda = models.BooleanField(default=False)
    additional_comments = models.TextField(blank=True)

    def __str__(self):
        return f"{self.student.first_name} {self.student.last_name}"

    @property
    def has_diagonsed_disability(self):
        """
        Dynamically checks if the linked student has a diagnosed disability
        by evaluating if the disability_info field is non-empty.
        """
        return bool(self.student.disability_info.strip())


class LessonEffectivenessRecord(models.Model):
    """
    Tracks how effective a lesson was for a student with adjustments in place,
    linked to an NCCD report.
    """
    report = models.ForeignKey(
        NCCDreport, on_delete=models.CASCADE, related_name='effectiveness_records')
    teacher = models.ForeignKey(
        Teacher, on_delete=models.CASCADE, null=True, blank=True)
    lesson_date = models.DateField(auto_now_add=True)
    was_effective = models.BooleanField()
    feedback = models.TextField(blank=True)

    def __str__(self):
        return f"{self.report.student} on {self.lesson_date}: {'Yes' if self.was_effective else 'No'}"


class Questionnaire(models.Model):
    """
    Represents a questionnaire submission by a teacher regarding the
    effectiveness of adjustments for a student as part of their NCCD report.
    """
    report = models.ForeignKey(
        NCCDreport, on_delete=models.CASCADE, related_name='questionnaires')
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name='questionnaires')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)

    effectiveness_rating = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 6)])
    progress_notes = models.TextField(blank=True)

    parent_consulted = models.BooleanField(default=False)
    evidence = models.FileField(
        upload_to='nccdreports/questionnaire_evidence/', blank=True, null=True)
    # TODO: Add more questions according to research/feedback

    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.report} - Rating: {self.effectiveness_rating}"
