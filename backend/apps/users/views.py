from django.shortcuts import render
from rest_framework import generics
from .models import User
from .serializers import UserSerializer , RegisterSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Q

from apps.common.permissions import IsOrganizationMember
# Create your views here.

class RegisterView(generics.CreateAPIView):
    serializer_class= RegisterSerializer
    permission_classes = [AllowAny]


class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserStatsView(APIView):
    """
    Returns global stats for the current user across all organizations.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        from apps.tasks.models import Task
        from apps.projects.models import Project

        tasks_qs = Task.objects.filter(assigned_to=user)
        total_assigned = tasks_qs.count()
        completed = tasks_qs.filter(status="DONE").count()
        
        # Organizations part of
        orgs_count = user.organizationmembership_set.count()
        
        # Projects involved in
        projects_count = Project.objects.filter(
            Q(team__memberships__user=user) | Q(tasks__assigned_to=user)
        ).distinct().count()

        return Response({
            "tasks_assigned": total_assigned,
            "tasks_completed": completed,
            "organizations_count": orgs_count,
            "projects_involved": projects_count,
            "completion_rate": round((completed / total_assigned * 100), 1) if total_assigned > 0 else 0
        })
    

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
