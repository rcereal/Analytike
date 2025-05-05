from django.urls import path
from .views import *

urlpatterns = [
    path('teste/', api_teste),
    path('upload-csv/', DatasetUploadView.as_view(), name='upload-csv'),
    path('datasets-list/', DatasetListView.as_view(), name='dataset_list'),
    path('datasets/', get_datasets, name='datasets'),
    path('visualizar-dataset/<int:dataset_id>/', visualizar_dataset, name='visualizar_dataset'),
]