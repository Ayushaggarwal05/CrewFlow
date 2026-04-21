from django.shortcuts import render
from rest_framework import generics
from .serializers import TeamSerializer , TeamWriteSerializer , TeamMembershipSerializer , TeamMembershipWriteSerializer
from .models import Team , TeamMembership
from rest_framework.permissions import IsAuthenticated
from apps.common.permissions import (
    IsManagerOrAdmin,
    IsOrganizationAdmin,
    IsOrganizationMember,
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
        if is_admin(user, org_id):
            return Team.objects.filter(organization_id=org_id)

        # Non-admins: only teams they belong to
        return Team.objects.filter(
            organization_id=org_id, 
            memberships__user=user
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
            return [IsAuthenticated(), IsManagerOrAdmin()]
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
    permission_classes = [IsAuthenticated , IsManagerOrAdmin]

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

    permission_classes = [ IsAuthenticated , IsManagerOrAdmin]
    serializer_class = TeamMembershipSerializer

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