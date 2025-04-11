from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.conf import settings
import openai

client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

@csrf_exempt
def ask_openai(request):
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
    data = {"message": "Hello from the backend!"}
    return JsonResponse(data)
