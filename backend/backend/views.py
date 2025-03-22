from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse

def api_view(request):
    data = {"message": "Hello from the backend!"}
    return JsonResponse(data)
