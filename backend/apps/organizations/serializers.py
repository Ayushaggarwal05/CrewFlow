from rest_framework import serializers
from .models import Organization , OrganizationMembership


# --------------BASE---------------

class OrganizationBaseSerializer(serializers.ModelSerializer):
    class Meta :
        model = Organization
        fields = [
            "id",
            "name",
            "owner",
            "created_at"
        ]
        read_only_fields = [
            "id",
            "owner",
            "created_at",
        ]

#--------------READ----------------        

class OrganizationSerializer(OrganizationBaseSerializer):
    pass
    

class OrganizationWriteSerializer(OrganizationBaseSerializer):
    class Meta(OrganizationBaseSerializer.Meta):
        fields = ["id" , "name"]
    
    def create(self ,validated_data):
        user = self.context["request"].user
        org = Organization.objects.create(owner = user , **validated_data)
        
        OrganizationMembership.objects.create(user= user , organization=org , role="ADMIN")

        return org