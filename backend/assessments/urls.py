from django.urls import path
from . import views  # Ensure this import is correct

urlpatterns = [
    path('class/<int:class_id>/', views.get_assessments_by_class, name='get_assessments_by_class'),
]
