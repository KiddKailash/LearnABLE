from rest_framework import serializers
from .models import Teacher

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['name', 'email', 'password']

    def create(self, validated_data):
        # You may want to hash the password before saving
        teacher = Teacher(
            name=validated_data['name'],
            email=validated_data['email'],
            password=validated_data['password'],  # Make sure to hash the password in a real-world scenario
        )
        teacher.save()
        return teacher
