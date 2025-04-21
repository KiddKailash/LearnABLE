from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import LearningMaterials
from .serializers import LearningMaterialsSerializer

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


