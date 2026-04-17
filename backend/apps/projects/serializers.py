from rest_framework import serializers
from rest_framework.exceptions import NotFound, PermissionDenied
from .models import Project
from apps.teams.models import Team
from apps.organizations.models import OrganizationMembership


#-----------------Base_----------------
class ProjectBaseSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        user = getattr(request, "user", None)

        # Only ORG OWNER / ADMIN / MANAGER can view project join-code fields.
        can_view_codes = False
        if user and user.is_authenticated:
            org = getattr(getattr(instance, "team", None), "organization", None)
            if org and getattr(org, "owner_id", None) == getattr(user, "id", None):
                can_view_codes = True
            elif org:
                can_view_codes = OrganizationMembership.objects.filter(
                    user=user,
                    organization=org,
                    role__in=["ADMIN", "MANAGER"],
                ).exists()

        if not can_view_codes:
            data["join_code"] = None
            data["code_is_active"] = None
            data["code_expires_at"] = None

        return data

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
            "code_is_active",
            "code_expires_at",
        ]
        read_only_fields = [
            "id",
            "team",
            "created_by",
            "created_at",
            "join_code",
            "code_is_active",
            "code_expires_at",
        ]

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