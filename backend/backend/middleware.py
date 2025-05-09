import json
import logging
from django.http import JsonResponse
from django.core.exceptions import ValidationError, PermissionDenied
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import APIException

logger = logging.getLogger(__name__)

class ErrorHandlingMiddleware:
    """
    Middleware to handle exceptions and return consistent error responses
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        """
        Process the exception and return a consistent error response
        """
        if isinstance(exception, Http404):
            return self._handle_404(exception)
        elif isinstance(exception, PermissionDenied):
            return self._handle_403(exception)
        elif isinstance(exception, ValidationError):
            return self._handle_validation_error(exception)
        elif isinstance(exception, APIException):
            return self._handle_api_exception(exception)
        else:
            return self._handle_unexpected_error(exception)

    def _handle_404(self, exception):
        return JsonResponse({
            'status': 'error',
            'type': 'NOT_FOUND',
            'message': 'The requested resource was not found.',
            'details': str(exception)
        }, status=status.HTTP_404_NOT_FOUND)

    def _handle_403(self, exception):
        return JsonResponse({
            'status': 'error',
            'type': 'PERMISSION_DENIED',
            'message': 'You do not have permission to perform this action.',
            'details': str(exception)
        }, status=status.HTTP_403_FORBIDDEN)

    def _handle_validation_error(self, exception):
        return JsonResponse({
            'status': 'error',
            'type': 'VALIDATION_ERROR',
            'message': 'Invalid input provided.',
            'errors': exception.message_dict if hasattr(exception, 'message_dict') else str(exception)
        }, status=status.HTTP_400_BAD_REQUEST)

    def _handle_api_exception(self, exception):
        return JsonResponse({
            'status': 'error',
            'type': 'API_ERROR',
            'message': str(exception),
            'details': exception.detail if hasattr(exception, 'detail') else None
        }, status=exception.status_code)

    def _handle_unexpected_error(self, exception):
        # Log the unexpected error
        logger.error(f"Unexpected error: {str(exception)}", exc_info=True)

        return JsonResponse({
            'status': 'error',
            'type': 'SERVER_ERROR',
            'message': 'An unexpected error occurred. Please try again later.',
            'details': str(exception) if settings.DEBUG else None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 