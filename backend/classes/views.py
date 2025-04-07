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
@permission_classes([AllowAny]) #testing only remove in prod
@permission_classes([IsAuthenticated])
def create_class(request):
    """
    Creates a class and automatically assigns it to the logged-in teacher.
    """
    data = request.data.copy()  # Make a mutable copy
    data['teacher'] = request.user.id  # Set teacher to the logged-in user

    serializer = ClassSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response({
    "message": "Class created successfully!",
    "class_id": serializer.data["id"],
    "class_data": serializer.data
}, status=status.HTTP_201_CREATED)
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

@csrf_exempt
@api_view(['POST', 'GET']) 
@parser_classes([MultiPartParser])
@authentication_classes([])
@permission_classes([AllowAny]) #allows testing remove in prod
def upload_students_csv(request):
    """
    Upload a CSV file containing student details and create Student records.
    Links them to an existing class via class_id.

    The CSV is expected to have columns such as:
      - first_name
      - last_name
      - year_level
      - student_email
      - guardian_email
      - guardian_first_name (optional)
      - guardian_last_name (optional)
      - disability_info (optional; will typically be blank)

    Returns:
        Response: Success message and student IDs, or error message.
    """
    if request.method == 'GET':
        html = """
        <html>
        <body>
            <h2>Upload Student CSV</h2>
            <form method="post" enctype="multipart/form-data">
                <input type="file" name="file" required />
                <input type="text" name="class_id" placeholder="Enter class ID" required />
                <button type="submit">Upload</button>
            </form>
        </body>
        </html>
        """
        return HttpResponse(html)

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
        student_ids = []

        for row in reader:
            student = Student.objects.create(
                first_name=row.get("first_name", ""),
                last_name=row.get("last_name", ""),
                year_level=row.get("year_level", None),
                student_email=row.get("student_email", ""),
                disability_info=row.get("disability_info", ""),
                guardian_email=row.get("guardian_email", ""),
                guardian_first_name=row.get("guardian_first_name", "missing"),
                guardian_last_name=row.get("guardian_last_name", "missing")
            )
            class_obj.students.add(student)  # Associate student with class
            student_ids.append(student.id)

        return Response({
            "message": "Students created and linked to class successfully",
            "class_id": class_id,
            "student_ids": student_ids
        }, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
