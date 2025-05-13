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

#Get all students
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_students(request):
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
    serializer = StudentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        print(f"Created student: {Student.student_email}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Update a student
@api_view(['PUT'])
def update_student(request, student_id):
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
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    serializer = StudentSerializer(student)
    return Response(serializer.data)

# Delete a student
@api_view(['DELETE'])
def delete_student(request, student_id):
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

    student.delete()
    return Response({"message": "Student deleted successfully"}, status=204)

# Update student's fields
@api_view(['PATCH'])
def partial_update_student(request, student_id):
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
    Returns full class object including students.
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
    email = request.data.get("student_email", "").lower().strip()
    if not email:
        return Response({"error": "Email is required"}, status=400)

    try:
        student = Student.objects.get(student_email__iexact=email)
        serializer = StudentSerializer(student)
        return Response(serializer.data)
    except Student.DoesNotExist:
        return Response({}, status=200)  # Not found, return empty response (not an error)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def upload_csv_to_class(request):
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
    duplicates = []

    for row in reader:
        email = row.get("student_email", "").strip().lower()
        if not email:
            continue

        # Check if student exists
        student, created = Student.objects.get_or_create(student_email=email, defaults={
            "first_name": row.get("first_name", ""),
            "last_name": row.get("last_name", ""),
            "year_level": row.get("year_level", ""),
            "disability_info": row.get("disability_info", ""),
        })

        # Check if already in class
        if class_obj.students.filter(id=student.id).exists():
            duplicates.append(email)
            continue

        class_obj.students.add(student)
        added_count += 1

    return Response({
        "added": added_count,
        "duplicates": duplicates,
    }, status=200)