from django.shortcuts import render
from rest_framework import generics
from .serializers import TaskWriteSerializer , TaskSerializer
from .models import Task
from apps.common.permissions import IsDeveloperOrAbove
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter , OrderingFilter
# Create your views here.

class TaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated , IsDeveloperOrAbove]

    filter_backends = [DjangoFilterBackend , SearchFilter , OrderingFilter]

    filterset_fields = [
        "status","priority" , "project" ,"assigned_to"
    ]

    search_fields = [
        "title" , "description",
    ]

    ordering_fields = [
        "created_at" ,"due_date",
    ]

    def get_queryset(self):
        user = self.request.user
        project_id = self.kwargs["project_id"]

        return Task.objects.filter(Project__id = project_id , project__team__organization__memberships__user=user).distinct()
    
    def get_serializer_class(self):
        if self.request.method == "POST":
            return TaskWriteSerializer
        return TaskSerializer




class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated , IsDeveloperOrAbove]

    def get_queryset(self):

        user = self.request.user
        project_id = self.kwargs["project_id"]

        return Task.objects.filter(
            project__id=project_id,
            project__team__organization__memberships__user=user,
        ).distinct()

    def get_serializer_class(self):

        if self.request.method in ["PUT", "PATCH"]:
            return TaskWriteSerializer

        return TaskSerializer