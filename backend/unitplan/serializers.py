from rest_framework import serializers
from .models import UnitPlan
from classes.serializers import ClassSerializer

class UnitPlanSerializer(serializers.ModelSerializer):
    class_name = serializers.ReadOnlyField(source='class_instance.class_name')
    file_size = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    document_url = serializers.SerializerMethodField()
    from_creation_flow = serializers.BooleanField(write_only=True, required=False, default=False)
    
    class Meta:
        model = UnitPlan
        fields = ['id', 'class_instance', 'class_name', 'title', 'description', 
                  'document', 'document_url', 'file_name', 'file_type', 'file_size', 
                  'uploaded_at', 'updated_at', 'from_creation_flow']
        read_only_fields = ['file_type', 'uploaded_at', 'updated_at', 'file_name', 'document_url']
    
    def create(self, validated_data):
        """Override create to remove from_creation_flow before creating the model instance"""
        # Remove non-model fields from validated_data
        from_creation_flow = validated_data.pop('from_creation_flow', False)
        
        # Log the removal to ensure it's working
        print(f"UnitPlanSerializer.create - Removed from_creation_flow: {from_creation_flow}")
        print(f"UnitPlanSerializer.create - Remaining validated_data keys: {list(validated_data.keys())}")
        
        # Create instance with filtered data
        return super().create(validated_data)
    
    def get_file_size(self, obj):
        if obj.document and hasattr(obj.document, 'size'):
            # Return file size in KB, rounded to 2 decimal places
            return round(obj.document.size / 1024, 2)
        return None
    
    def get_file_name(self, obj):
        if obj.document and obj.document.name:
            # Return just the filename, not the full path
            return obj.document.name.split('/')[-1]
        return None
    
    def get_document_url(self, obj):
        if obj.document:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.document.url)
        return None

class UnitPlanListSerializer(serializers.ModelSerializer):
    class_name = serializers.ReadOnlyField(source='class_instance.class_name')
    file_name = serializers.SerializerMethodField()
    
    class Meta:
        model = UnitPlan
        fields = ['id', 'class_instance', 'class_name', 'title', 'file_name', 'file_type', 'uploaded_at']
    
    def get_file_name(self, obj):
        if obj.document and obj.document.name:
            return obj.document.name.split('/')[-1]
        return None 