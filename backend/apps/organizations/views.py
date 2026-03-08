from django.shortcuts import render
from rest_framework import generics
from .models import Organization
from .serializers import OrganizationSerializer , OrganizationCreateSerializer
from rest_framework.permissions import IsAuthenticated
# Create your views here.

class OrganizationListView(generics.ListAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Organization.objects.filter(memberships_user = user)

class OrganizationCreateView(generics.CreateAPIView):
    serializer_class = OrganizationCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Organization.objects.filter(memberships_user = self.request.user)

