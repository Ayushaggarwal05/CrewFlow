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
        user = request.user

        return OrganizationMembership.objects.filter(
            user=user,
            role__in=["ADMIN", "MANAGER"]
        ).exists()