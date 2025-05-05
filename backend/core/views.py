import pandas as pd
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, generics
from .models import Dataset
from .serializers import DatasetSerializer

@api_view(['GET'])
def api_teste(request):
    return Response(({'mensagem': 'API funcionando com sucesso!'}))

class DatasetUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, format=None):
        serializer = DatasetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'mensagem': 'CSV enviado com sucesso!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DatasetListView(generics.ListAPIView):
    queryset = Dataset.objects.all().order_by('-criado_em')
    serializer_class = DatasetSerializer

@api_view(['POST'])
def upload_csv(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        df = pd.read_csv(file)

        for index, row in df.iterrows():
            nome = row['nome']
            criado_em = row['criado_em']

            Dataset.objects.create(nome=nome, criado_em=criado_em)

        return Response({'message': 'CSV processado com sucesso'})
    return Response({'message': 'Erro no envio do arquivo'}, status=400)

@api_view(['GET'])
def get_datasets(request):
    datasets = Dataset.objects.all()
    data = [{'id': d.id, 'nome': d.nome, 'criado_em': d.criado_em} for d in datasets]
    return Response(data)

def visualizar_dataset(request, dataset_id):
    try:
        dataset = Dataset.objects.get(pk=dataset_id)
        df = pd.read_csv(dataset.arquivo.path)
        data = df.to_dict(orient='records')
        colunas = list(df.columns)
        return JsonResponse({'colunas': colunas, 'data': data})
    except Dataset.DoesNotExist:
        return JsonResponse ({'erro': 'Dataset não encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'erro': str(e)}, status=500)
