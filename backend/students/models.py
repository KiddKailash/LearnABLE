
from django.db import models
from django.core.exceptions import ValidationError
from utils.encryption import encrypt, decrypt

# Allowed year levels (Prep = 0, then 1–12)
YEAR_LEVEL_CHOICES = [(0, 'Prep')] + [(i, str(i)) for i in range(1, 13)]

class Student(models.Model):
    _first_name = models.CharField(db_column='first_name', blank=True)
    _last_name = models.CharField(db_column='last_name', blank=True)

    year_level = models.IntegerField(choices=YEAR_LEVEL_CHOICES)

    student_email = models.EmailField(max_length=100, default='missing', unique=True)
    _disability_info = models.TextField(db_column='disability_info', blank=True)  # Store encrypted


    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def clean(self):
        # Case-insensitive check for unique student_email
        if Student.objects.exclude(pk=self.pk).filter(student_email__iexact=self.student_email).exists():
            raise ValidationError({"student_email": "A student with this email already exists (case-insensitive)."})

    def save(self, *args, **kwargs):
        if self._disability_info and not self._disability_info.startswith("gAAAA"):
            self._disability_info = encrypt(self._disability_info)
        if self._first_name and not self._first_name.startswith("gAAAA"):
            self._first_name = encrypt(self._first_name)
        if self._last_name and not self._last_name.startswith("gAAAA"):
            self._last_name = encrypt(self._last_name)
        self.full_clean()
        super().save(*args, **kwargs)


    @property
    def disability_info(self):
        return decrypt(self._disability_info) if self._disability_info else ''

    @property
    def first_name(self):
        return decrypt(self._first_name) if self._first_name else ''
    
    @property
    def last_name(self):
        return decrypt(self._last_name) if self._last_name else ''

    @disability_info.setter
    def disability_info(self, value):
        self._disability_info = value
    
    @first_name.setter
    def first_name(self, value):
        self._first_name = value
    
    @last_name.setter
    def last_name(self, value):
        self._last_name = value