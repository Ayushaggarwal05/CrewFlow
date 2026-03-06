from django.shortcuts import render
from rest_framework import generics
from .serializers import ProjectCreateSerializer  , ProjectSerializer
from .models import Project
# Create your views here.

class ProjectCreateView(generics.CreateAPIView):
    queryset  = Project.objects.all()
    serializer_class = ProjectCreateSerializer


class ProjectListView(generics.ListAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

