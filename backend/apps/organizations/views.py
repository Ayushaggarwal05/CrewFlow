from django.shortcuts import render
from rest_framework import generics
from .models import Organization
from .serializers import OrganizationSerializer , OrganizationWriteSerializer
from rest_framework.permissions import IsAuthenticated
from apps.common.permissions import IsManagerOrAdmin,IsOrganizationAdmin
# Create your views here.



#------------------List and create ---------------

class OrganizationListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated,]

    def get_queryset(self):
        user = self.request.user

        return Organization.objects.filter(memberships__user = user)
    
    def get_serializer_class(self):
        if self.request.method == "POST":
            return OrganizationWriteSerializer
        return OrganizationSerializer


#----------------Update , Delete , Detail-------------

class OrganizationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated , IsOrganizationAdmin]

    def get_queryset(self):
        user = self.request.user
        return Organization.objects.filter(memberships__user = user)

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return OrganizationWriteSerializer

        return OrganizationSerializer
