from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CustomTokenSerializer
# Create your views here.

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,  request):
        try : 
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {"detail" : "Logged Out"},
                status=200,
            )
        except Exception:
            return Response(
                {"detail" : "Invalid token"},
                status=400,
            )