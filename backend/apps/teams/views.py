from django.shortcuts import render
from rest_framework import generics
from .serializers import TeamSerializer , TeamWriteSerializer , TeamMembershipSerializer , TeamMembershipWriteSerializer
from .models import Team , TeamMembership
from rest_framework.permissions import IsAuthenticated
from apps.common.permissions import (
    IsManagerOrAdmin,
    IsOrganizationAdmin,
)


# Create your views here.

#------------------list and create----------
class TeamListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
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

        return Team.objects.filter(organization_id = org_id , organization__memberships__user = user).distinct()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TeamWriteSerializer
        return TeamSerializer
    


class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated , IsManagerOrAdmin]
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