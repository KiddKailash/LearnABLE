from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Classes
from .serializers import ClassSerializer
from teachers.models import Teacher

# Create class object
@api_view(['POST'])
def create_class(request):
    serializer = ClassSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_all_classes(request):
    """
    Retrieve a list of all classes in the system.

    Returns:
        Response: A list of serialized class objects.
    """
    classes = Classes.objects.all()
    serializer = ClassSerializer(classes, many=True)
    return Response(serializer.data)