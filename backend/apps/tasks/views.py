from django.shortcuts import render
from rest_framework import generics
from .serializers import TaskWriteSerializer , TaskSerializer
from .models import Task
from apps.common.permissions import IsMemberOrAbove
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter , OrderingFilter
# Create your views here.

class TaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated , IsMemberOrAbove]


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
        
        from django.shortcuts import get_object_or_404
        from apps.projects.utils import get_project_role
        from .models import Task
        from apps.projects.models import Project

        project = get_object_or_404(Project, id=project_id)
        role = get_project_role(user, project)

        # ADMIN, MANAGER, LEAD see all project tasks
        if role in ["ADMIN", "MANAGER", "LEAD"] or project.created_by == user:
            return Task.objects.filter(project_id=project_id).order_by("-created_at")

        # MEMBER: Strictly assigned tasks
        return Task.objects.filter(
            project_id=project_id,
            assigned_to=user
        ).order_by("-created_at")
   
    
    def get_serializer_class(self):
        if self.request.method == "POST":
            return TaskWriteSerializer
        return TaskSerializer


class MyOrgTasksListView(generics.ListAPIView):
    """
    Returns tasks assigned to the current user, filtered by organization.
    Useful for the dashboard widget.
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        org_id = self.request.query_params.get("org_id")
        
        queryset = Task.objects.filter(assigned_to=user).order_by("due_date", "-created_at")
        
        if org_id:
            queryset = queryset.filter(project__team__organization_id=org_id)
            
        return queryset


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated , IsMemberOrAbove]

    def get_queryset(self):
        user = self.request.user
        project_id = self.kwargs["project_id"]

        from django.shortcuts import get_object_or_404
        from apps.projects.utils import get_project_role
        from .models import Task
        from apps.projects.models import Project

        project = get_object_or_404(Project, id=project_id)
        role = get_project_role(user, project)

        if role in ["ADMIN", "MANAGER", "LEAD"] or project.created_by == user:
            return Task.objects.filter(project_id=project_id)

        return Task.objects.filter(
            project_id=project_id,
            assigned_to=user
        )

    def get_serializer_class(self):

        if self.request.method in ["PUT", "PATCH"]:
            return TaskWriteSerializer

        return TaskSerializer