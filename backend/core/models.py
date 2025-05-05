from django.db import models


class Dataset(models.Model):
    nome = models.CharField(max_length=100)
    arquivo = models.FileField(upload_to='datasets/')
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome
    
class Analise(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE)
    resultado = models.TextField()
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Análise de {self.dataset.nome}'