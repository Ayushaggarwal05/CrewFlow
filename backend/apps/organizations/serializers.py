from rest_framework import serializers
from .models import Organization , OrganizationMembership
from .utils import is_admin_or_owner, get_user_role, can_manage_role, can_view_join_codes



# --------------BASE---------------

class OrganizationBaseSerializer(serializers.ModelSerializer):
    join_code = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = [
            "id",
            "name",
            "owner",
            "created_at",
            "join_code",
            "user_role",
        ]
        read_only_fields = [
            "id",
            "owner",
            "created_at",
            "join_code",
        ]

    def get_join_code(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        
        user_role = get_user_role(request.user, obj)
        if can_view_join_codes(user_role):
            invite = obj.invite_codes.filter(is_active=True).first()
            return invite.code if invite else None
        return None

    def get_user_role(self, obj):
        request = self.context.get("request")
        if not (request and request.user.is_authenticated):
            return None
        membership = OrganizationMembership.objects.filter(user=request.user, organization=obj).first()
        return membership.role if membership else None



#--------------READ----------------        

class OrganizationSerializer(OrganizationBaseSerializer):
    pass
    

class OrganizationWriteSerializer(OrganizationBaseSerializer):
    class Meta(OrganizationBaseSerializer.Meta):
        fields = ["id" , "name"]
    
    def create(self ,validated_data):
        user = self.context["request"].user
        org = Organization.objects.create(owner = user , **validated_data)
        
        OrganizationMembership.objects.create(user= user , organization=org , role="OWNER")

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
            "manager",
            "joined_at",
        ]

        read_only_fields = [
            "id",
            "organization",
            "joined_at",
        ]


class OrganizationMembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)
    manager_name = serializers.CharField(source="manager.user.full_name", read_only=True)
    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = OrganizationMembership
        fields = [
            "id",
            "organization",
            "user",
            "user_email",
            "user_full_name",
            "role",
            "role_display",
            "manager",
            "manager_name",
            "joined_at",
        ]
        read_only_fields = ["joined_at"]

class OrganizationMembershipWriteSerializer(OrganizationMembershipBaseSerializer):

    class Meta(OrganizationMembershipBaseSerializer.Meta):
        fields = [
            "id",
            "user",
            "role",
            "manager"
        ]

    def validate(self, attrs):
        request = self.context.get("request")
        if not request:
            return attrs
        
        # 1. Determine the organization context
        org_id = self.context["view"].kwargs.get("org_id")
        try:
            organization = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            raise serializers.ValidationError({"organization": "Organization not found."})

        # 2. Get requester's role
        requester_role = get_user_role(request.user, organization)
        if not requester_role:
            raise serializers.ValidationError("You are not a member of this organization.")

        # 3. Hierarchy Check: Assigning/Updating to a role
        target_role = attrs.get("role")
        if target_role:
            if not can_manage_role(requester_role, target_role):
                raise serializers.ValidationError(
                    f"You cannot assign the {target_role} role. Your role ({requester_role}) is not high enough."
                )

        # 4. Hierarchy Check: Managing an existing member
        if self.instance:
            current_role = self.instance.role
            if not can_manage_role(requester_role, current_role):
                raise serializers.ValidationError(
                    f"You cannot manage this member. Your role ({requester_role}) must be higher than their current role ({current_role})."
                )

        return attrs
    
    def create(self, validated_data):
        org_id = self.context["view"].kwargs["org_id"]
        organization = Organization.objects.get(id = org_id)
        membership = OrganizationMembership.objects.create(organization = organization , **validated_data)

        return membership