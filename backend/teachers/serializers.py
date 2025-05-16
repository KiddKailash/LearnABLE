"""
Serializers for Teacher and related User data.

Defines how Teacher and nested User model data is converted to/from JSON,
including validation and update logic for nested user fields.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import Teacher
import re

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model with selected fields.
    """
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']

class TeacherSerializer(serializers.ModelSerializer):
    """
    Serializer for Teacher model including nested User data.

    Handles validation of phone number format and updating nested User and Teacher fields.
    """
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
        """
        Validate phone number format to match international pattern (+countrycode and digits).

        Args:
            value (str): The phone number string to validate.

        Raises:
            serializers.ValidationError: If phone number does not match expected format.

        Returns:
            str: Validated phone number.
        """
        if value and not re.match(r'^\+?1?\d{9,15}$', value):
            raise serializers.ValidationError("Invalid phone number format")
        return value

    def update(self, instance, validated_data):
        """
        Update a Teacher instance along with nested User fields.

        Args:
            instance (Teacher): The Teacher instance to update.
            validated_data (dict): Validated data from the request, including nested user data.

        Returns:
            Teacher: The updated Teacher instance.
        """
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
