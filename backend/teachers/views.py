from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Teacher
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import TeacherSerializer

@csrf_exempt
def register_teacher(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            print("Received data:", data)  # Debugging line
            
            serializer = TeacherSerializer(data=data)
            
            if serializer.is_valid():
                serializer.save()
                return JsonResponse({"message": "Teacher registered successfully!", "teacher_id": serializer.data["id"]}, status=201)
            else:
                print("Serializer errors:", serializer.errors)  # Debugging line
                return JsonResponse({"error": serializer.errors}, status=400)

        except Exception as e:
            print("Exception:", str(e))  # Debugging line
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)


@csrf_exempt
def login_teacher(request):
    """
    Authenticates a teacher using email and password, and returns JWT tokens on success.

    Args:
        request (HttpRequest): A POST request with JSON data containing 'email' and 'password'.

    Returns:
        JsonResponse: A response containing access and refresh tokens along with teacher info (200),
                      or an error message (401 or 500).
    """
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            try:
                teacher = Teacher.objects.get(email=email)
            except Teacher.DoesNotExist:
                return JsonResponse({"message": "Invalid email or password"}, status=401)

            if not check_password(password, teacher.password):
                return JsonResponse({"message": "Invalid email or password"}, status=401)

            # Generate tokens
            refresh = RefreshToken.for_user(teacher)
            return JsonResponse({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "first_name": teacher.first_name,
                "last_name": teacher.last_name,
                "email": teacher.email
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)

