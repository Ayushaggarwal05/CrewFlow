
import os
import django
import sys

# Setup django
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.organizations.models import Organization, OrganizationMembership
from apps.teams.models import Team, TeamMembership
from django.contrib.auth import get_user_model

User = get_user_model()

def check_user():
    email = "aayushaggarwal348@gmail.com"
    try:
        user = User.objects.get(email=email)
        print(f"User: {user.full_name} ({user.email}) [ID: {user.id}]")
        
        print("\n--- Organization Memberships ---")
        org_mems = OrganizationMembership.objects.filter(user=user)
        for om in org_mems:
            is_direct_owner = om.organization.owner_id == user.id
            print(f"Org: {om.organization.name} | Role in Table: {om.role} | DB Owner: {is_direct_owner}")
            
        print("\n--- Team Memberships ---")
        team_mems = TeamMembership.objects.filter(user=user)
        for tm in team_mems:
            print(f"Team: {tm.team.name} | Org: {tm.team.organization.name} | Role: {tm.role}")
            
    except User.DoesNotExist:
        print("User not found.")

if __name__ == "__main__":
    check_user()
