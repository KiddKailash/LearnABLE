"""
views.py

This module defines key views for the LearnABLE backend.

Functions:
    - ask_openai: Accepts user input via POST and returns an OpenAI-generated response.
    - api_view: Returns a simple welcome message confirming API availability.
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.conf import settings
import openai

# Initialize OpenAI client using API key from Django settings
client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)


@csrf_exempt
def ask_openai(request):
    """
    View to interact with OpenAI's Chat API using user-provided messages.

    Method: POST
    Payload:
        {
            "message": "Your message to the AI"
        }

    Returns:
        JsonResponse: AI-generated response or error message.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_message = data.get('message', '')

            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": user_message}
                ]
            )

            answer = response.choices[0].message.content
            return JsonResponse({'response': answer})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)


def api_view(request):
    """
    A simple API health check endpoint.

    Method: GET

    Returns:
        JsonResponse: Welcome message.
    """
    data = {"message": "Welcome to the LearnABLE. The new innovative learning platform!"}
    return JsonResponse(data)
