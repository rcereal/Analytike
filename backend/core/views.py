import pandas as pd
import openpyxl
import numpy as np
import django_filters
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import os
import base64
import gc

from io import BytesIO
from xhtml2pdf import pisa
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from django.template.loader import render_to_string
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser as DRFIsAdminUser
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, generics, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter
from .models import Dataset
from .serializers import DatasetSerializer
# from .permissions import IsAdminUser 

@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({"detail": "CSRF cookie set"})

@ensure_csrf_cookie
@require_GET
def verificar_sessao(request):
    autenticado = request.user.is_authenticated
    return JsonResponse({'autenticado': autenticado})

@api_view(['GET'])
def get_datasets(request):
    datasets = Dataset.objects.all()
    data = [{'id': d.id, 'nome': d.nome, 'criado_em': d.criado_em} for d in datasets]
    return Response(data)

# def visualizar_dataset(request, dataset_id):
#     try:
#         dataset = Dataset.objects.get(pk=dataset_id)
#         df = pd.read_csv(dataset.arquivo.path)

#         preview_df = df.head(100)

#         data = preview_df.to_dict(orient='records')
#         colunas = list(df.columns)

#         return JsonResponse({'colunas': colunas, 'data': data})
    
#     except Dataset.DoesNotExist:
#         return JsonResponse({'erro': 'Dataset não encontrado'}, status=404)
#     except pd.errors.ParserError:
#         return JsonResponse({'erro': 'Erro ao processar o CSV. Verifique o formato.'}, status=400)
#     except Exception as e:
#         return JsonResponse({'erro': f'Erro inesperado: {str(e)}'}, status=500)

def visualizar_dataset(request, dataset_id):
    try:
        dataset = Dataset.objects.get(pk=dataset_id)
        if dataset.arquivo.name.endswith('.csv'):
            df = pd.read_csv(dataset.arquivo.path)
        elif dataset.arquivo.name.endswith('.xlsx'):
            df = pd.read_excel(dataset.arquivo.path)
        else:
            return JsonResponse({'erro': 'Formato de arquivo não suportado.'}, status=400)

        preview_df = df.head(100)
        data = preview_df.to_dict(orient='records')
        colunas = list(df.columns)

        return JsonResponse({'colunas': colunas, 'data': data})

    except Dataset.DoesNotExist:
        return JsonResponse({'erro': 'Dataset não encontrado'}, status=404)
    except (pd.errors.ParserError, ValueError):
        return JsonResponse({'erro': 'Erro ao processar o arquivo. Verifique o formato.'}, status=400)
    except Exception as e:
        return JsonResponse({'erro': f'Erro inesperado: {str(e)}'}, status=500)


# @api_view(['DELETE'])
# def excluir_dataset(request, dataset_id):
#     try:
#         dataset = Dataset.objects.get(pk=dataset_id)

#         caminho_arquivo = dataset.arquivo.path
#         try:
#             import gc
#             gc.collect()  
#             os.remove(caminho_arquivo)
#         except PermissionError:
#             return Response(
#                 {"erro": "O arquivo está sendo usado por outro processo. Feche o arquivo e tente novamente."},
#                 status=status.HTTP_423_LOCKED
#             )

#         dataset.delete() 
#         return Response({"mensagem": "Dataset excluído com sucesso!"}, status=status.HTTP_204_NO_CONTENT)

#     except Dataset.DoesNotExist:
#         return Response({"erro": "Dataset não encontrado."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def analise_dataset(request, dataset_id):
    dataset = get_object_or_404(Dataset, pk=dataset_id)

    try:
        if dataset.arquivo.name.endswith('.csv'):
            df = pd.read_csv(dataset.arquivo.path)
        elif dataset.arquivo.name.endswith('.xlsx'):
            df = pd.read_excel(dataset.arquivo.path)
        else:
            return JsonResponse({'erro': 'Formato de arquivo não suportado.'}, status=400)

        def safe_to_numeric(col):
            try:
                return pd.to_numeric(col)
            except ValueError:
                return col

        df = df.apply(safe_to_numeric)
        total_linhas = len(df)
        colunas_numericas = df.select_dtypes(include=["number"]).columns.tolist()

        resultados_analises = {}

        for coluna in colunas_numericas:
            serie_numerica = df[coluna]
            primeiro_quartil = serie_numerica.quantile(0.25)
            terceiro_quartil = serie_numerica.quantile(0.75)
            intervalo_interquartil = terceiro_quartil - primeiro_quartil

            outliers = serie_numerica[
                (serie_numerica < (primeiro_quartil - 1.5 * intervalo_interquartil)) |
                (serie_numerica > (terceiro_quartil + 1.5 * intervalo_interquartil))
            ]

            resultados_analises[coluna] = {
                'media': round(serie_numerica.mean(), 2),
                'minimo': round(serie_numerica.min(), 2),
                'maximo': round(serie_numerica.max(), 2),
                'desvio_padrao': round(serie_numerica.std(), 2),
                'moda': serie_numerica.mode().tolist(),
                'valores_nulos': int(serie_numerica.isnull().sum()),
                'quantidade_de_outliers': int(outliers.count())
            }

        for coluna, analise in resultados_analises.items():
            for chave, valor in analise.items():
                if isinstance(valor, (np.int64, np.float64)):
                    analise[chave] = float(valor) if isinstance(valor, np.float64) else int(valor)

        return JsonResponse({
            'total_linhas': total_linhas,
            'colunas_numericas': colunas_numericas,
            'analises': resultados_analises
        })

    except Exception as erro:
        return JsonResponse({'erro': f'Erro inesperado: {str(erro)}'}, status=500)

def gerar_relatorio_pdf(request, dataset_id):
    dataset = get_object_or_404(Dataset, id=dataset_id)

    try:
        if dataset.arquivo.name.endswith('.csv'):
            df = pd.read_csv(dataset.arquivo)
        elif dataset.arquivo.name.endswith('.xlsx'):
            df = pd.read_excel(dataset.arquivo)
        else:
            return HttpResponse('Formato de arquivo não suportado.', status=400)

        colunas_numericas = df.select_dtypes(include=[np.number]).columns
        if not colunas_numericas.any():
            return HttpResponse(
                'Este dataset não contém colunas numéricas suficientes para gerar um relatorio.',
                status=400
            )

        analise = []
        for coluna in colunas_numericas:
            valores = df[coluna].dropna()
            if valores.empty:
                continue

            primeiro_quartil = valores.quantile(0.25)
            terceiro_quartil = valores.quantile(0.75)
            intervalo_interquartil = terceiro_quartil - primeiro_quartil
            outliers = ((valores < (primeiro_quartil - 1.5 * intervalo_interquartil)) |
                        (valores > (terceiro_quartil + 1.5 * intervalo_interquartil))).sum()

            analise.append({
                'nome': coluna,
                'media': round(valores.mean(), 2),
                'min': round(valores.min(), 2),
                'max': round(valores.max(), 2),
                'std': round(valores.std(), 2),
                'moda': round(valores.mode()[0], 2) if not valores.mode().empty else 'N/A',
                'nulos': df[coluna].isnull().sum(),
                'outliers': int(outliers)
            })

        imagens_graficos = []
        for coluna in colunas_numericas:
            plt.figure(figsize=(4, 3))
            sns.histplot(df[coluna].dropna(), kde=True, color='skyblue')
            plt.title(f'Distribuição: {coluna}')
            plt.tight_layout()

            buffer = BytesIO()
            plt.savefig(buffer, format='png')
            buffer.seek(0)
            image_png = buffer.getvalue()
            buffer.close()
            imagens_graficos.append(base64.b64encode(image_png).decode('utf-8'))
            plt.close()

        dados_csv = df.head(20).to_dict(orient='records')
        colunas_csv = list(df.columns)

        html = render_to_string('relatorio_pdf.html', {
            'nome_dataset': dataset.nome,
            'data_criacao': dataset.criado_em.strftime('%d/%m/%y'),
            'total_linhas': len(df),
            'analise': analise,
            'dados_csv': dados_csv,
            'colunas_csv': colunas_csv,
            'graficos_base64': imagens_graficos
        })

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="relatorio_{dataset.nome}.pdf"'

        pisa_status = pisa.CreatePDF(html, dest=response)
        if pisa_status.err:
            return HttpResponse('Erro ao gerar PDF', status=500)
        return response

    except Exception as erro:
        return HttpResponse(f'Erro inesperado: {str(erro)}', status=500)


class Excluir_dataset_view(APIView):
    permission_classes = [DRFIsAdminUser]

    def delete(self, request, dataset_id):
        try:
            dataset = Dataset.objects.get(pk=dataset_id)

            # if dataset.usuario != request.user:
            #     return Response(
            #         {'erro': 'Você não tem permissão para excluir este dataset.'},
            #         status=status.HTTP_403_FORBIDDEN
            #     )
            
            caminho_arquivo = dataset.arquivo.path
            if os.path.exists(caminho_arquivo):
                os.remove(caminho_arquivo)

            dataset.delete()

            return Response({'mensagem': 'Dataset excluído com sucesso!'}, status=status.HTTP_204_NO_CONTENT)

        except Dataset.DoesNotExist:
            return Response({'erro': 'Dataset nao encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'erro': f'Erro inesperado: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
@method_decorator(csrf_exempt, name='dispatch')
class DatasetUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [DRFIsAdminUser]
    
    def post(self, request, format=None):
        serializer = DatasetSerializer(data=request.data)
        if serializer.is_valid():
            arquivo = request.FILES.get('arquivo')
            
            if not (arquivo.name.endswith('.csv') or arquivo.name.endswith('.xlsx')):
                return Response({'erro': 'Apenas arquivos .csv ou .xlsx são permitidos.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # 🔑 A alteração mais importante: associe o dataset ao usuário logado
            # O 'request.user' é o objeto do usuário autenticado pelo Django
            serializer.save(usuario=request.user)
            
            return Response({'mensagem': 'Dataset enviado com sucesso!'}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DatasetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
    
class DatasetListAPI(generics.ListAPIView):
    queryset = Dataset.objects.all().order_by('-criado_em')
    serializer_class = DatasetSerializer
    pagination_class = DatasetPagination
    filter_backends = [SearchFilter]
    search_fields = ['nome']

class DatasetFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(lookup_expr='icontains', label='Buscar por nome')

    class Meta:
        model = Dataset
        fields = ['search']

class DatasetListView(generics.ListAPIView):
    queryset = Dataset.objects.all().order_by('-criado_em')
    serializer_class = DatasetSerializer
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, OrderingFilter)
    filterset_class = DatasetFilter
    pagination_class = PageNumberPagination

