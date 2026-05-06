from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CustomTokenSerializer
from apps.users.models import User
from .models import EmailOTP
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
import random

class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response("Email is required.", status=400)

        try:
            user = User.objects.get(email=email)
            if user.is_verified:
                return Response("Account is already verified.", status=400)

            # Generate fresh OTP
            otp = str(random.randint(100000, 999999))
            EmailOTP.objects.filter(user=user).delete()
            EmailOTP.objects.create(user=user, otp=otp)

            # Send Email
            try:
                send_mail(
                    "Verify your Email - CrewFlow",
                    f"Your new OTP for email verification is: {otp}. It is valid for 10 minutes.",
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Error sending email: {e}")

            return Response("OTP resent to email.", status=200)

        except User.DoesNotExist:
            return Response("User with this email does not exist.", status=400)

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response("Email is required.", status=400)

        try:
            user = User.objects.get(email=email)
            # We allow sending OTP for password reset regardless of verification status
            
            # Generate fresh OTP
            otp = str(random.randint(100000, 999999))
            EmailOTP.objects.filter(user=user).delete()
            EmailOTP.objects.create(user=user, otp=otp)

            # Send Email
            try:
                send_mail(
                    "Password Reset - CrewFlow",
                    f"Your OTP for password reset is: {otp}. It is valid for 10 minutes.",
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Error sending email: {e}")

            return Response("Reset OTP sent to email.", status=200)

        except User.DoesNotExist:
            return Response("User with this email does not exist.", status=400)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response("Email and OTP are required.", status=400)

        try:
            user = User.objects.get(email=email)
            otp_obj = EmailOTP.objects.filter(user=user, otp=otp).latest("created_at")

            # Check expiry (10 mins)
            if timezone.now() > otp_obj.created_at + timedelta(minutes=10):
                return Response("OTP has expired.", status=400)

            user.is_verified = True
            user.save()

            # Delete OTP after success
            otp_obj.delete()

            return Response("Account verified successfully.", status=200)

        except (User.DoesNotExist, EmailOTP.DoesNotExist):
            return Response("Invalid Email or OTP.", status=400)

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

        return Response({"detail": "Password updated successfully.", "success": True}, status=200)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')

        if not email or not otp or not new_password:
            return Response('Email, OTP, and new password are required.', status=400)

        try:
            user = User.objects.get(email=email)
            otp_obj = EmailOTP.objects.filter(user=user, otp=otp).latest('created_at')

            if timezone.now() > otp_obj.created_at + timedelta(minutes=10):
                return Response('OTP has expired.', status=400)

            user.set_password(new_password)
            user.is_verified = True
            user.save()

            otp_obj.delete()
            return Response('Password reset successfully.', status=200)

        except (User.DoesNotExist, EmailOTP.DoesNotExist):
            return Response('Invalid Email or OTP.', status=400)
