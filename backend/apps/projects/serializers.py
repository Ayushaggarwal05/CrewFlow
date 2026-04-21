from rest_framework import serializers
from rest_framework.exceptions import NotFound, PermissionDenied
from .models import Project, ProjectMembership
from apps.teams.models import Team
from apps.organizations.utils import is_admin, get_user_role, can_view_join_codes, get_effective_role


# ── Project Membership (read-only) ──────────────────────────────────────────
class ProjectMembershipSerializer(serializers.ModelSerializer):
    user_full_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()

    class Meta:
        model = ProjectMembership
        fields = ["id", "user", "user_full_name", "user_email", "role", "role_display", "joined_at"]
        read_only_fields = fields

    def get_user_full_name(self, obj):
        return getattr(obj.user, "full_name", None) or obj.user.email

    def get_user_email(self, obj):
        return obj.user.email

    def get_role_display(self, obj):
        return obj.get_role_display()


#-----------------Base_----------------
class ProjectBaseSerializer(serializers.ModelSerializer):
    join_code = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "team",
            "created_by",
            "deadline",
            "status",
            "created_at",
            "join_code",
            "user_role",
        ]
        read_only_fields = [
            "id",
            "team",
            "created_by",
            "created_at",
            "join_code",
            "user_role",
        ]

    def get_join_code(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        
        user_role = get_user_role(request.user, obj.team.organization)
        if can_view_join_codes(user_role):
            invite = obj.invite_codes.filter(is_active=True).first()
            return invite.code if invite else None
        return None

    def get_user_role(self, obj):
        request = self.context.get("request")
        if not (request and request.user.is_authenticated):
            return None
        return get_effective_role(request.user, obj.team.organization, team=obj.team)

#_-------------------------READ-----------------
class ProjectSerializer(ProjectBaseSerializer):
    pass

class ProjectWriteSerializer(ProjectBaseSerializer):
    class Meta(ProjectBaseSerializer.Meta):
        fields = [
            "id",
            "name" , 
            "description",
            "status",
            "deadline"
        ]
    
    def create(self , validated_data):
        request = self.context["request"]
        team_id = self.context["view"].kwargs["team_id"]
        team = Team.objects.select_related("organization").filter(id=team_id).first()
        if not team:
            raise NotFound(detail="Team not found")

        # Safety net: view permission should already enforce this for POST.
        is_member = team.organization.memberships.filter(user=request.user).exists()
        if not is_member:
            raise PermissionDenied(detail="You are not a member of this organization")

        project  = Project.objects.create(team = team , created_by  = request.user , **validated_data)
        return project