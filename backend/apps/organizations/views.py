from django.shortcuts import render
from rest_framework import generics
from .models import Organization , OrganizationMembership
from .serializers import OrganizationSerializer , OrganizationWriteSerializer , OrganizationMembershipSerializer , OrganizationMembershipWriteSerializer
from rest_framework.permissions import IsAuthenticated
from apps.common.permissions import IsManagerOrAdmin,IsOrganizationAdmin
# Create your views here.



#------------------List and create ---------------

class OrganizationListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated,]

    filterset_fields = [                                   #drop down/filter
        "owner",
    ]

    search_fields = ["name"]                                #search box
    ordering_fields = ["created_at"]                        #sort

    def get_queryset(self):
        user = self.request.user

        return Organization.objects.filter(memberships__user = user).distinct()
    
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


#_______________________________________organizationmembership___________________________


class OrganizationMembershipListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated , IsOrganizationAdmin]

    filterset_fields = [
        "role",
        "user",
    ]

    search_fields = [
        "user__email",
    ]

    ordering_fields = [
        "joined_at",
    ]

    def get_queryset(self):
        user= self.request.user
        org_id = self.kwargs["org_id"]

        return OrganizationMembership.objects.filter(organization__id = org_id , organization__memberships__user = user).distinct()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return OrganizationMembershipWriteSerializer
        return OrganizationMembershipSerializer
    


class OrganizationMembershipDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated , IsOrganizationAdmin]

    def get_queryset(self):
        user= self.request.user
        org_id = self.kwargs["org_id"]

        return OrganizationMembership.objects.filter(organization__id = org_id , organization__memberships__user = user).distinct()

    def get_serializer_class(self):
        if self.request.method in ["PUT" , "PATCH"]:
            return OrganizationMembershipWriteSerializer
        return OrganizationMembershipSerializer