# from django.contrib.auth import authenticate, login, logout
# from django.http import JsonResponse
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import AllowAny, IsAuthenticated

# # --- LOGIN ---
# @api_view(['POST'])
# @permission_classes([AllowAny])
# def login_view(request):
#     username = request.data.get("username")
#     password = request.data.get("password")

#     user = authenticate(request, username=username, password=password)

#     if user is not None:
#         login(request, user)
#         return JsonResponse({"mensagem": "Login realizado com sucesso!"})
#     else:
#         return JsonResponse({"erro": "Usuário ou senha inválidos"}, status=401)


# # --- LOGOUT ---
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])  # permite logout mesmo sem sessão ativa
# def logout_view(request):
#     logout(request)  # apaga a sessão no banco e limpa cookies
#     return JsonResponse({'mensagem': 'Logout realizado com sucesso!'})


from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


# --- LOGIN (via sessão Django - opcional, mas agora usamos JWT) ---
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)  # 🔹 isso só cria sessão Django (não afeta JWT)
        return JsonResponse({"mensagem": "Login realizado com sucesso!"})
    else:
        return JsonResponse({"erro": "Usuário ou senha inválidos"}, status=401)


# --- LOGOUT (agora baseado em JWT) ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()  # ✅ invalida o refresh token
        return Response({"mensagem": "Logout realizado com sucesso!"})
    except Exception as e:
        return Response({"erro": str(e)}, status=400)
