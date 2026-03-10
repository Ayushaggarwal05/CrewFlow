from django.shortcuts import render
from rest_framework import generics
from .models import ActivityLog
from .serializers import ActivityLogSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .permissions import IsOrganizationMember
from apps.organizations.permissions import IsDeveloperOrAbove
# Create your views here.

class ActivityCreateView(generics.CreateAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated , IsOrganizationMember]

    def perform_create(self, serializer):
        user = self.request.user
        task = serializer.validated_data["task"]

        if not task.project.team.organization.memberships.filter(user=user).exists():
            raise PermissionDenied("not allowed")
        
        serializer.save(user=user)
    

class ActivityListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated , IsOrganizationMember , IsDeveloperOrAbove]

    def get_queryset(self):
        user = self.request.user
        return ActivityLog.objects.filter(task__project__team__organization__memberships__user = user)
