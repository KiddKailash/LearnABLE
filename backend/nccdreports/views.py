from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from datetime import date
from django.db.models import F

from .models import NCCDreport, LessonEffectivenessRecord
from students.models import Student
from classes.models import Classes
from .serializers import NCCDreportSerializer, LessonEffectivenessRecordSerializer

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
    Create a new NCCD report, or return existing if already created for the student.
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
            # Already exists so return existing report
            data = {
                'id': existing_report.id,
                'student': existing_report.student.id,
                'status': existing_report.status,
                'has_diagonsed_disability': existing_report.has_diagonsed_disability,
                'disability_category': existing_report.disability_category,
                'level_of_adjustment': existing_report.level_of_adjustment,
                'evidence': request.build_absolute_uri(existing_report.evidence.url) if existing_report.evidence else None
            }
            return Response(data, status=status.HTTP_200_OK)

        # Create new report
        report = NCCDreport(
            student=student,
            status=request.data.get('status', 'NotStart'),
            has_diagonsed_disability=request.data.get('has_diagonsed_disability', '').lower() == 'true',
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ensure_reports_for_class(request, class_id):
    """
    Ensure each student in the class who has a non-empty decrypted disability info has a report.
    Create one if needed. Return list of valid reports.
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
    Record lesson effectiveness for a report (yes/no), track teacher, return next report ID.
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