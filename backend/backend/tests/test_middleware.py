"""
Unit tests for the custom ErrorHandlingMiddleware.

This module tests that the middleware correctly captures and transforms different 
types of exceptions (e.g., Http404, PermissionDenied, ValidationError, APIException, 
and generic Exception) into standardized JSON error responses for a Django REST 
Framework API. It also checks behavior differences between debug and production modes.
"""

from django.test import TestCase, RequestFactory
from django.http import Http404
from django.core.exceptions import PermissionDenied, ValidationError
from rest_framework.exceptions import APIException
from rest_framework import status
from ..middleware import ErrorHandlingMiddleware

class ErrorHandlingMiddlewareTest(TestCase):
    """
    Test suite for the custom ErrorHandlingMiddleware.

    This test class verifies that various exceptions raised during request handling
    are correctly intercepted and formatted into standardized JSON responses by the
    middleware. The tests cover common exceptions such as Http404, PermissionDenied,
    ValidationError, APIException, and generic exceptions, both in debug and 
    production settings.
    """
    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = ErrorHandlingMiddleware(lambda r: None)

    def test_404_handling(self):
        """
        Test that Http404 exceptions return a 404 NOT FOUND response
        with a standardized error JSON structure.
        """
        request = self.factory.get('/nonexistent/')
        response = self.middleware.process_exception(request, Http404())
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()['type'], 'NOT_FOUND')
        self.assertEqual(response.json()['status'], 'error')
        self.assertIn('message', response.json())

    def test_403_handling(self):
        """
        Test that PermissionDenied exceptions return a 403 FORBIDDEN response
        with a standardized error JSON structure.
        """
        request = self.factory.get('/protected/')
        response = self.middleware.process_exception(request, PermissionDenied())
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.json()['type'], 'PERMISSION_DENIED')
        self.assertEqual(response.json()['status'], 'error')
        self.assertIn('message', response.json())

    def test_validation_error_handling(self):
        """
        Test that ValidationError exceptions return a 400 BAD REQUEST response
        with a standardized error JSON structure that includes field-specific errors.
        """
        request = self.factory.post('/api/test/', {})
        error = ValidationError({'field': ['This field is required']})
        response = self.middleware.process_exception(request, error)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()['type'], 'VALIDATION_ERROR')
        self.assertEqual(response.json()['status'], 'error')
        self.assertIn('errors', response.json())
        self.assertIn('field', response.json()['errors'])

    def test_api_exception_handling(self):
        """
        Test that DRF APIException returns the specified HTTP error code
        and a standardized error response with the 'API_ERROR' type.
        """
        request = self.factory.get('/api/test/')
        error = APIException('API Error')
        error.status_code = status.HTTP_400_BAD_REQUEST
        response = self.middleware.process_exception(request, error)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()['type'], 'API_ERROR')
        self.assertEqual(response.json()['status'], 'error')
        self.assertIn('message', response.json())

    def test_unexpected_error_handling(self):
        """
        Test that unhandled exceptions return a 500 INTERNAL SERVER ERROR
        response with a standardized error JSON structure.
        """
        request = self.factory.get('/api/test/')
        error = Exception('Unexpected error')
        response = self.middleware.process_exception(request, error)
        
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.json()['type'], 'SERVER_ERROR')
        self.assertEqual(response.json()['status'], 'error')
        self.assertIn('message', response.json())

    def test_error_details_in_debug_mode(self):
        """
        Test that error details are included in the response when DEBUG is True.
        """
        with self.settings(DEBUG=True):
            request = self.factory.get('/api/test/')
            error = Exception('Test error')
            response = self.middleware.process_exception(request, error)
            
            self.assertIn('details', response.json())
            self.assertEqual(response.json()['details'], 'Test error')

    def test_error_details_in_production(self):
        """
        Test that error details are hidden (set to None) when DEBUG is False.
        """
        with self.settings(DEBUG=False):
            request = self.factory.get('/api/test/')
            error = Exception('Test error')
            response = self.middleware.process_exception(request, error)
            
            self.assertIn('details', response.json())
            self.assertIsNone(response.json()['details']) 