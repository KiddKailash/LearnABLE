from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import Teacher
import re

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']

class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = Teacher
        fields = [
            'id', 'user', 'school', 'subject_specialty', 'profile_picture',
            'phone_number', 'bio', 'preferred_language', 'notification_preferences',
            'theme_preference', 'timezone', 'two_factor_enabled', 'last_password_change',
            'is_first_login'
        ]
        read_only_fields = ['id']

    def validate_phone_number(self, value):
        if value and not re.match(r'^\+?1?\d{9,15}$', value):
            raise serializers.ValidationError("Invalid phone number format")
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        # Update User fields
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        # Update Teacher fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
