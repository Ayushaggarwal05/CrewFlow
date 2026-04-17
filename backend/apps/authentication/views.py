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


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response({"detail": "Both old and new passwords are required."}, status=400)

        if not user.check_password(old_password):
            return Response({"detail": "Incorrect current password."}, status=400)

        user.set_password(new_password)
        user.save()

        return Response({"detail": "Password updated successfully."}, status=200)