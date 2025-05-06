from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from .models import NCCDreport
from students.models import Student

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_reports(request):
    """
    Get all NCCD reports.
    """
    reports = NCCDreport.objects.all()
    data = []
    for report in reports:
        report_data = {
            'id': report.id,
            'student': report.student.id,
            'status': report.status,
            'has_diagonsed_disability': report.has_diagonsed_disability,
            'disability_category': report.disability_category,
            'level_of_adjustment': report.level_of_adjustment,
            'evidence': request.build_absolute_uri(report.evidence.url) if report.evidence else None
        }
        data.append(report_data)
    
    return Response(data)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def get_report_detail(request, report_id):
    """
    Get, update or delete a specific NCCD report.
    """
    report = get_object_or_404(NCCDreport, id=report_id)
    
    if request.method == 'GET':
        # Return the report details
        data = {
            'id': report.id,
            'student': report.student.id,
            'status': report.status,
            'has_diagonsed_disability': report.has_diagonsed_disability,
            'disability_category': report.disability_category,
            'level_of_adjustment': report.level_of_adjustment,
            'evidence': request.build_absolute_uri(report.evidence.url) if report.evidence else None
        }
        return Response(data)
    
    elif request.method == 'PUT':
        # Update the report
        parser_classes = (MultiPartParser, FormParser)
        
        # Handle student field
        student_id = request.data.get('student')
        if student_id:
            student = get_object_or_404(Student, id=student_id)
            report.student = student
        
        # Update other fields
        if 'status' in request.data:
            report.status = request.data['status']
        
        if 'has_diagonsed_disability' in request.data:
            report.has_diagonsed_disability = request.data['has_diagonsed_disability'] == 'true'
        
        if 'disability_category' in request.data:
            report.disability_category = request.data['disability_category']
        
        if 'level_of_adjustment' in request.data:
            report.level_of_adjustment = request.data['level_of_adjustment']
        
        # Handle file upload
        if 'evidence' in request.FILES:
            report.evidence = request.FILES['evidence']
        
        report.save()
        
        # Return updated report
        data = {
            'id': report.id,
            'student': report.student.id,
            'status': report.status,
            'has_diagonsed_disability': report.has_diagonsed_disability,
            'disability_category': report.disability_category,
            'level_of_adjustment': report.level_of_adjustment,
            'evidence': request.build_absolute_uri(report.evidence.url) if report.evidence else None
        }
        return Response(data)
    
    elif request.method == 'DELETE':
        # Delete the report
        report.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_report(request):
    """
    Create a new NCCD report.
    """
    parser_classes = (MultiPartParser, FormParser)
    
    try:
        # Get student
        student_id = request.data.get('student')
        if not student_id:
            return Response({'error': 'Student ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        student = get_object_or_404(Student, id=student_id)
        
        # Create new report
        report = NCCDreport(
            student=student,
            status=request.data.get('status', 'NotStart'),
            has_diagonsed_disability=request.data.get('has_diagonsed_disability') == 'true',
            disability_category=request.data.get('disability_category', ''),
            level_of_adjustment=request.data.get('level_of_adjustment', ''),
        )
        
        # Handle file upload
        if 'evidence' in request.FILES:
            report.evidence = request.FILES['evidence']
        
        report.save()
        
        # Return created report
        data = {
            'id': report.id,
            'student': report.student.id,
            'status': report.status,
            'has_diagonsed_disability': report.has_diagonsed_disability,
            'disability_category': report.disability_category,
            'level_of_adjustment': report.level_of_adjustment,
            'evidence': request.build_absolute_uri(report.evidence.url) if report.evidence else None
        }
        return Response(data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reports_by_student(request, student_id):
    """
    Get all NCCD reports for a specific student.
    """
    student = get_object_or_404(Student, id=student_id)
    reports = NCCDreport.objects.filter(student=student)
    
    data = []
    for report in reports:
        report_data = {
            'id': report.id,
            'student': report.student.id,
            'status': report.status,
            'has_diagonsed_disability': report.has_diagonsed_disability,
            'disability_category': report.disability_category,
            'level_of_adjustment': report.level_of_adjustment,
            'evidence': request.build_absolute_uri(report.evidence.url) if report.evidence else None
        }
        data.append(report_data)
    
    return Response(data)

