from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from learningmaterial.views import LearningMaterialsViewSet

learning_materials_list = LearningMaterialsViewSet.as_view({'get': 'list', 'post': 'create'})
learning_materials_detail = LearningMaterialsViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})

urlpatterns = [
    path('api/learning-materials/', learning_materials_list, name='learning-materials-list'),
    path('api/learning-materials/<int:pk>/', learning_materials_detail, name='learning-materials-detail'),
]

# Serve media files in development mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
