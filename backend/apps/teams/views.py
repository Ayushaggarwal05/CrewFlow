from django.shortcuts import render
from rest_framework import generics
from .serializers import TeamSerializer
from .models import Team

# Create your views here.

class TeamCreateView(generics.CreateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

    def perform_create(self, serializer):
        serializer.save()

class TeamListView(generics.ListAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer


