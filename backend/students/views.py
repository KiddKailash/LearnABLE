"""
Views module providing API endpoints to manage Student entities.

Includes functionality to:
- Retrieve all students associated with the authenticated teacher.
- Create, update (full and partial), retrieve, and delete individual students.
- Retrieve students by class and check student existence by email.
- Bulk upload students to a class via CSV file upload.
- Retrieve students with decrypted disability information for the authenticated teacher.

Permissions are enforced where necessary to ensure data security.

Utilizes Django REST Framework decorators and serializers for request handling and response formatting.
"""

from django.shortcuts import render
import csv
import io

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework import status
from .models import Student
from .serializers import StudentSerializer
from classes.serializers import ClassSerializer
from classes.models import Classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import permission_classes
from teachers.models import Teacher


# Get all students
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_students(request):
    """
    Retrieve all students associated with the authenticated teacher.

    Returns:
        HTTP 200 with serialized list of students or
        HTTP 400 if teacher profile not found.
    """
    try:
        # Get the teacher linked to the current user
        teacher = Teacher.objects.get(user=request.user)

        # Find all classes taught by this teacher
        classes = Classes.objects.filter(teacher=teacher)

        # Get students from these classes (distinct to avoid duplicates)
        students = Student.objects.filter(classes__in=classes).distinct()

        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    except Teacher.DoesNotExist:
        return Response(
            {"error": "No teacher profile found for this user"},
            status=status.HTTP_400_BAD_REQUEST
        )


# Create a student
@api_view(['POST'])
def create_student(request):
    """
    Create a new student with provided data.

    Returns:
        HTTP 201 with created student data if successful,
        HTTP 400 with validation errors otherwise.
    """
    serializer = StudentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        print(f"Created student: {Student.student_email}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Update a student
@api_view(['PUT'])
def update_student(request, student_id):
    """
    Fully update the student identified by student_id with provided data.

    Args:
        student_id (int): ID of the student to update.

    Returns:
        HTTP 200 with updated student data if successful,
        HTTP 404 if student not found,
        HTTP 400 if validation fails.
    """
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    serializer = StudentSerializer(student, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


# Get a single student
@api_view(['GET'])
def get_student(request, student_id):
    """
    Retrieve a student by their ID.

    Args:
        student_id (int): ID of the student to retrieve.

    Returns:
        HTTP 200 with student data if found,
        HTTP 404 if student does not exist.
    """
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    serializer = StudentSerializer(student)
    return Response(serializer.data)


# Delete a student
@api_view(['DELETE'])
def delete_student(request, student_id):
    """
    Delete a student identified by student_id.

    Args:
        student_id (int): ID of the student to delete.

    Returns:
        HTTP 204 if deletion successful,
        HTTP 404 if student not found.
    """
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    student.delete()
    return Response({"message": "Student deleted successfully"}, status=204)


# Update student's fields
@api_view(['PATCH'])
def partial_update_student(request, student_id):
    """
    Partially update fields of a student by their ID.

    Args:
        student_id (int): ID of the student to update.

    Returns:
        HTTP 200 with updated student data if successful,
        HTTP 404 if student not found,
        HTTP 400 if validation fails.
    """
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    serializer = StudentSerializer(student, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_students_by_class(request, class_id):
    """
    Retrieve a class and its students by class ID.

    Args:
        class_id (int): ID of the class.

    Returns:
        HTTP 200 with serialized class data including students,
        HTTP 404 if class not found.
    """
    try:
        class_obj = Classes.objects.get(id=class_id)
        serializer = ClassSerializer(class_obj)
        return Response(serializer.data)
    except Classes.DoesNotExist:
        return Response({"error": "Class not found"}, status=404)


# Check if a student exists by email (for linking to another class)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_student_by_email(request):
    """
    Retrieve a student by email address (case-insensitive).

    Expects:
        student_email (string): email in POST data.

    Returns:
        HTTP 200 with student data if found,
        HTTP 200 with empty object if not found,
        HTTP 400 if email not provided.
    """
    email = request.data.get("student_email", "").lower().strip()
    if not email:
        return Response({"error": "Email is required"}, status=400)

    students = Student.objects.filter(student_email__iexact=email)
    serializer = StudentSerializer(students, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def upload_csv_to_class(request):
    """
    Upload a CSV file to bulk add students to a class.

    Expects:
        file: CSV file uploaded with key 'file',
        class_id: class ID in POST data.

    CSV must include columns: student_email, first_name, last_name, year_level, disability_info.

    Returns:
        HTTP 200 with count of students added,
        HTTP 400 if file or class_id missing,
        HTTP 404 if class not found.
    """
    csv_file = request.FILES.get("file")
    class_id = request.POST.get("class_id")

    if not csv_file or not class_id:
        return Response({"error": "Missing file or class_id"}, status=400)

    try:
        class_obj = Classes.objects.get(id=class_id)
    except Classes.DoesNotExist:
        return Response({"error": "Class not found"}, status=404)

    decoded_file = csv_file.read().decode("utf-8")
    io_string = io.StringIO(decoded_file)
    reader = csv.DictReader(io_string)

    added_count = 0
    skipped_count = 0

    for row in reader:
        email = row.get("student_email", "").strip().lower()
        first_name = row.get("first_name", "").strip()
        last_name = row.get("last_name", "").strip()
        year_level = row.get("year_level", "").strip()
        disability_info = row.get("disability_info", "").strip()

        # Use the model directly so we can force a fresh object with no checks
        student = Student()
        student.student_email = email
        student.first_name = first_name
        student.last_name = last_name
        student.year_level = year_level
        student.disability_info = disability_info
        student.save()  # This triggers encryption in your save()

        class_obj.students.add(student)
        added_count += 1



    return Response({
        "added": added_count,
        "skipped": skipped_count,
        "message": "Students uploaded allowing duplicates."
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_students_with_disabilities(request):
    """
    Retrieve all students with non-empty decrypted disability info
    associated with the authenticated teacher.

    Returns:
        HTTP 200 with serialized list of students.
    """
    from utils.encryption import decrypt

    try:
        teacher = Teacher.objects.get(user=request.user)
        classes = Classes.objects.filter(teacher=teacher)
        students = Student.objects.filter(classes__in=classes).distinct()

        eligible = []
        for student in students:
            decrypted = decrypt(
                student._disability_info) if student._disability_info else ''
            if decrypted.strip():
                eligible.append(student)

        serializer = StudentSerializer(eligible, many=True)
        return Response(serializer.data)

    except Teacher.DoesNotExist:
        return Response({"error": "No teacher profile found for this user"}, status=400)
