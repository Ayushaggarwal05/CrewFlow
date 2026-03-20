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



#_______________________________________OrganizationMemberships_________________________

class OrganizationMembershipBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationMembership
        fields = [
            "id",
            "user",
            "organization",
            "role",
            "joined_at",
        ]

        read_only_fields = [
            "id",
            "organization",
            "joined_at",
        ]


class OrganizationMembershipSerializer(OrganizationMembershipBaseSerializer):
    pass

class OrganizationMembershipWriteSerializer(OrganizationMembershipBaseSerializer):

    class Meta(OrganizationMembershipBaseSerializer.Meta):
        fields = [
            "id",
            "user",
            "role"
        ]
    
    def create(self, validated_data):
        org_id = self.context["view"].kwargs["org_id"]
        organization = Organization.objects.get(id = org_id)
        membership = OrganizationMembership.objects.create(organization = organization , **validated_data)

        return membership