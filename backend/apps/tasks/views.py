from django.shortcuts import render
from rest_framework import generics
from .serializers import TaskCreateSerializer , TaskSerializer
from .models import Task
# Create your views here.

class TaskCreateView(generics.CreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskCreateSerializer

class TaskListView(generics.ListAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
