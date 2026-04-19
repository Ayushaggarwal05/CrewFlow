from .models import OrganizationMembership

# Hierarchy definition: Higher index = higher authority
ROLE_RANK = {
    'ADMIN': 3,
    'MANAGER': 2,
    'LEAD': 1,
    'MEMBER': 0
}

def is_admin(user, organization):
    """
    Checks if a user is an ADMIN of an organization.
    """
    if not (user and user.is_authenticated):
        return False
        
    return OrganizationMembership.objects.filter(
        user=user,
        organization=organization,
        role="ADMIN"
    ).exists()

def get_user_role(user, organization):
    """Returns the role string for a user in an organization."""
    if not (user and user.is_authenticated):
        return None
    
    mem = OrganizationMembership.objects.filter(user=user, organization=organization).first()
    return mem.role if mem else None

def can_manage_role(requester_role, target_role):
    """
    Returns True if requester_role is higher than or equal to target_role.
    Strictly forbids Non-Admins from managing Admins.
    """
    req_rank = ROLE_RANK.get(requester_role, -1)
    target_rank = ROLE_RANK.get(target_role, -1)

    if requester_role == 'ADMIN':
        return True
    
    # Non-admins can only manage roles strictly lower than OR equal to their own, 
    # but never an ADMIN.
    if target_role == 'ADMIN':
        return False
        
    return req_rank >= target_rank

def can_assign_role(requester_role, new_role):
    """
    Checks if a requester can promote/demote someone to new_role.
    """
    req_rank = ROLE_RANK.get(requester_role, -1)
    new_rank = ROLE_RANK.get(new_role, -1)

    if requester_role == 'ADMIN':
        return True
    
    if new_role == 'ADMIN':
        return False

    return req_rank >= new_rank

def can_view_join_codes(role):
    """Only ADMIN can view join codes."""
    return role == 'ADMIN'

def can_generate_join_codes(role):
    """Only ADMIN can generate join codes."""
    return role == 'ADMIN'

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
