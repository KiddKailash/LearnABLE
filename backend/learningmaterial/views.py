from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, viewsets
from rest_framework.response import Response

from .models import LearningMaterials
from .serializers import LearningMaterialsSerializer
from .services.file_extractors import extract_text_from_pdf, extract_text_from_docx, extract_text_from_pptx
from .services.lesson_adapter import generate_adapted_lessons

class LearningMaterialsViewSet(viewsets.ModelViewSet):
    queryset = LearningMaterials.objects.all()
    serializer_class = LearningMaterialsSerializer
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if hasattr(request.user, 'teacher'):
            data['created_by'] = request.user.teacher.id
        else:
            return Response({"error": "User is not linked to a teacher."}, status=400)

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            instance = serializer.save()
            return Response(serializer.data, status=201)
        else:
            return Response(serializer.errors, status=400)

    @action(detail=True, methods=["post"])
    def adapt(self, request, pk=None):
        material = self.get_object()
        students = material.class_assigned.students.all()
        adapted_outputs = generate_adapted_lessons(material, students, return_file=True)

        response = {}

        for student in students:
            result = adapted_outputs.get(student.id)
            if not result:
                continue

            if "error" in result:
                response[student.id] = {"error": result["error"]}
            else:
                response[student.id] = {
                    "first_name": student.first_name,
                    "last_name": student.last_name,
                    "file_url": result.get("file_url"),
                    "audio_url": result.get("audio_url")
                }

        return Response(response)
