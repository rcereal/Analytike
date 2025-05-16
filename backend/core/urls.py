from django.urls import path
from .views import *

urlpatterns = [
    path('upload-csv/', DatasetUploadView.as_view(), name='upload-csv'),
    path('datasets-list/', DatasetListView.as_view(), name='dataset_list'),
    path('datasets/', get_datasets, name='datasets'),
    path('visualizar-dataset/<int:dataset_id>/', visualizar_dataset, name='visualizar_dataset'),
    path('datasets/excluir/<int:dataset_id>/', excluir_dataset, name='excluir_dataset'),
    path('datasets-paginados/', DatasetListAPI.as_view(), name='datasets-paginados'),
    path('analise/<int:dataset_id>/', analise_dataset, name='analise_dataset'),
    path('relatorios/gerar-pdf/<int:dataset_id>/', gerar_relatorio_pdf, name='gerar_relatorio_pdf'),
]