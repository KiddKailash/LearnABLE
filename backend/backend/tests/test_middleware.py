from django.test import TestCase, RequestFactory
from django.http import Http404
from django.core.exceptions import PermissionDenied, ValidationError
from rest_framework.exceptions import APIException
from rest_framework import status
from ..middleware import ErrorHandlingMiddleware

class ErrorHandlingMiddlewareTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = ErrorHandlingMiddleware(lambda r: None)

    def test_404_handling(self):
        request = self.factory.get('/nonexistent/')
        response = self.middleware.process_exception(request, Http404())
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()['type'], 'NOT_FOUND')
        self.assertEqual(response.json()['status'], 'error')
        self.assertIn('message', response.json())

    def test_403_handling(self):
        request = self.factory.get('/protected/')
        response = self.middleware.process_exception(request, PermissionDenied())
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.json()['type'], 'PERMISSION_DENIED')
        self.assertEqual(response.json()['status'], 'error')
        self.assertIn('message', response.json())

    def test_validation_error_handling(self):
        request = self.factory.post('/api/test/', {})
        error = ValidationError({'field': ['This field is required']})
        response = self.middleware.process_exception(request, error)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()['type'], 'VALIDATION_ERROR')
        self.assertEqual(response.json()['status'], 'error')
        self.assertIn('errors', response.json())
        self.assertIn('field', response.json()['errors'])

    def test_api_exception_handling(self):
        request = self.factory.get('/api/test/')
        error = APIException('API Error')
        error.status_code = status.HTTP_400_BAD_REQUEST
        response = self.middleware.process_exception(request, error)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()['type'], 'API_ERROR')
        self.assertEqual(response.json()['status'], 'error')
        self.assertIn('message', response.json())

    def test_unexpected_error_handling(self):
        request = self.factory.get('/api/test/')
        error = Exception('Unexpected error')
        response = self.middleware.process_exception(request, error)
        
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.json()['type'], 'SERVER_ERROR')
        self.assertEqual(response.json()['status'], 'error')
        self.assertIn('message', response.json())

    def test_error_details_in_debug_mode(self):
        with self.settings(DEBUG=True):
            request = self.factory.get('/api/test/')
            error = Exception('Test error')
            response = self.middleware.process_exception(request, error)
            
            self.assertIn('details', response.json())
            self.assertEqual(response.json()['details'], 'Test error')

    def test_error_details_in_production(self):
        with self.settings(DEBUG=False):
            request = self.factory.get('/api/test/')
            error = Exception('Test error')
            response = self.middleware.process_exception(request, error)
            
            self.assertIn('details', response.json())
            self.assertIsNone(response.json()['details']) 