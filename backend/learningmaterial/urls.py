from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from learningmaterial.views import LearningMaterialsViewSet

learning_materials_list = LearningMaterialsViewSet.as_view({'get': 'list', 'post': 'create'})
learning_materials_detail = LearningMaterialsViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})
learning_materials_create = LearningMaterialsViewSet.as_view({'post': 'create'})
learning_materials_by_class = LearningMaterialsViewSet.as_view({'get': 'by_class'})

learning_materials_process = LearningMaterialsViewSet.as_view({'post': 'process'})
learning_materials_adapt = LearningMaterialsViewSet.as_view({'post': 'adapt'})

urlpatterns = [
    path('', learning_materials_list, name='learning-materials-list'),
    path('<int:pk>/', learning_materials_detail, name='learning-materials-detail'),
    path('create/', learning_materials_create, name='learning-materials-create'),
    path('class/<int:class_id>/', learning_materials_by_class, name='learning-materials-by-class'),
    path('<int:pk>/process/', learning_materials_process, name='learning-materials-process'),
    path('<int:pk>/adapt/', learning_materials_adapt, name='learning-materials-adapt'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
