from apps.projects.models import ProjectMembership
from apps.organizations.utils import get_user_role

def get_project_role(user, project):
    """
    Returns the effective role of a user within a specific project.
    
    1. Tries to find an explicit ProjectMembership.
    2. Falls back to Organization role if not found.
       - ADMIN/MANAGER treated as "MANAGER" in project.
       - Otherwise returns None.
    """
    membership = ProjectMembership.objects.filter(user=user, project=project).first()
    if membership:
        return membership.role
        
    # Fallback to org role
    org_role = get_user_role(user, project.team.organization)
    if org_role in ["ADMIN", "MANAGER"]:
        return "MANAGER"
        
    return None
