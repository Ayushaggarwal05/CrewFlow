from django.shortcuts import render
from rest_framework import generics
from .serializers import TaskCreateSerializer , TaskSerializer
from .models import Task
from apps.common.permissions import IsManagerOrAdmin
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
# Create your views here.

class TaskCreateView(generics.CreateAPIView):
    serializer_class = TaskCreateSerializer
    permission_classes = [IsAuthenticated , IsManagerOrAdmin]

    def perform_create(self, serializer):
        project = serializer.validated_data["project"]
        user = self.request.user

        is_member = project.team.organization.memberships.filter(user = user).exists()
        if not is_member:
            raise PermissionDenied("Not Allowed")
        serializer.save()
class TaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(project__team__organization__memberships__user=user)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated , IsManagerOrAdmin]

    def get_queryset(self):
        user = self.request.user

        return Task.objects.filter(
            project__team__organization__memberships__user=user
        )