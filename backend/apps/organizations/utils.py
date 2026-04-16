from .models import OrganizationMembership

def is_admin_or_owner(user, organization):
    """
    Checks if a user is an ADMIN or OWNER of an organization.
    """
    if not (user and user.is_authenticated):
        return False
        
    # Check if user is the direct owner of the organization
    if organization.owner == user:
        return True
        
    # Check if user has an ADMIN role in OrganizationMembership
    return OrganizationMembership.objects.filter(
        user=user,
        organization=organization,
        role="ADMIN"
    ).exists()
