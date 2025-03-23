from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Teacher
from django.contrib.auth.hashers import make_password

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
