from .models import OrganizationMembership

# Hierarchy definition: Higher index = higher authority
ROLE_RANK = {
    'OWNER': 4,
    'ADMIN': 3,
    'MANAGER': 2,
    'LEAD': 1,
    'MEMBER': 0
}

def is_admin_or_owner(user, organization):
    """
    Checks if a user is an ADMIN or OWNER of an organization.
    Useful for general access permissions.
    """
    if not (user and user.is_authenticated):
        return False
        
    if organization.owner_id == user.id:
        return True
        
    return OrganizationMembership.objects.filter(
        user=user,
        organization=organization,
        role__in=["OWNER", "ADMIN"]
    ).exists()

def get_user_role(user, organization):
    """Returns the role string for a user in an organization."""
    if not (user and user.is_authenticated):
        return None
    
    # Direct owner check
    if organization.owner_id == user.id:
        return 'OWNER'
        
    mem = OrganizationMembership.objects.filter(user=user, organization=organization).first()
    return mem.role if mem else None

def can_manage_role(requester_role, target_role):
    """
    Returns True if requester_role is strictly higher than target_role.
    """
    req_rank = ROLE_RANK.get(requester_role, -1)
    target_rank = ROLE_RANK.get(target_role, -1)
    return req_rank > target_rank

def can_view_join_codes(role):
    """OWNER, ADMIN, and MANAGER can view join codes."""
    return ROLE_RANK.get(role, -1) >= ROLE_RANK['MANAGER']

def can_generate_join_codes(role):
    """Only OWNER and ADMIN can generate join codes."""
    return ROLE_RANK.get(role, -1) >= ROLE_RANK['ADMIN']

def get_effective_role(user, organization, team=None):
    """
    Returns the highest role for a user.
    If they are an Org Owner/Admin, that role is returned even if 
    their team role is lower.
    """
    org_role = get_user_role(user, organization)
    
    if not team:
        return org_role
    
    # Try to get team role
    from apps.teams.models import TeamMembership
    team_mem = TeamMembership.objects.filter(user=user, team=team).first()
    team_role = team_mem.role if team_mem else None
    
    # Compare ranks
    org_rank = ROLE_RANK.get(org_role, -1)
    team_rank = ROLE_RANK.get(team_role, -1)
    
    return org_role if org_rank >= team_rank else team_role
