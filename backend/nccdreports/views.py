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
- students_without_nccd_report: List students with disability info but no report.

All endpoints require authenticated users and are scoped to the teacher linked to that user.
"""
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from .models import NCCDreport, LessonEffectivenessRecord
from students.models import Student
from classes.models import Classes
from .serializers import NCCDreportSerializer, LessonEffectivenessRecordSerializer
from students.serializers import StudentSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_reports(request):
    """
    Retrieve a list of all NCCD reports for students taught by this teacher.
    """
    # only teachers may list reports
    if not hasattr(request.user, 'teacher'):
        return Response({'detail': 'User is not a teacher.'}, status=status.HTTP_403_FORBIDDEN)
    teacher = request.user.teacher
    reports = NCCDreport.objects.filter(
        student__classes__teacher=teacher
    ).distinct()

    serializer = NCCDreportSerializer(reports, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def get_report_detail(request, report_id):
    """
    Retrieve, update, or delete a specific NCCD report by its ID, scoped to this teacher.
    """
    # only teachers may access reports
    if not hasattr(request.user, 'teacher'):
        return Response({'detail': 'User is not a teacher.'}, status=status.HTTP_403_FORBIDDEN)
    report = get_object_or_404(
        NCCDreport,
        id=report_id,
        student__classes__teacher=request.user.teacher
    )

    if request.method == 'GET':
        serializer = NCCDreportSerializer(report, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        parser_classes = (MultiPartParser, FormParser)

        # optionally reassign student, must be your own
        student_id = request.data.get('student')
        if student_id:
            student = get_object_or_404(
                Student,
                id=student_id,
                classes__teacher=request.user.teacher
            )
            report.student = student

        # update allowed fields
        if 'status' in request.data:
            report.status = request.data['status']
        if 'disability_category' in request.data:
            report.disability_category = request.data['disability_category']
        if 'level_of_adjustment' in request.data:
            report.level_of_adjustment = request.data['level_of_adjustment']
        if 'has_evidence' in request.data:
            report.has_evidence = request.data['has_evidence'] == 'true'
        if 'under_dda' in request.data:
            report.under_dda = request.data['under_dda'] == 'true'
        if 'additional_comments' in request.data:
            report.additional_comments = request.data['additional_comments']

        # file upload
        if 'evidence' in request.FILES:
            report.evidence = request.FILES['evidence']
            report.has_evidence = True

        report.save()
        serializer = NCCDreportSerializer(report, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'DELETE':
        report.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_report(request):
    """
    Create a new NCCD report for a student, or return existing one if found, scoped to this teacher.
    """
    parser_classes = (MultiPartParser, FormParser)
    
    if not hasattr(request.user, 'teacher'):
        return Response({'detail': 'User is not a teacher.'}, status=status.HTTP_403_FORBIDDEN)

    student_id = request.data.get('student')
    if not student_id:
        return Response({'error': 'Student ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    student = get_object_or_404(
        Student,
        id=student_id,
        classes__teacher=request.user.teacher
    )

    existing = NCCDreport.objects.filter(student=student).first()
    if existing:
        serializer = NCCDreportSerializer(existing, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    report = NCCDreport(
        student=student,
        status=request.data.get('status', 'NotStart'),
        disability_category=request.data.get('disability_category', ''),
        level_of_adjustment=request.data.get('level_of_adjustment', ''),
        has_evidence=request.data.get('has_evidence', 'false').lower() == 'true',
        under_dda=request.data.get('under_dda', 'false').lower() == 'true',
        additional_comments=request.data.get('additional_comments', ''),
    )
    if 'evidence' in request.FILES:
        report.evidence = request.FILES['evidence']
        report.has_evidence = True

    report.save()
    serializer = NCCDreportSerializer(report, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reports_by_student(request, student_id):
    """
    List all NCCD reports for a specific student, scoped to this teacher.
    """
    if not hasattr(request.user, 'teacher'):
        return Response({'detail': 'User is not a teacher.'}, status=status.HTTP_403_FORBIDDEN)

    student = get_object_or_404(
        Student,
        id=student_id,
        classes__teacher=request.user.teacher
    )
    reports = NCCDreport.objects.filter(student=student)
    serializer = NCCDreportSerializer(reports, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ensure_reports_for_class(request, class_id):
    """
    Ensure NCCD reports for all qualifying students in a class, scoped to this teacher.
    """
    if not hasattr(request.user, 'teacher'):
        return Response({'detail': 'User is not a teacher.'}, status=status.HTTP_403_FORBIDDEN)

    class_obj = get_object_or_404(
        Classes,
        id=class_id,
        teacher=request.user.teacher
    )
    valid_reports = []
    from utils.encryption import decrypt

    for student in class_obj.students.all():
        info = decrypt(student._disability_info) if student._disability_info else ''
        if info.strip():
            report, _ = NCCDreport.objects.get_or_create(
                student=student,
                defaults={'status': 'NotStart'}
            )
            valid_reports.append(report)

    # remove stale
    NCCDreport.objects.filter(
        student__in=class_obj.students.exclude(
            id__in=[r.student.id for r in valid_reports]
        )
    ).delete()

    serializer = NCCDreportSerializer(valid_reports, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_lesson_effectiveness(request, report_id):
    """
    Record lesson effectiveness for a report, scoped to this teacher.
    """
    if not hasattr(request.user, 'teacher'):
        return Response({'error': 'User is not a teacher.'}, status=status.HTTP_403_FORBIDDEN)

    report = get_object_or_404(
        NCCDreport,
        id=report_id,
        student__classes__teacher=request.user.teacher
    )

    was_eff = request.data.get('was_effective')
    if was_eff is None:
        return Response({'error': 'was_effective is required (true/false).'}, status=status.HTTP_400_BAD_REQUEST)

    record = LessonEffectivenessRecord.objects.create(
        report=report,
        was_effective=(was_eff.lower() == 'true'),
        teacher=request.user.teacher
    )

    # determine next report
    from students.models import Student
    students_same = Student.objects.filter(
        classes__in=report.student.classes.all()
    )
    next_r = NCCDreport.objects.filter(
        student__in=students_same
    ).exclude(id=report.id).order_by('id').first()

    return Response({
        'id': record.id,
        'report': record.report.id,
        'lesson_date': record.lesson_date,
        'was_effective': record.was_effective,
        'teacher_id': record.teacher.id,
        'next_report_id': next_r.id if next_r else None
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_effectiveness_trend(request, student_id):
    """
    Retrieve cumulative lesson effectiveness trend for a student, scoped to this teacher.
    """
    if not hasattr(request.user, 'teacher'):
        return Response({'error': 'User is not a teacher.'}, status=status.HTTP_403_FORBIDDEN)

    student = get_object_or_404(
        Student,
        id=student_id,
        classes__teacher=request.user.teacher
    )
    records = LessonEffectivenessRecord.objects.filter(
        report__student=student
    ).order_by('lesson_date')

    data = []
    score = 0
    for rec in records:
        score += 1 if rec.was_effective else -1
        data.append({'date': rec.lesson_date, 'score': score})
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def students_without_nccd_report(request):
    """
    List students with disability info but no report yet, scoped to this teacher.
    """
    if not hasattr(request.user, 'teacher'):
        return Response({'error': 'User is not a teacher.'}, status=status.HTTP_403_FORBIDDEN)
    teacher = request.user.teacher

    reported_ids = NCCDreport.objects.filter(
        student__classes__teacher=teacher
    ).values_list('student_id', flat=True)

    candidates = Student.objects.filter(
        classes__teacher=teacher
    ).exclude(id__in=reported_ids).distinct()

    eligible = [s for s in candidates if s.disability_info.strip()]
    serializer = StudentSerializer(eligible, many=True)
    return Response(serializer.data)
