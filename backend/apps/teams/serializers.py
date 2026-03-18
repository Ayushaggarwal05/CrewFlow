from rest_framework import serializers
from .models import Team , TeamMembership
from apps.organizations.models import Organization
from apps.users.models import User


#--------------------BASE-----------

class TeamBaseSerializer(serializers.ModelSerializer):

    members = serializers.PrimaryKeyRelatedField(many = True , read_only = True)
    class Meta :
        model = Team
        fields = [
            "id",
            "name",
            "organization",
            "members",
            "created_at"
        ]

        read_only_fields = [
            "id",
            "organization",
            "members",
            "created_at"
        ]

class TeamSerializer(TeamBaseSerializer):
    pass

class TeamWriteSerializer(TeamBaseSerializer):
    class Meta(TeamBaseSerializer.Meta):
        fields = [
            "id" , 
            "name"
        ]

    def create(self , validated_data):
        org_id = self.context["view"].kwargs["org_id"]

        organization = Organization.objects.get(id = org_id)

        team = Team.objects.create(organization = organization , **validated_data)
        return team
        



#_________________________________TEAMMEMBERSHIPS________________________________



#----------------------BASE-------------------

class TeamMembershipBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMembership
        fields = [
            "id",
            "user",
            "team",
            "role",
            "joined_at",
        ]

        read_only_fields = [
            "id",
            "team",
            "joined_at",
        ]

#---------------------READ-------------
class TeamMembershipSerializer(
    TeamMembershipBaseSerializer
):
    pass


#-------------------Write---------------
class TeamMembershipWriteSerializer(TeamMembershipBaseSerializer):
    class Meta(TeamMembershipBaseSerializer.Meta):
        fields = [
            "id",
            "user",
            "role",
        ]

    def create(self, validated_data):
        team_id = self.context["view"].kwargs["team_id"]

        team = Team.objects.get(id = team_id)
        membership = TeamMembership.objects.create(team = team , **validated_data)
        return membership