from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated 
from .models import Project
from .serializers import ProjectWriteSerializer , ProjectSerializer
# from rest_framework.exceptions import PermissionDenied
from apps.common.permissions import IsManagerOrAdmin, IsTeamManagerOrAdminFromURL, IsOrganizationMember
# Create your views here.


#------------------------list nad create -----------------------
class ProjectListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    filterset_fields = [
        "status","team" ,"created_by",
    ]

    search_fields = [
        "name","description",
    ]

    ordering_fields = [
        "created_at","deadline",
    ]

    def get_queryset(self):
        user = self.request.user
        team_id = self.kwargs["team_id"]
        return Project.objects.filter(team__id = team_id , team__organization__memberships__user=user).distinct()
    
    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProjectWriteSerializer
        return ProjectSerializer

    def get_permissions(self):
        # GET: any authenticated org member can view team projects (queryset is filtered).
        # POST: only MANAGER/ADMIN of the team org can create.
        if self.request.method == "POST":
            return [IsAuthenticated(), IsTeamManagerOrAdminFromURL()]
        return [IsAuthenticated()]
    

#-----------------------Update, delete , detail----------------

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsOrganizationMember]

    def get_queryset(self):
        user = self.request.user
        team_id = self.kwargs["team_id"]

        return Project.objects.filter(
            team__id = team_id,
            team__organization__memberships__user=user
        ).distinct()

    def get_permissions(self):
        # GET: any org member can view project details (join-code fields are stripped server-side).
        # PUT/PATCH/DELETE: org ADMIN/MANAGER only.
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), IsManagerOrAdmin()]
        return [IsAuthenticated(), IsOrganizationMember()]
    
    def get_serializer_class(self):
        if self.request.method in ["PUT","PATCH"]:
            return ProjectWriteSerializer
        return ProjectSerializer