from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView , TokenVerifyView

from .views import CustomLoginView , LogoutView, ChangePasswordView

urlpatterns = [
    path("login/" , CustomLoginView.as_view() , name="login"),
    path("refresh/" , TokenRefreshView.as_view() , name="refresh"),
    path("verify/" , TokenVerifyView.as_view() , name="verify"),
    path("logout/" , LogoutView.as_view() ,name="logout"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]