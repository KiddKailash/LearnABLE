"""
URL routing for UnitPlan API endpoints using Django REST Framework's DefaultRouter.
Registers the UnitPlanViewSet to automatically create RESTful routes.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'unitplans', views.UnitPlanViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 