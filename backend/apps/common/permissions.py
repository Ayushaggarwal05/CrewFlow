from rest_framework.permissions import BasePermission
from apps.organizations.models import OrganizationMembership

from apps.organizations.models import Organization

def get_organization_from_obj(obj):
    if isinstance(obj, Organization):
        return obj
    if hasattr(obj, "organization"):
        return obj.organization
    if hasattr(obj, "team"):
        return obj.team.organization
    if hasattr(obj, "project"):
        return obj.project.team.organization
    if hasattr(obj, "task"):
        return obj.task.project.team.organization
    return None

class IsAuthenticatedAndMember(BasePermission):

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    

class IsOrganizationMember(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    

    def has_object_permission(self, request, view, obj):
        user = request.user
        organization= get_organization_from_obj(obj)

        if not organization:
            return False
        
        return OrganizationMembership.objects.filter(user= user , organization = organization).exists()


class IsManagerOrAdmin(BasePermission):

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        organization= get_organization_from_obj(obj)

        if not organization:
            return False
        
        return OrganizationMembership.objects.filter(
            user=user,
            organization=organization,
            role__in=["ADMIN", "MANAGER"]
        ).exists()
    
class IsLeadOrAbove(BasePermission):

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        organization= get_organization_from_obj(obj)

        if not organization:
            return False
        
        return OrganizationMembership.objects.filter(
            user=user,
            organization=organization,
            role__in=["ADMIN", "MANAGER", "LEAD"]
        ).exists()
    
class IsMemberOrAbove(BasePermission):

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        organization= get_organization_from_obj(obj)

        if not organization:
            return False
        
        return OrganizationMembership.objects.filter(
            user=user,
            organization=organization,
            role__in=["ADMIN", "MANAGER", "LEAD", "MEMBER"]
        ).exists()

class IsOrganizationAdmin(BasePermission):

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        organization = get_organization_from_obj(obj)

        if not organization:
            return False

        return OrganizationMembership.objects.filter(
            user=user,
            organization=organization,
            role="ADMIN",
        ).exists()

    

class IsTeamManagerOrAdminFromURL(BasePermission):
    """
    Permission for endpoints that receive `team_id` in the URL.

    Useful for create/list endpoints where object-level permissions
    aren't evaluated (e.g. ListCreateAPIView on POST).
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        team_id = getattr(view, "kwargs", {}).get("team_id")
        if not team_id:
            return False

        # Import lazily to avoid circular imports.
        from apps.teams.models import Team

        team = Team.objects.select_related("organization").filter(id=team_id).first()
        if not team:
            # Let the view/serializer raise 404; deny here to avoid leaking info.
            return False

        return OrganizationMembership.objects.filter(
            user=request.user,
            organization=team.organization,
            role__in=["ADMIN", "MANAGER", "LEAD"],
        ).exists()