from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated 
from .models import Project
from .serializers import ProjectWriteSerializer , ProjectSerializer
# from rest_framework.exceptions import PermissionDenied
from apps.common.permissions import IsManagerOrAdmin, IsTeamManagerOrAdminFromURL
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
        
        from django.shortcuts import get_object_or_404
        from django.db.models import Q
        from apps.organizations.utils import is_admin, get_user_role
        from apps.teams.models import Team
        
        team = get_object_or_404(Team, id=team_id)
        from apps.organizations.utils import get_user_role
        role = get_user_role(user, team.organization)

        # Admin or Org Manager see all team projects
        if role in ["ADMIN", "MANAGER"]:
            return Project.objects.filter(team_id=team_id)

        # Others: projects where they are created_by OR have an assigned task
        return Project.objects.filter(
            Q(team_id=team_id) & 
            (Q(created_by=user) | Q(tasks__assigned_to=user))
        ).distinct()
    
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
    permission_classes = [IsAuthenticated,IsManagerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        team_id = self.kwargs["team_id"]

        return Project.objects.filter(
            team__id = team_id,
            team__organization__memberships__user=user
        ).distinct()
    
    def get_serializer_class(self):
        if self.request.method in ["PUT","PATCH"]:
            return ProjectWriteSerializer
        return ProjectSerializer