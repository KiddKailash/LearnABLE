from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Teacher
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken

@csrf_exempt  # Disable CSRF for testing (only for development!)
def register_teacher(request):
    if request.method == "POST":
        try:
            # Parse the JSON data from request
            data = json.loads(request.body)
            name = data.get("name", "")
            email = data.get("email", "")
            password = data.get("password", "")

            # Check if email already exists
            if Teacher.objects.filter(email=email).exists():
                return JsonResponse({"message": "Email already registered!"}, status=400)

            # Hash the password before saving (important for security)
            hashed_password = make_password(password)

            # Create a new teacher record
            teacher = Teacher.objects.create(name=name, email=email, password=hashed_password)
            return JsonResponse({"message": "Teacher registered successfully!", "teacher_id": teacher.id}, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)

@csrf_exempt
def login_teacher(request):
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
                "name": teacher.name,
                "email": teacher.email
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)

