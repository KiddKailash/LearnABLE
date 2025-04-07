from django.urls import path
from .views import create_class, get_all_classes

urlpatterns = [
    path('classes/create/', create_class, name='create_class'),
    path('classes/', get_all_classes, name="get_all_classes"),
]
