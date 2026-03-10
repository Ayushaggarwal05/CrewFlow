from django.shortcuts import render
from rest_framework import generics
from .serializers import ProjectCreateSerializer , ProjectSerializer
from .models import Project
from rest_framework.permissions import IsAuthenticated 
from rest_framework.exceptions import PermissionDenied
from apps.organizations.permissions import IsManagerOrAdmin
# Create your views here.

class ProjectCreateView(generics.CreateAPIView):
    serializer_class = ProjectCreateSerializer
    permission_classes = [IsAuthenticated , IsManagerOrAdmin]

    def perform_create(self, serializer):
        team = serializer.validated_data["team"]
        user = self.request.user
        is_member = team.organization.memberships.filter(user=user).exists()

        if not is_member:
            raise PermissionDenied("not allowed")
        serializer.save(created_by=user)

class ProjectListView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        org_id = self.kwargs["organization_id"]
        user = self.request.user
        return Project.objects.filter( team__organization_id = org_id ,team__organization__memberships__user = user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated,IsManagerOrAdmin]

    def get_queryset(self):
        user = self.request.user

        return Project.objects.filter(
            team__organization__memberships__user=user
        )