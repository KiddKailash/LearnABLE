from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import Teacher

class TeacherSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Teacher
        fields = ['id', 'first_name', 'last_name', 'email', 'password']

    def create(self, validated_data):
        # Extract user data
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        email = validated_data.pop('email')
        password = make_password(validated_data.pop('password'))

        # Create user using email as username
        user = User.objects.create(
            first_name=first_name,
            last_name=last_name,
            email=email,
            username=email,
            password=password
        )

        # Create and return the Teacher object
        teacher = Teacher.objects.create(user=user)
        return teacher
