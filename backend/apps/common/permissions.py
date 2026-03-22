from rest_framework.permissions import BasePermission
from apps.organizations.models import OrganizationMembership

def get_organization_from_obj(obj):
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
    
class IsDeveloperOrAbove(BasePermission):

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
            role__in=["ADMIN", "MANAGER", "DEVELOPER"]
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