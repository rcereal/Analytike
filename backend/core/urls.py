from django.urls import path
from .views import (
    csrf, verificar_sessao, get_datasets, visualizar_dataset,
    Excluir_dataset_view, analise_dataset, gerar_relatorio_pdf,
    DatasetUploadView, DatasetListView, DatasetListAPI
)
from . import authentication_views

urlpatterns = [
    path("csrf/", csrf, name="csrf"),
    path("login/", authentication_views.login_view, name="login"),
    path("logout/", authentication_views.logout_view, name="logout"),
    path("verificar-sessao/", verificar_sessao, name="verificar_sessao"),
    path("upload-csv/", DatasetUploadView.as_view(), name="upload-csv"),
    path("datasets-list/", DatasetListView.as_view(), name="dataset_list"),
    path("datasets/", get_datasets, name="datasets"),
    path("visualizar-dataset/<int:dataset_id>/", visualizar_dataset, name="visualizar_dataset"),
    path("datasets/excluir/<int:dataset_id>/", Excluir_dataset_view.as_view(), name="excluir_dataset"),
    path("datasets-paginados/", DatasetListAPI.as_view(), name="datasets-paginados"),
    path("analise/<int:dataset_id>/", analise_dataset, name="analise_dataset"),
    path("relatorios/gerar-pdf/<int:dataset_id>/", gerar_relatorio_pdf, name="gerar_relatorio_pdf"),
]
