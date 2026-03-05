from rest_framework import serializers
from .models import Organization , OrganizationMembership

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta :
        model = Organization
        fields = [
            "id",
            "name",
            "owner",
            "created_at"
        ]

class OrganizationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id" , "name"]
    
    def create(self ,validated_data):
        user = self.context["request"].user
        org = Organization.objects.create(owner = user , **validated_data)
        
        OrganizationMembership.objects.create(user= user , organization=org , role="ADMIN")

        return org