from django.shortcuts import render
from rest_framework import generics
from .models import ActivityLog
from .serializers import ActivityLogSerializer

# Create your views here.

class ActivityCreateView(generics.CreateAPIView):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer

    def perform_create(self, serializer):
        serializer.save(user = self.request.user)
    

class ActivityListView(generics.ListAPIView):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
