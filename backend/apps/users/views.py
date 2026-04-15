from django.shortcuts import render
from rest_framework import generics
from .models import User
from .serializers import UserSerializer , RegisterSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny

from apps.common.permissions import IsOrganizationMember
# Create your views here.

class RegisterView(generics.CreateAPIView):
    serializer_class= RegisterSerializer
    permission_classes = [AllowAny]


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    

class OrganizationUsersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated , IsOrganizationMember]

    filterset_fields = [
        "is_active",
    ]

    search_fields = [
        "email","full_name",
    ]

    ordering_fields = [
        "date_joined",
    ]

    def get_queryset(self):
        org_id = self.kwargs["org_id"]
        return User.objects.filter(organizationmembership__organization__id = org_id).distinct()
    

class TeamUsersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated , IsOrganizationMember]

    filterset_fields = [
        "is_active",
    ]

    search_fields = [
        "email","full_name",
    ]

    ordering_fields = [
        "date_joined",
    ]

    def get_queryset(self):
        team_id = self.kwargs["team_id"]
        return User.objects.filter(team_memberships__team__id=team_id).distinct()
