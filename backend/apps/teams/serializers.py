from rest_framework import serializers
from .models import Team , TeamMembership
from apps.organizations.models import Organization
from apps.organizations.utils import is_admin, get_user_role, can_view_join_codes, get_effective_role
from apps.users.models import User



#--------------------BASE-----------

class TeamBaseSerializer(serializers.ModelSerializer):

    members = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    join_code = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    manager = serializers.PrimaryKeyRelatedField(read_only=True)
    manager_name = serializers.SerializerMethodField()


    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "organization",
            "members",
            "manager",
            "manager_name",
            "created_at",
            "join_code",
            "user_role",
        ]

        read_only_fields = [
            "id",
            "organization",
            "members",
            "manager",
            "manager_name",
            "created_at",
            "join_code",
            "user_role",
        ]

    def get_join_code(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        
        user_role = get_user_role(request.user, obj.organization)
        if can_view_join_codes(user_role):
            invite = obj.invite_codes.filter(is_active=True).first()
            return invite.code if invite else None
        return None

    def get_user_role(self, obj):
        request = self.context.get("request")
        if not (request and request.user.is_authenticated):
            return None
        return get_effective_role(request.user, obj.organization, team=obj)

    def get_manager_name(self, obj):
        if obj.manager:
            return obj.manager.full_name or obj.manager.email
        return None


class TeamSerializer(TeamBaseSerializer):
    pass

class TeamWriteSerializer(TeamBaseSerializer):
    class Meta(TeamBaseSerializer.Meta):
        fields = [
            "id" , 
            "name"
        ]

    def create(self, validated_data):
        org_id = self.context["view"].kwargs["org_id"]
        request = self.context.get("request")

        organization = Organization.objects.get(id=org_id)

        team = Team.objects.create(
            organization=organization,
            manager=request.user if request else None,
            **validated_data,
        )

        # Auto-enroll the creator as MANAGER of the team they just created
        if request and request.user:
            TeamMembership.objects.get_or_create(
                team=team,
                user=request.user,
                defaults={"role": "MANAGER"},
            )

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
class TeamMembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)
    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = TeamMembership
        fields = [
            "id",
            "team",
            "user",
            "user_email",
            "user_full_name",
            "role",
            "role_display",
            "joined_at",
        ]
        read_only_fields = ["joined_at"]


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