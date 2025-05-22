from rest_framework import serializers
from .models import NCCDreport, LessonEffectivenessRecord


class NCCDreportSerializer(serializers.ModelSerializer):
    """
    Serializer for the NCCDreport model. 
    Includes computed fields for evidence URL and disability status.
    """
    evidence_url = serializers.SerializerMethodField(read_only=True)
    has_diagonsed_disability = serializers.SerializerMethodField(read_only=True)
    has_evidence = serializers.BooleanField(required=False)

    class Meta:
        model = NCCDreport
        fields = [
            'id',
            'student',
            'status',
            'has_diagonsed_disability',
            'disability_category',
            'level_of_adjustment',
            'under_dda',
            'additional_comments',
            'evidence',
            'evidence_url',
            'has_evidence'
        ]

        read_only_fields = ['has_diagonsed_disability', 'evidence_url']

    def get_evidence_url(self, obj):
        """
        Returns the full URL to the uploaded evidence file if it exists.
        """
        request = self.context.get('request')
        if obj.evidence and request:
            return request.build_absolute_uri(obj.evidence.url)
        return None

    def get_has_diagonsed_disability(self, obj):
        """
        Returns whether the student has a diagnosed disability by checking the related field.
        """
        return obj.has_diagonsed_disability


class LessonEffectivenessRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for the LessonEffectivenessRecord model.
    """
    class Meta:
        model = LessonEffectivenessRecord
        fields = '__all__'
