"""
Views for managing NCCD reports and lesson effectiveness tracking.

This module provides API endpoints to create, retrieve, update, and delete NCCD reports,
manage lesson effectiveness records related to reports, and retrieve effectiveness trends.

Endpoints include:
- get_all_reports: List all NCCD reports.
- get_report_detail: Retrieve, update, or delete a specific NCCD report.
- create_report: Create a new NCCD report or return existing one for a student.
- get_reports_by_student: List all reports for a specific student.
- ensure_reports_for_class: Ensure reports exist for all qualifying students in a class.
- create_lesson_effectiveness: Create a lesson effectiveness record for a report.
- get_effectiveness_trend: Retrieve cumulative lesson effectiveness trend data for a student.

All endpoints require authenticated users and use Django REST Framework's API view decorators.
"""

from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from datetime import date
from django.db.models import F

from .models import NCCDreport, LessonEffectivenessRecord
from students.models import Student
from classes.models import Classes
from .serializers import NCCDreportSerializer, LessonEffectivenessRecordSerializer
from students.serializers import StudentSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_reports(request):
    """
    Retrieve a list of all NCCD reports.

    Returns:
        200 OK: A JSON list of NCCD report objects with their details.
    """
    reports = NCCDreport.objects.all()
    serializer = NCCDreportSerializer(reports, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def get_report_detail(request, report_id):
    """
    Retrieve, update, or delete a specific NCCD report by its ID.

    Args:
        report_id (int): ID of the NCCD report.

    Methods:
        GET: Return report details.
        PUT: Update report fields and/or evidence file.
        DELETE: Delete the report.

    Returns:
        200 OK with report data (GET, PUT),
        204 No Content (DELETE),
        or appropriate error status.
    """
    report = get_object_or_404(NCCDreport, id=report_id)
    
    if request.method == 'GET':
        # Return the report details using serializer
        serializer = NCCDreportSerializer(report, context={'request': request})
        return Response(serializer.data)
    
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
        
        if 'disability_category' in request.data:
            report.disability_category = request.data['disability_category']
        
        if 'level_of_adjustment' in request.data:
            report.level_of_adjustment = request.data['level_of_adjustment']
        
        if 'under_dda' in request.data:
            report.under_dda = request.data['under_dda'] == 'true'
            
        if 'additional_comments' in request.data:
            report.additional_comments = request.data['additional_comments']
        
        # Handle file upload
        if 'evidence' in request.FILES:
            report.evidence = request.FILES['evidence']
        
        report.save()
        
        # Return updated report using serializer
        serializer = NCCDreportSerializer(report, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'DELETE':
        # Delete the report
        report.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_report(request):
    """
    Create a new NCCD report for a student, or return an existing one if found.

    Expects:
        - student: ID of the student (required).
        - status, disability_category, level_of_adjustment, under_dda, additional_comments (optional).
        - evidence: file upload (optional).

    Returns:
        201 Created with new report data, or
        200 OK with existing report if already present,
        or 400 Bad Request on errors.
    """
    parser_classes = (MultiPartParser, FormParser)

    try:
        # Get student
        student_id = request.data.get('student')
        if not student_id:
            return Response({'error': 'Student ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        student = get_object_or_404(Student, id=student_id)

        # future: a `term` field, you would filter by term too, or maybe semester
        existing_report = NCCDreport.objects.filter(student=student).first()
        if existing_report:
            # Already exists so return existing report using serializer
            serializer = NCCDreportSerializer(existing_report, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Create new report
        report = NCCDreport(
            student=student,
            status=request.data.get('status', 'NotStart'),
            disability_category=request.data.get('disability_category', ''),
            level_of_adjustment=request.data.get('level_of_adjustment', ''),
            under_dda=request.data.get('under_dda', 'false').lower() == 'true',
            additional_comments=request.data.get('additional_comments', ''),
        )

        # Handle file upload
        if 'evidence' in request.FILES:
            report.evidence = request.FILES['evidence']

        report.save()

        # Return created report using serializer
        serializer = NCCDreportSerializer(report, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reports_by_student(request, student_id):
    """
    Retrieve all NCCD reports associated with a specific student.

    Args:
        student_id (int): ID of the student.

    Returns:
        200 OK: List of reports for the student.
    """
    student = get_object_or_404(Student, id=student_id)
    reports = NCCDreport.objects.filter(student=student)
    
    serializer = NCCDreportSerializer(reports, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ensure_reports_for_class(request, class_id):
    """
    Ensure that every student in the class with disability info has an NCCD report.
    Creates reports for qualifying students and deletes reports for non-qualifying ones.

    Args:
        class_id (int): ID of the class.

    Returns:
        200 OK: List of valid reports for the class.
    """
    from utils.encryption import decrypt

    class_list = get_object_or_404(Classes, id=class_id)
    valid_reports = []

    for student in class_list.students.all():
        decrypted_info = decrypt(student._disability_info) if student._disability_info else ''
        
        if decrypted_info.strip():
            #Only create/get report if decrypted disability info is non-empty
            report, _ = NCCDreport.objects.get_or_create(
                student=student,
                defaults={'status': 'NotStart'}
            )
            valid_reports.append(report)

    # delete reports for students who no longer qualify
    NCCDreport.objects.filter(
        student__in=class_list.students.exclude(id__in=[r.student.id for r in valid_reports])
    ).delete()

    serializer = NCCDreportSerializer(valid_reports, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_lesson_effectiveness(request, report_id):
    """
    Record a lesson effectiveness entry linked to a specific NCCD report and teacher.

    Args:
        report_id (int): ID of the NCCD report.
        was_effective (bool, required): Whether the lesson was effective.

    Returns:
        201 Created: Lesson effectiveness record details including next report ID for navigation.
        400 Bad Request: Missing or invalid data.
        403 Forbidden: User not linked to teacher.
    """
    report = get_object_or_404(NCCDreport, id=report_id)

    # Get was_effective value from request
    was_effective = request.data.get('was_effective')
    if was_effective is None:
        return Response({'error': 'was_effective is required (true/false).'}, status=400)

    # Check that the user is linked to a teacher
    if not hasattr(request.user, 'teacher'):
        return Response({'error': 'User is not linked to a teacher account.'}, status=403)

    # Create new record, linking to teacher
    record = LessonEffectivenessRecord.objects.create(
        report=report,
        was_effective=(was_effective.lower() == 'true'),
        teacher=request.user.teacher
    )

    # Find the next report in the same class (if any)
    students_in_same_classes = Student.objects.filter(classes__in=report.student.classes.all())
    class_reports = NCCDreport.objects.filter(
        student__in=students_in_same_classes
    ).exclude(id=report.id).order_by('id')


    next_report = class_reports.first()
    next_report_id = next_report.id if next_report else None

    return Response({
        'id': record.id,
        'report': record.report.id,
        'lesson_date': record.lesson_date,
        'was_effective': record.was_effective,
        'teacher_id': record.teacher.id,
        'next_report_id': next_report_id  # helps frontend move to next
    }, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_effectiveness_trend(request, student_id):
    """
    Retrieve cumulative lesson effectiveness scores over time for a student.

    Args:
        student_id (int): ID of the student.

    Returns:
        200 OK: List of dates and cumulative effectiveness scores.
    """
    student = Student.objects.get(id=student_id)

    records = LessonEffectivenessRecord.objects.filter( report__student=student).order_by('lesson_date')

    data = []
    score = 0

    for record in records:
        score += 1 if record.was_effective else -1
        data.append({
            'date': record.lesson_date,
            'score': score,
        })

    return Response(data)

@api_view(['GET'])
def students_without_nccd_report(request):
    """
    Get students who have disability information but no NCCD report yet.
    
    Returns:
        200 OK: List of eligible students.
    """
    try:
        reported_ids = set(NCCDreport.objects.values_list('student_id', flat=True))
        
        unreported_students = Student.objects.exclude(id__in=reported_ids)
        
        eligible_students = []
        for s in unreported_students:
            if s.disability_info.strip():
                eligible_students.append(s)
        
        serializer = StudentSerializer(eligible_students, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
