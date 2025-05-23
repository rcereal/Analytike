from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from rest_framework.decorators import api_view

@api_view(['POST'])
@ensure_csrf_cookie  # <-- garante que o CSRF seja exigido, e o cookie esteja setado
def login_view(request):
    print("Recebido CSRF token:", request.META.get("HTTP_X_CSRFTOKEN"))
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        return JsonResponse({"mensagem": "Login realizado com sucesso!"})
    else:
        return JsonResponse({"erro": "Usuário ou senha inválidos"}, status=401)

@api_view(['POST'])
def logout_view(request):
    logout(request)
    return JsonResponse({'mensagem': 'Logout realizado com sucesso!'})