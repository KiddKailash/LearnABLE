import csv
import io
from rest_framework.decorators import api_view, parser_classes, authentication_classes
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import permission_classes
from django.utils.decorators import method_decorator
from rest_framework import status
from .models import Classes
from students.models import Student
from teachers.models import Teacher
from .serializers import ClassSerializer


# Create class object
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_class(request):
    """
    Creates a class and automatically assigns it to the logged-in teacher.
    """
    try:
        # Get the teacher instance associated with the authenticated user
        teacher = Teacher.objects.get(user=request.user)
        
        # Make a mutable copy of the request data
        data = request.data.copy()
        
        # Assign the teacher's ID, not the user's ID
        data['teacher'] = teacher.id
        
        serializer = ClassSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Class created successfully!",
                "class_id": serializer.data["id"],
                "class_data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Teacher.DoesNotExist:
        return Response(
            {"error": "No teacher profile found for this user"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_classes(request):
    """
    Retrieve a list of classes for the authenticated teacher only.
    """
    try:
        # Get the teacher linked to the current user
        teacher = Teacher.objects.get(user=request.user)
        
        # Filter only their classes
        classes = Classes.objects.filter(teacher=teacher)
        serializer = ClassSerializer(classes, many=True)
        return Response(serializer.data)
        
    except Teacher.DoesNotExist:
        return Response(
            {"error": "No teacher profile found for this user"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_student_to_class(request, class_id):
    student_id = request.data.get("student_id")
    if not student_id:
        return Response({"error": "student_id is required"}, status=400)

    try:
        cls = Classes.objects.get(id=class_id)
        student = Student.objects.get(id=student_id)
        cls.students.add(student)
        return Response({"message": "Student added to class"})
    except Classes.DoesNotExist:
        return Response({"error": "Class not found"}, status=404)
    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=404)

@api_view(['POST', 'GET']) 
@parser_classes([MultiPartParser])
@permission_classes([IsAuthenticated])
def upload_students_csv(request):
    if request.method == 'GET':
        return HttpResponse(
            "<h2>Upload Student CSV</h2>"
            "<form method='post' enctype='multipart/form-data'>"
            "<input type='file' name='file' required />"
            "<input type='text' name='class_id' placeholder='Enter class ID' required />"
            "<button type='submit'>Upload</button></form></body></html>"
        )

    class_id = request.POST.get("class_id")
    if not class_id:
        return Response({"error": "Missing class_id in request"}, status=400)

    try:
        class_obj = Classes.objects.get(id=class_id)
    except Classes.DoesNotExist:
        return Response({"error": "Class not found"}, status=404)

    csv_file = request.FILES.get("file")
    if not csv_file:
        return Response({"error": "CSV file is required"}, status=400)

    try:
        decoded_file = csv_file.read().decode("utf-8")
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)

        added_to_class = []
        already_in_class = []

        for row in reader:
            email = row.get("student_email", "").strip().lower()
            student, created = Student.objects.get_or_create(
                student_email=email,
                defaults={
                    "first_name": row.get("first_name", ""),
                    "last_name": row.get("last_name", ""),
                    "year_level": row.get("year_level", None),
                    "disability_info": row.get("disability_info", "")
                }
            )

            if not class_obj.students.filter(id=student.id).exists():
                class_obj.students.add(student)
                added_to_class.append(email)
            else:
                already_in_class.append(email)

        return Response({
            "message": "Upload completed",
            "added_to_class": added_to_class,
            "already_in_class": already_in_class
        }, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=500)



@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def class_detail(request, class_id):
    try:
        cls = Classes.objects.get(id=class_id)
    except Classes.DoesNotExist:
        return Response({"error": "Class not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "PUT":
        serializer = ClassSerializer(cls, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        cls.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
