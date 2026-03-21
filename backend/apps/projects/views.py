from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated 
from .models import Project
from .serializers import ProjectWriteSerializer , ProjectSerializer
# from rest_framework.exceptions import PermissionDenied
from apps.common.permissions import IsManagerOrAdmin
# Create your views here.


#------------------------list nad create -----------------------
class ProjectListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated ]

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