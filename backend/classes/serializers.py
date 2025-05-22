"""
Serializers for the 'classes' app.

This module defines the ClassSerializer used to convert Classes model instances
into JSON representations, including nested serialization of enrolled students.
"""

from rest_framework import serializers
from .models import Classes
from students.models import Student
from students.serializers import StudentSerializer

class ClassSerializer(serializers.ModelSerializer):
    """
    Serializer for the Classes model.

    Includes nested serialization of related students using StudentSerializer.
    The students field is read-only and returns a list of serialized students
    enrolled in the class.
    """
    students = StudentSerializer(many=True, read_only=True)

    class Meta:
        model = Classes
        fields = '__all__'  # Serialize all fields of the Classes model
