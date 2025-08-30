from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

# --- LOGIN ---
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_protect
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


# --- LOGOUT ---
@api_view(['POST'])
@permission_classes([AllowAny])   # permite logout mesmo sem sessão ativa
def logout_view(request):
    logout(request)  # apaga a sessão no banco e limpa cookies
    return JsonResponse({'mensagem': 'Logout realizado com sucesso!'})
