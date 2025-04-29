from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import TeacherSerializer
from .models import Teacher
from django.contrib.auth.models import User

@csrf_exempt
def register_teacher(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            print("Received data:", data)  # Debug

            serializer = TeacherSerializer(data=data)
            if serializer.is_valid():
                teacher = serializer.save()
                return JsonResponse({
                    "message": "Teacher registered successfully!",
                    "teacher_id": teacher.id
                }, status=201)
            else:
                print("Serializer errors:", serializer.errors)
                return JsonResponse({"error": serializer.errors}, status=400)

        except Exception as e:
            print("Exception:", str(e))
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)


@csrf_exempt
def login_teacher(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            user = authenticate(username=email, password=password)
            if user is None:
                return JsonResponse({"message": "Invalid email or password"}, status=401)

            # Get Teacher profile
            try:
                teacher = user.teacher
            except Teacher.DoesNotExist:
                return JsonResponse({"message": "Teacher profile not found"}, status=404)

            refresh = RefreshToken.for_user(user)
            return JsonResponse({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)


@api_view(["POST"])
def upload_profile_pic(request):
    email = request.data.get("email")
    file = request.FILES.get("profile_pic")

    if not email or not file:
        return Response({"error": "Email and profile picture are required."}, status=400)

    try:
        user = User.objects.get(email=email)
        teacher = user.teacher
        teacher.profile_pic = file
        teacher.save()
        return Response({
            "message": "Profile picture updated successfully!",
            "profile_pic": teacher.profile_pic.url
        })
    except (User.DoesNotExist, Teacher.DoesNotExist):
        return Response({"error": "Teacher not found."}, status=404)
