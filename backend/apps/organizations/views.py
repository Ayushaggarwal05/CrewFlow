from django.shortcuts import render
from rest_framework import generics
from .models import Organization , OrganizationMembership
from .serializers import OrganizationSerializer , OrganizationWriteSerializer , OrganizationMembershipSerializer , OrganizationMembershipWriteSerializer
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.common.permissions import (
    IsAuthenticatedAndMember, 
    IsOrganizationAdmin, 
    IsOrganizationMember, 
    IsLeadOrAbove,
    IsManagerOrAdmin
)
from apps.teams.models import TeamMembership


# Create your views here.



#------------------List and create ---------------

class OrganizationListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAuthenticatedAndMember]

    filterset_fields = [                                   #drop down/filter
        "owner",
    ]

    search_fields = ["name"]                                #search box
    ordering_fields = ["created_at"]                        #sort

    def get_queryset(self):
        user = self.request.user

        return Organization.objects.filter(memberships__user = user).distinct()
    
    def get_serializer_class(self):
        if self.request.method == "POST":
            return OrganizationWriteSerializer
        return OrganizationSerializer


#----------------Update , Delete , Detail-------------

class OrganizationDetailView(generics.RetrieveUpdateDestroyAPIView):
    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), IsOrganizationAdmin()]
        return [IsAuthenticated(), IsOrganizationMember()]

    def get_queryset(self):
        user = self.request.user
        return Organization.objects.filter(memberships__user = user)

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return OrganizationWriteSerializer

        return OrganizationSerializer



#_______________________________________organizationmembership___________________________


class OrganizationMembershipListCreateView(generics.ListCreateAPIView):
    serializer_class = OrganizationMembershipSerializer
    permission_classes = [IsLeadOrAbove] # Base permission for create


    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        org_id = self.kwargs["org_id"]
        
        try:
            my_membership = OrganizationMembership.objects.get(user=user, organization_id=org_id)
        except OrganizationMembership.DoesNotExist:
            return OrganizationMembership.objects.none()

        queryset = OrganizationMembership.objects.filter(organization_id=org_id).select_related("user", "manager__user")

        if my_membership.role in ["OWNER", "ADMIN"]:
            return queryset
        
        if my_membership.role in ["MANAGER", "LEAD"]:
            # See subordinates
            return queryset.filter(manager=my_membership)
        
        if my_membership.role == "MEMBER":
            # 1. Self
            # 2. Manager
            # 3. Colleagues in same teams
            my_team_ids = TeamMembership.objects.filter(user=user, team__organization_id=org_id).values_list("team_id", flat=True)
            colleague_user_ids = TeamMembership.objects.filter(team_id__in=my_team_ids).values_list("user_id", flat=True)
            
            q_filter = Q(user=user)
            if my_membership.manager:
                q_filter |= Q(id=my_membership.manager.id)
            
            q_filter |= Q(user_id__in=colleague_user_ids)
            
            return queryset.filter(q_filter).distinct()

        return OrganizationMembership.objects.none()


class OrganizationMembershipDetailView(generics.RetrieveUpdateDestroyAPIView):
    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), IsOrganizationAdmin()]
        return [IsAuthenticated(), IsOrganizationMember()]

    def get_queryset(self):
        # Allow detail access according to role visibility
        org_id = self.kwargs["org_id"]
        user = self.request.user
        
        try:
            my_membership = OrganizationMembership.objects.get(user=user, organization_id=org_id)
        except OrganizationMembership.DoesNotExist:
            return OrganizationMembership.objects.none()

        queryset = OrganizationMembership.objects.filter(organization_id=org_id)

        if my_membership.role in ["OWNER", "ADMIN"]:
            return queryset
        elif my_membership.role in ["MANAGER", "LEAD"]:
            # Can see themselves and their subordinates
            from django.db.models import Q
            return queryset.filter(Q(id=my_membership.id) | Q(manager=my_membership))
        else:
            return queryset.filter(id=my_membership.id)

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return OrganizationMembershipWriteSerializer
        return OrganizationMembershipSerializer


class MyTeamView(generics.ListAPIView):
    """
    Returns the subordinates of the current user for a specific organization.
    """
    permission_classes = [IsAuthenticated, IsOrganizationMember]
    serializer_class = OrganizationMembershipSerializer

    def get_queryset(self):
        user = self.request.user
        org_id = self.kwargs.get("org_id")
        
        if not org_id:
            return OrganizationMembership.objects.none()

        try:
            my_membership = OrganizationMembership.objects.get(user=user, organization_id=org_id)
        except OrganizationMembership.DoesNotExist:
            return OrganizationMembership.objects.none()

        return OrganizationMembership.objects.filter(manager=my_membership)


class DashboardStatsView(APIView):
    """
    Returns scoped counts for a specific organization.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        org_id = request.query_params.get("org_id")
        user = request.user

        if not org_id:
            return Response({"detail": "org_id is required."}, status=400)

        try:
            membership = OrganizationMembership.objects.get(user=user, organization_id=org_id)
        except OrganizationMembership.DoesNotExist:
            return Response({"detail": "Not a member of this organization."}, status=403)

        from apps.teams.models import Team, TeamMembership
        from apps.projects.models import Project
        from apps.tasks.models import Task

        # Base querysets
        teams_qs = Team.objects.filter(organization_id=org_id)
        projects_qs = Project.objects.filter(team__organization_id=org_id)
        tasks_qs = Task.objects.filter(project__team__organization_id=org_id)

        # Filtering based on role for accuracy of what THEY can see
        if membership.role not in ["OWNER", "ADMIN"]:
            # Only count teams they belong to
            my_team_ids = TeamMembership.objects.filter(user=user, team__organization_id=org_id).values_list("team_id", flat=True)
            teams_qs = teams_qs.filter(id__in=my_team_ids)
            projects_qs = projects_qs.filter(team_id__in=my_team_ids)
            tasks_qs = tasks_qs.filter(project__team_id__in=my_team_ids)

        total_tasks = tasks_qs.count()
        completed_tasks = tasks_qs.filter(status="DONE").count()
        completion_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

        # Active projects (at least one non-DONE task)
        # Note: In a real system, projects might have their own status, 
        # but here we follow the "actually useful" requirement based on task completion.
        active_projects_count = projects_qs.filter(tasks__status__in=["TODO", "IN_PROGRESS"]).distinct().count()

        return Response({
            "teams_count": teams_qs.count(),
            "projects_count": projects_qs.count(),
            "members_count": OrganizationMembership.objects.filter(organization_id=org_id).count(),
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_percentage": round(completion_percentage, 1),
            "active_projects_count": active_projects_count,
        })
