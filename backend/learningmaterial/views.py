from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import LearningMaterials
from .serializers import LearningMaterialsSerializer
from django.conf import settings
import os

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
        

class LearningMaterialUploadView(APIView):
    def post(self, request):
        title = request.data.get('title')
        created_by_id = request.data.get('created_by')
        class_assigned_id = request.data.get('class_assigned')  # Optional
        uploaded_file = request.FILES.get('file')

        if not uploaded_file:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        learning_material = LearningMaterials.objects.create(
            title=title,
            created_by_id=created_by_id,
            class_assigned_id=class_assigned_id,
            file=uploaded_file,
            ai_processed=False
        )

        return Response({'message': 'File uploaded successfully.', 'id': learning_material.id}, status=status.HTTP_201_CREATED)
