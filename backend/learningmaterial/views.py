from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import LearningMaterials
from .serializers import LearningMaterialsSerializer

class LearningMaterialsViewSet(viewsets.ModelViewSet):
    queryset = LearningMaterials.objects.all()
    serializer_class = LearningMaterialsSerializer
    parser_classes = (MultiPartParser, FormParser)  # Allow file uploads

    def create(self, request, *args, **kwargs): # Print incoming request data
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED) # Print validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
