from django.db import models
from django.contrib.auth.models import User


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
    
class Profile(models.Model):
    CARGOS = {
        ('admin', 'Administrador'),
        ('analista', 'Analista de Dados'),
        ('gerente', 'Gerente'),
        ('convidado', 'Convidado'),
    }

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    cargo = models.CharField(max_length=20, choices=CARGOS, default='convidado')

    def __str__(self):
        return f'{self.user.username} - {self.get_cargo_display()}'