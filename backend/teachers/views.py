from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import TeacherSerializer
from .models import Teacher
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
import pyotp
import qrcode
import base64
from io import BytesIO
import datetime

@csrf_exempt
def register_teacher(request):
    if request.method == "POST":
        try:
            # Parse the JSON body for standard requests
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                # For form data
                data = request.POST.dict()
            
            print("Received data:", data)  # Debug

            # Extract user fields
            first_name = data.get('first_name', '')
            last_name = data.get('last_name', '')
            email = data.get('email', '')
            password = data.get('password', '')
            
            # Validate required fields
            if not all([first_name, last_name, email, password]):
                missing_fields = []
                if not first_name: missing_fields.append('first_name')
                if not last_name: missing_fields.append('last_name')
                if not email: missing_fields.append('email')
                if not password: missing_fields.append('password')
                return JsonResponse({
                    "error": f"Missing required fields: {', '.join(missing_fields)}"
                }, status=400)
            
            # Check if user with this email already exists
            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    "error": "A user with this email already exists"
                }, status=400)
            
            # Create the user
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Create the teacher profile
            teacher = Teacher.objects.create(user=user)
            
            return JsonResponse({
                "message": "Teacher registered successfully!",
                "teacher_id": teacher.id
            }, status=201)

        except Exception as e:
            print("Exception:", str(e))
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)


@csrf_exempt
def login_teacher(request):
    if request.method == "POST":
        try:
            # Parse the request body based on content type
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.POST.dict()
                
            email = data.get("email")
            password = data.get("password")
            
            # Validate required fields
            if not email or not password:
                return JsonResponse({
                    "message": "Email and password are required"
                }, status=400)

            # Try to get the user by email first
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return JsonResponse({
                    "message": "Invalid email or password"
                }, status=401)
            
            # Authenticate the user
            user = authenticate(username=email, password=password)
            if user is None:
                return JsonResponse({
                    "message": "Invalid email or password"
                }, status=401)

            # Get Teacher profile
            try:
                teacher = user.teacher
            except Teacher.DoesNotExist:
                return JsonResponse({
                    "message": "Teacher profile not found"
                }, status=404)
                
            # Check if 2FA is enabled
            if teacher.two_factor_enabled:
                # Return partial response requiring 2FA verification
                return JsonResponse({
                    "two_factor_required": True,
                    "user_id": user.id,
                    "email": user.email
                })

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Return successful response with tokens and user info
            return JsonResponse({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "two_factor_enabled": teacher.two_factor_enabled,
                "theme_preference": teacher.theme_preference,
                "last_password_change": teacher.last_password_change.isoformat() if teacher.last_password_change else None
            })

        except json.JSONDecodeError:
            return JsonResponse({
                "message": "Invalid JSON format in request body"
            }, status=400)
        except Exception as e:
            return JsonResponse({
                "message": f"Server error: {str(e)}"
            }, status=500)

    return JsonResponse({
        "message": "Only POST method is allowed"
    }, status=405)


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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    try:
        teacher = request.user.teacher
        serializer = TeacherSerializer(teacher)
        return Response(serializer.data)
    except ObjectDoesNotExist:
        return Response({"error": "Teacher profile not found"}, status=404)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    try:
        teacher = request.user.teacher
        serializer = TeacherSerializer(teacher, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    except ObjectDoesNotExist:
        return Response({"error": "Teacher profile not found"}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    try:
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not user.check_password(current_password):
            return Response({"error": "Current password is incorrect"}, status=400)
        
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password changed successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def setup_2fa(request):
    try:
        teacher = request.user.teacher
        if teacher.two_factor_enabled:
            return Response({"error": "2FA is already enabled"}, status=400)
        
        secret = pyotp.random_base32()
        teacher.two_factor_secret = secret
        teacher.save()
        
        # Generate QR code
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(request.user.email, issuer_name="LearnABLE")
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        qr_code = base64.b64encode(buffered.getvalue()).decode()
        
        return Response({
            "secret": secret,
            "qr_code": qr_code
        })
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_2fa(request):
    try:
        teacher = request.user.teacher
        token = request.data.get('token')
        
        if not teacher.two_factor_secret:
            return Response({"error": "2FA not set up"}, status=400)
        
        totp = pyotp.TOTP(teacher.two_factor_secret)
        if totp.verify(token):
            teacher.two_factor_enabled = True
            teacher.save()
            return Response({"message": "2FA enabled successfully"})
        return Response({"error": "Invalid token"}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disable_2fa(request):
    try:
        teacher = request.user.teacher
        token = request.data.get('token')
        
        if not teacher.two_factor_enabled:
            return Response({"error": "2FA is not enabled"}, status=400)
        
        totp = pyotp.TOTP(teacher.two_factor_secret)
        if totp.verify(token):
            teacher.two_factor_enabled = False
            teacher.two_factor_secret = ""
            teacher.save()
            return Response({"message": "2FA disabled successfully"})
        return Response({"error": "Invalid token"}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_notification_preferences(request):
    try:
        teacher = request.user.teacher
        notification_preferences = request.data.get('notification_preferences', {})
        teacher.notification_preferences = notification_preferences
        teacher.save()
        return Response({"message": "Notification preferences updated successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_theme(request):
    try:
        teacher = request.user.teacher
        theme = request.data.get('theme')
        if theme not in ['light', 'dark', 'system']:
            return Response({"error": "Invalid theme preference"}, status=400)
        
        teacher.theme_preference = theme
        teacher.save()
        return Response({"message": "Theme preference updated successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_active_sessions(request):
    try:
        # In a real app, you'd query a sessions table
        # For demo, return mock data including the current session
        current_session = {
            'id': '1',
            'device_name': 'Current Device',
            'browser': f'{request.META.get("HTTP_USER_AGENT", "Unknown Browser")}',
            'ip_address': request.META.get('REMOTE_ADDR', '127.0.0.1'),
            'location': 'Current Location',
            'last_active': datetime.datetime.now().isoformat(),
            'is_current': True
        }
        
        # Add some mock sessions
        other_sessions = [
            {
                'id': '2',
                'device_name': 'iPhone 13',
                'browser': 'Mobile Safari',
                'ip_address': '192.168.1.101',
                'location': 'Melbourne, Australia',
                'last_active': (datetime.datetime.now() - datetime.timedelta(days=1)).isoformat(),
                'is_current': False
            },
            {
                'id': '3',
                'device_name': 'MacBook Pro',
                'browser': 'Chrome 98.0.4758.102',
                'ip_address': '192.168.1.102',
                'location': 'Sydney, Australia',
                'last_active': (datetime.datetime.now() - datetime.timedelta(hours=2)).isoformat(),
                'is_current': False
            }
        ]
        
        sessions = [current_session] + other_sessions
        return Response(sessions)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def terminate_session(request):
    try:
        session_id = request.data.get('session_id')
        if not session_id:
            return Response({"error": "Session ID is required"}, status=400)
        
        # In a real app, you'd invalidate the session in the database
        # For demo, just return success
        return Response({"message": "Session terminated successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def terminate_all_sessions(request):
    try:
        # In a real app, you'd invalidate all sessions except the current one
        # For demo, just return success
        return Response({"message": "All other sessions terminated successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_account_data(request):
    try:
        user = request.user
        teacher = user.teacher
        
        # Get export options
        export_options = request.data or {}
        export_all = not bool(export_options)  # If no options specified, export everything
        
        # Basic account data
        data = {
            "account": {
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "date_joined": user.date_joined.isoformat(),
                "profile": {
                    "school": teacher.school,
                    "subject_specialty": teacher.subject_specialty,
                    "phone_number": teacher.phone_number,
                    "bio": teacher.bio,
                    "preferred_language": teacher.preferred_language,
                    "theme_preference": teacher.theme_preference,
                    "notification_preferences": teacher.notification_preferences
                }
            }
        }
        
        # Add additional data based on export options
        if export_all or export_options.get('classes'):
            # In a real app, query the database for classes
            data["classes"] = []  # Add class data here
        
        if export_all or export_options.get('students'):
            # In a real app, query the database for students
            data["students"] = []  # Add student data here
        
        if export_all or export_options.get('assessments'):
            # In a real app, query the database for assessments
            data["assessments"] = []  # Add assessment data here
        
        if export_all or export_options.get('reports'):
            # In a real app, query the database for NCCD reports
            data["reports"] = []  # Add report data here
        
        return Response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    try:
        user = request.user
        # Verify password for security
        password = request.data.get('password')
        if not user.check_password(password):
            return Response({"error": "Password is incorrect"}, status=400)
        
        # Delete the user (will cascade to Teacher object via OneToOneField)
        user.delete()
        return Response({"message": "Account deleted successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def connect_google_account(request):
    try:
        teacher = request.user.teacher
        google_token = request.data.get('google_token')
        
        # Here you would implement actual Google OAuth verification
        # For now, just simulate success
        
        # Store a flag or ID for connected Google account
        if not hasattr(teacher, 'notification_preferences') or not teacher.notification_preferences:
            teacher.notification_preferences = {}
        
        teacher.notification_preferences['google_connected'] = True
        teacher.save()
        
        return Response({"message": "Google account connected successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disconnect_google_account(request):
    try:
        teacher = request.user.teacher
        
        # Remove the Google connection
        if hasattr(teacher, 'notification_preferences') and teacher.notification_preferences and 'google_connected' in teacher.notification_preferences:
            teacher.notification_preferences.pop('google_connected')
            teacher.save()
        
        return Response({"message": "Google account disconnected successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@csrf_exempt
def verify_login_2fa(request):
    if request.method == "POST":
        try:
            # Parse the request body based on content type
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.POST.dict()
                
            email = data.get("email")
            code = data.get("code")
            
            # Validate required fields
            if not email or not code:
                return JsonResponse({
                    "message": "Email and code are required"
                }, status=400)

            # Try to get the user by email
            try:
                user = User.objects.get(email=email)
                teacher = user.teacher
            except (User.DoesNotExist, Teacher.DoesNotExist):
                return JsonResponse({
                    "message": "Invalid email or code"
                }, status=401)
            
            # Verify 2FA code
            if not teacher.two_factor_enabled or not teacher.two_factor_secret:
                return JsonResponse({
                    "message": "Two-factor authentication is not enabled for this account"
                }, status=400)
                
            totp = pyotp.TOTP(teacher.two_factor_secret)
            if not totp.verify(code):
                return JsonResponse({
                    "message": "Invalid authentication code"
                }, status=401)
                
            # Authentication successful, generate tokens
            refresh = RefreshToken.for_user(user)
            
            # Return full login response
            return JsonResponse({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "id": user.id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "two_factor_enabled": teacher.two_factor_enabled,
                "theme_preference": teacher.theme_preference,
                "last_password_change": teacher.last_password_change.isoformat() if teacher.last_password_change else None
            })

        except json.JSONDecodeError:
            return JsonResponse({
                "message": "Invalid JSON format in request body"
            }, status=400)
        except Exception as e:
            return JsonResponse({
                "message": f"Server error: {str(e)}"
            }, status=500)

    return JsonResponse({
        "message": "Only POST method is allowed"
    }, status=405)
