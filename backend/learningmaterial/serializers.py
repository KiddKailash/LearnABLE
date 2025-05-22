"""
Serializers for the 'learningmaterial' app.

This module provides serializers to convert LearningMaterials model instances
to and from JSON representations, facilitating API interactions and data validation.
"""

from rest_framework import serializers
from .models import LearningMaterials

class LearningMaterialsSerializer(serializers.ModelSerializer):
    """
    Serializer for the LearningMaterials model.

    This serializer handles the conversion between LearningMaterials model instances
    and JSON representations, supporting all model fields for full CRUD operations.
    """
    class Meta:
        model = LearningMaterials
        fields = '__all__'
