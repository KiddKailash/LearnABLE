from rest_framework import serializers
from .models import Classes
from students.models import Student
from students.serializers import StudentSerializer

class ClassSerializer(serializers.ModelSerializer):
    students = StudentSerializer(many=True, read_only=True)

    class Meta:
        model = Classes
        fields = ['id', 'class_name', 'subject', 'teacher', 'students']