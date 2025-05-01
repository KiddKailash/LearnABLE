from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Assessment
from classes.models import Classes
from django.shortcuts import get_object_or_404
import json

# Create your views here.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_assessments_by_class(request, class_id):
    """Get all assessments for a specific class"""
    try:
        # Check if class exists
        class_obj = get_object_or_404(Classes, id=class_id)
        
        # Get assessments for this class
        assessments = Assessment.objects.filter(class_obj=class_obj)
        
        # Convert to list of dictionaries for JSON response
        assessments_data = []
        for assessment in assessments:
            assessments_data.append({
                'id': assessment.id,
                'title': assessment.title,
                'description': assessment.description,
                'total_marks': assessment.total_marks,
                'class_id': class_obj.id,
                'className': class_obj.class_name
            })
        
        return Response(assessments_data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
