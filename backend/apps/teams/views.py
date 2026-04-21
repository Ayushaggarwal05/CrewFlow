from django.shortcuts import render
from rest_framework import generics
from .serializers import TeamSerializer , TeamWriteSerializer , TeamMembershipSerializer , TeamMembershipWriteSerializer
from .models import Team , TeamMembership
from rest_framework.permissions import IsAuthenticated
from apps.common.permissions import (
    IsManagerOrAdmin,
    IsOrganizationAdmin,
    IsOrganizationMember,
    IsTeamManagerOrOrgAdmin,
)



# Create your views here.

#------------------list and create----------
class TeamListCreateView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsManagerOrAdmin()]
        return [IsAuthenticated()]
    
    filterset_fields = [
        "organization",
    ]

    search_fields = [
        "name",
    ]

    ordering_fields = [
        "created_at",
    ]

    def get_queryset(self):
        user = self.request.user
        org_id = self.kwargs["org_id"]
        
        from apps.organizations.utils import is_admin
        from django.db.models import Q

        if is_admin(user, org_id):
            return Team.objects.filter(organization_id=org_id)

        # Non-admins: teams they are a member of, OR they are the team manager
        return Team.objects.filter(
            Q(memberships__user=user) | Q(manager=user),
            organization_id=org_id,
        ).distinct()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TeamWriteSerializer
        return TeamSerializer
    


class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAuthenticated(), IsOrganizationAdmin()]
        if self.request.method in ["PUT", "PATCH"]:
            return [IsAuthenticated(), IsTeamManagerOrOrgAdmin()]
        return [IsAuthenticated(), IsOrganizationMember()]

    def get_queryset(self):
        user = self.request.user
        org_id = self.kwargs["org_id"]

        return Team.objects.filter(
            organization__id=org_id,
            organization__memberships__user=user,
        ).distinct()
    
    def get_serializer_class(self):
        if self.request.method in ["PUT" , "PATCH"]:
            return TeamWriteSerializer
        return TeamSerializer




#____________________________TeamMembership___________________

class TeamMembershipListCreateView(generics.ListCreateAPIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsTeamManagerOrOrgAdmin()]
        return [IsAuthenticated()]

    filterset_fields = [
        "role","user" , "team"
    ]

    search_fields = [
        "user__email",
    ]

    ordering_fields = [
        "joined_at",
    ]

    def get_queryset(self):
        user = self.request.user
        team_id  = self.kwargs["team_id"]

        return TeamMembership.objects.filter(team__id = team_id , team__organization__memberships__user=user).distinct()
    
    def get_serializer_class(self):
        if self.request.method == "POST":
            return TeamMembershipWriteSerializer
        return TeamMembershipSerializer


#---------------------UPdate , delte----------------

class TeamMembershipDetailView(generics.RetrieveUpdateDestroyAPIView):

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), IsTeamManagerOrOrgAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):

        user = self.request.user
        team_id = self.kwargs["team_id"]

        return TeamMembership.objects.filter(
            team__id=team_id,
            team__organization__memberships__user=user,
        ).distinct()
    
    def get_serializer_class(self):
        if self.request.method in ["PUT" , "PATCH"]:
            return TeamMembershipWriteSerializer
        return TeamMembershipSerializer

    def perform_update(self, serializer):
        old_role = serializer.instance.role
        new_role = serializer.validated_data.get("role", old_role)
        instance = serializer.save()
        team = instance.team

        if new_role == "MANAGER" and old_role != "MANAGER":
            # Demote the current manager (if different) to LEAD
            if team.manager_id and team.manager_id != instance.user_id:
                TeamMembership.objects.filter(
                    team=team, user_id=team.manager_id
                ).update(role="LEAD")
            # Promote this user to team manager
            team.manager = instance.user
            team.save(update_fields=["manager"])

        elif old_role == "MANAGER" and new_role != "MANAGER":
            # Demoted from manager — clear team.manager if it was this user
            if team.manager_id == instance.user_id:
                team.manager = None
                team.save(update_fields=["manager"])