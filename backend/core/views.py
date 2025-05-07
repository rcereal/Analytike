import pandas as pd
import numpy as np
import django_filters
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, generics, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter
from .models import Dataset
from .serializers import DatasetSerializer

# class DatasetUploadView(APIView):
#     parser_classes = [MultiPartParser, FormParser]
    
#     def post(self, request, format=None):
#         serializer = DatasetSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({'mensagem': 'CSV enviado com sucesso!'}, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_datasets(request):
    datasets = Dataset.objects.all()
    data = [{'id': d.id, 'nome': d.nome, 'criado_em': d.criado_em} for d in datasets]
    return Response(data)

def visualizar_dataset(request, dataset_id):
    try:
        dataset = Dataset.objects.get(pk=dataset_id)
        df = pd.read_csv(dataset.arquivo.path)

        preview_df = df.head(100)

        data = preview_df.to_dict(orient='records')
        colunas = list(df.columns)

        return JsonResponse({'colunas': colunas, 'data': data})
    
    except Dataset.DoesNotExist:
        return JsonResponse({'erro': 'Dataset não encontrado'}, status=404)
    except pd.errors.ParserError:
        return JsonResponse({'erro': 'Erro ao processar o CSV. Verifique o formato.'}, status=400)
    except Exception as e:
        return JsonResponse({'erro': f'Erro inesperado: {str(e)}'}, status=500)
    
@api_view(['GET'])
def analise_dataset(request, dataset_id):
    dataset = get_object_or_404(Dataset, pk=dataset_id)

    try:
        df = pd.read_csv(dataset.arquivo.path)
        total_linhas = len(df)
        colunas_numericas = df.select_dtypes(include=[np.numer]).columns.tolist()

        resultados_analises = {}

        for coluna in colunas_numericas:
            serie_numerica = df[coluna]
            primeiro_quartil = serie_numerica.quantile(0.25)
            terceiro_quartil = serie_numerica.quantile(0.75)
            intervalo_interquartil = terceiro_quartil - primeiro_quartil

            outliers = serie_numerica[
                (serie_numerica < (primeiro_quartil - 1.5 * intervalo_interquartil)) |
                (serie_numerica> (terceiro_quartil + 1.5 * intervalo_interquartil))
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

        return JsonResponse({
            'total_linhas': total_linhas,
            'colunas_numericas': colunas_numericas,
            'analises': resultados_analises
        })
    except Exception as erro:
        return JsonResponse({'erro': f'Erro inesperado: {str(erro)}'}, status=500)

class DatasetUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, format=None):
        serializer = DatasetSerializer(data=request.data)
        if serializer.is_valid():
            arquivo = request.FILES.get('arquivo')
            if not arquivo.name.endswith('.csv'):
                return Response({'erro': 'Apenas arquivos .csv são permitidos.'}, status=status.HTTP_400_BAD_REQUEST)

            serializer.save()
            return Response({'mensagem': 'CSV enviado com sucesso!'}, status=status.HTTP_201_CREATED)
        
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

