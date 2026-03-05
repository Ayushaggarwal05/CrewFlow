from django.shortcuts import render
from rest_framework import generics
from .models import Organization
from .serializers import OrganizationSerializer , OrganizationCreateSerializer
# Create your views here.

class OrganizationListView(generics.ListAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer

class OrganizationCreateView(generics.CreateAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationCreateSerializer

