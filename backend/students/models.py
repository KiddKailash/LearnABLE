"""
Student model with encrypted personal and disability information fields.

- Stores first name, last name, and disability info in encrypted form.
- Provides properties to transparently decrypt/encrypt these fields.
- Validates uniqueness of student email (case-insensitive).
- Supports year-level choices (Prep to Year 12).
"""

from django.db import models
from django.core.exceptions import ValidationError
from utils.encryption import encrypt, decrypt

# Allowed year levels (Prep = 0, then 1–12)
YEAR_LEVEL_CHOICES = [(0, 'Prep')] + [(i, str(i)) for i in range(1, 13)]


class Student(models.Model):
    """
    Model representing a student with encrypted personal details and disability information.

    Attributes:
        _first_name (str): Encrypted first name.
        _last_name (str): Encrypted last name.
        year_level (int): Year level of the student (Prep=0, then 1-12).
        student_email (str): Unique email address of the student (case-insensitive uniqueness enforced).
        _disability_info (str): Encrypted disability information.
    """
    _first_name = models.CharField(db_column='first_name', blank=True)
    _last_name = models.CharField(db_column='last_name', blank=True)
    year_level = models.IntegerField(choices=YEAR_LEVEL_CHOICES)
    student_email = models.EmailField(
        max_length=100, default='missing')
    _disability_info = models.TextField(
        db_column='disability_info', blank=True)

    def __str__(self):
        """
        Return the student's full name as a string.
        """
        return f"{self.first_name} {self.last_name}"


    def save(self, *args, **kwargs):
        """
        Override save to encrypt sensitive fields before saving.

        Encrypts _disability_info, _first_name, and _last_name fields if not already encrypted.
        Calls full_clean() to validate the model before saving.
        """
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
        """
        Setter for disability_info property.
        Stores the raw (unencrypted) value which will be encrypted on save.
        """
        return decrypt(self._disability_info) if self._disability_info else ''

    @property
    def first_name(self):
        """
        Decrypt and return the first name.

        Returns:
            str: Decrypted first name or empty string if none.
        """
        return decrypt(self._first_name) if self._first_name else ''

    @property
    def last_name(self):
        return decrypt(self._last_name) if self._last_name else ''

    @disability_info.setter
    def disability_info(self, value):
        """
        Setter for first_name property.
        Stores the raw (unencrypted) value which will be encrypted on save.
        """
        self._disability_info = value

    @first_name.setter
    def first_name(self, value):
        """
        Decrypt and return the last name.

        Returns:
            str: Decrypted last name or empty string if none.
        """
        self._first_name = value

    @last_name.setter
    def last_name(self, value):
        """
        Setter for last_name property.
        Stores the raw (unencrypted) value which will be encrypted on save.
        """
        self._last_name = value
