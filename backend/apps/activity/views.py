from django.shortcuts import render
from rest_framework import generics
from .models import ActivityLog
from .serializers import ActivityLogSerializer
from rest_framework.permissions import IsAuthenticated
from .permissions import IsOrganizationMember
from apps.common.permissions import IsDeveloperOrAbove
# Create your views here.

class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated , IsOrganizationMember , IsDeveloperOrAbove]

    def get_queryset(self):
        user = self.request.user
        project_id = self.kwargs["project_id"]
        return ActivityLog.objects.filter(project__id = project_id , project__team__organization__memberships__user=user)
    

