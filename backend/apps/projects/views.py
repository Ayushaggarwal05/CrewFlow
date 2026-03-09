from django.shortcuts import render
from rest_framework import generics
from .serializers import ProjectCreateSerializer  , ProjectSerializer
from .models import Project
from rest_framework.permissions import IsAuthenticated 
from rest_framework.exceptions import PermissionDenied
# Create your views here.

class ProjectCreateView(generics.CreateAPIView):
    serializer_class = ProjectCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        team = serializer.validated_data["team"]
        user = self.request.user
        is_member = team.organization.memberships.filter(user=user).exists()

        if not is_member:
            raise self.PermissionDenied("Not Allowed")
        serializer.save(created_by=user)

class ProjectListView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(team_organization_memberships_user = user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return Project.objects.filter(
            team__organization__memberships__user=user
        )