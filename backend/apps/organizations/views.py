from django.shortcuts import render
from rest_framework import generics
from .models import Organization
from .serializers import OrganizationSerializer , OrganizationCreateSerializer
from rest_framework.permissions import IsAuthenticated
from apps.common.permissions import IsManagerOrAdmin,IsOrganizationAdmin
# Create your views here.

class OrganizationListView(generics.ListAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated , IsManagerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        return Organization.objects.filter(memberships__user = user)

class OrganizationCreateView(generics.CreateAPIView):
    serializer_class = OrganizationCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Organization.objects.filter(memberships__user = self.request.user)

class OrganizationDeleteView(generics.DestroyAPIView):
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated, IsOrganizationAdmin]

    def get_queryset(self):
        return Organization.objects.filter(
            memberships__user=self.request.user
        )