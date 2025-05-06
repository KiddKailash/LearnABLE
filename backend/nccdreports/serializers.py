from rest_framework import serializers
from .models import NCCDreport, LessonEffectivenessRecord

class NCCDreportSerializer(serializers.ModelSerializer):
    evidence_url = serializers.SerializerMethodField()

    class Meta:
        model = NCCDreport
        fields = [
            'id',
            'student',
            'status',
            'has_diagonsed_disability',
            'disability_category',
            'level_of_adjustment',
            'evidence',
            'evidence_url'
        ]

    def get_evidence_url(self, obj):
        request = self.context.get('request')
        if obj.evidence and request:
            return request.build_absolute_uri(obj.evidence.url)
        return None

class LessonEffectivenessRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonEffectivenessRecord
        fields = '__all__'