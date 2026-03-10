from rest_framework.permissions import BasePermission
from .models import OrganizationMembership

class IsOrganizationMember(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        return OrganizationMembership.objects.filter(user=user).exists()


class IsOrganizationAdmin(BaseException):
    
    def has_permission(self,request , view):
        user = request.user

        return OrganizationMembership.objects.filter(
            user=user,
            role="ADMIN"
        ).exists()
    
class IsDeveloperOrAbove(BasePermission):

    def has_permission(self, request, view):
        user = request.user

        return OrganizationMembership.objects.filter(
            user=user,
            role__in=["ADMIN", "MANAGER", "DEVELOPER"]
        ).exists()
    

class IsManagerOrAdmin(BasePermission):

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        user = request.user

        if hasattr(obj , "organization"):
            organization  = obj.organization
        elif hasattr(obj , "team"):
            organization = obj.team.organization
        elif hasattr(obj , "project"):
            organization = obj.project.team.organization
        elif hasattr(obj, "task"):
            organization = obj.task.project.team.organization
        else:
            return False
        
        membership = OrganizationMembership.objects.filter(user = user , organization = organization , role__in = ["ADMIN" , 'MANAGER']).exists()
        return membership