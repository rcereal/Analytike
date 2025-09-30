from django.urls import path
from .views import (
    get_datasets, visualizar_dataset,
    Excluir_dataset_view, analise_dataset, gerar_relatorio_pdf,
    DatasetUploadView, DatasetListView, DatasetListAPI
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path("me/", me, name="me"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("upload-csv/", DatasetUploadView.as_view(), name="upload-csv"),
    path("datasets-list/", DatasetListView.as_view(), name="dataset_list"),
    path("datasets/", get_datasets, name="datasets"),
    path("visualizar-dataset/<int:dataset_id>/", visualizar_dataset, name="visualizar_dataset"),
    path("datasets/excluir/<int:dataset_id>/", Excluir_dataset_view.as_view(), name="excluir_dataset"),
    path("datasets-paginados/", DatasetListAPI.as_view(), name="datasets-paginados"),
    path("analise/<int:dataset_id>/", analise_dataset, name="analise_dataset"),
    path("relatorios/gerar-pdf/<int:dataset_id>/", gerar_relatorio_pdf, name="gerar_relatorio_pdf"),
]
