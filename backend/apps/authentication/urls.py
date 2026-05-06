from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView , TokenVerifyView

from .views import CustomLoginView , LogoutView, ChangePasswordView, VerifyOTPView, ResendOTPView, ForgotPasswordView, ResetPasswordView

urlpatterns = [
    path("login/" , CustomLoginView.as_view() , name="login"),
    path("refresh/" , TokenRefreshView.as_view() , name="refresh"),
    path("verify/" , TokenVerifyView.as_view() , name="verify"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("resend-otp/", ResendOTPView.as_view(), name="resend-otp"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    path("logout/" , LogoutView.as_view() ,name="logout"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]