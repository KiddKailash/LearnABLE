from rest_framework import serializers
from .models import LearningMaterials

class LearningMaterialsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningMaterials
        fields = "__all__"  # Include all fields, including the file field
