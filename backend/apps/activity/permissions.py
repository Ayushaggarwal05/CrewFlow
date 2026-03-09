from rest_framework.permissions import BasePermission

class IsOrganizationMember(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False
        
        return user.organization_memberships.exists()