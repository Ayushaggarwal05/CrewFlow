from django.shortcuts import render
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Project
from .serializers import ProjectWriteSerializer, ProjectSerializer
from apps.common.permissions import IsManagerOrAdmin, IsTeamManagerOrAdminFromURL


#------------------------list and create -----------------------
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

        # Others: projects where they are created_by OR have an assigned task OR explicitly joined
        return Project.objects.filter(
            Q(team_id=team_id) & 
            (Q(created_by=user) | Q(tasks__assigned_to=user) | Q(memberships__user=user))
        ).distinct()
    
    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProjectWriteSerializer
        return ProjectSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsTeamManagerOrAdminFromURL()]
        return [IsAuthenticated()]
    

#-----------------------Update, delete, detail----------------

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):

    def get_permissions(self):
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), IsManagerOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        team_id = self.kwargs["team_id"]
        
        from django.shortcuts import get_object_or_404
        from django.db.models import Q
        from apps.teams.models import Team
        from apps.organizations.utils import get_user_role
        
        team = get_object_or_404(Team, id=team_id)
        role = get_user_role(user, team.organization)

        if role in ["ADMIN", "MANAGER"]:
            return Project.objects.filter(team_id=team_id)

        # Others: projects where they are created_by OR have an assigned task OR explicitly joined
        return Project.objects.filter(
            Q(team_id=team_id) & 
            (Q(created_by=user) | Q(tasks__assigned_to=user) | Q(memberships__user=user))
        ).distinct()
    
    def get_serializer_class(self):
        if self.request.method in ["PUT","PATCH"]:
            return ProjectWriteSerializer
        return ProjectSerializer


# ---------------------------------------------------------------
# GET /api/projects/<project_id>/members/
# Read-only: returns team memberships scoped to this project's team.
# No new model — project members are derived from TeamMembership.
# ---------------------------------------------------------------

class ProjectMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        from .models import ProjectMembership
        from .serializers import ProjectMembershipSerializer

        # Scope to projects visible to the requesting user
        project = Project.objects.select_related(
            "team__organization"
        ).filter(
            id=project_id,
            team__organization__memberships__user=request.user,
        ).distinct().first()

        if not project:
            return Response({"detail": "Not found."}, status=404)

        # Only users who explicitly joined THIS project
        memberships = ProjectMembership.objects.filter(
            project=project
        ).select_related("user")

        serializer = ProjectMembershipSerializer(memberships, many=True)
        data = serializer.data

        # Inject Manager if they exist and aren't already in the list
        manager = project.team.manager
        if manager and not any(m.get("user") == manager.id for m in data):
            data.insert(0, {
                "id": f"mgr_{manager.id}",
                "user": manager.id,
                "user_full_name": getattr(manager, "full_name", None) or manager.email,
                "user_email": manager.email,
                "role": "MANAGER",
                "role_display": "Manager",
                "joined_at": project.created_at
            })

        return Response(data)

class ProjectMembershipDetailView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        from .serializers import ProjectMembershipWriteSerializer
        return ProjectMembershipWriteSerializer

    def get_queryset(self):
        user = self.request.user
        project_id = self.kwargs.get("project_id")
        
        from .models import ProjectMembership, Project
        from apps.projects.utils import get_project_role
        from rest_framework.exceptions import PermissionDenied
        
        project = Project.objects.filter(id=project_id).first()
        if not project:
            return ProjectMembership.objects.none()
            
        role = get_project_role(user, project)
        if role != "MANAGER":
            raise PermissionDenied("Only project managers can update member roles.")

        return ProjectMembership.objects.filter(
            project_id=project_id,
            project__team__organization__memberships__user=user
        )