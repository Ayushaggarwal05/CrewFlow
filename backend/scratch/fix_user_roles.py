
import os
import django
import sys

# Setup django
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.organizations.models import OrganizationMembership
from apps.teams.models import TeamMembership
from django.db import transaction

def sync_roles():
    print("Starting role synchronization...")
    
    with transaction.atomic():
        # 1. Get all Organization Owners and Admins
        org_admins = OrganizationMembership.objects.filter(role__in=["OWNER", "ADMIN"])
        print(f"Found {org_admins.count()} organization authorities.")
        
        updates_count = 0
        for org_mem in org_admins:
            # Find all team memberships for this user in this organization
            team_memberships = TeamMembership.objects.filter(
                user=org_mem.user,
                team__organization=org_mem.organization
            ).exclude(role=org_mem.role)
            
            for tm in team_memberships:
                print(f"Promoting {org_mem.user.email} in Team: {tm.team.name} ({tm.role} -> {org_mem.role})")
                tm.role = org_mem.role
                tm.save()
                updates_count += 1
        
    print(f"\nFinished! Updated {updates_count} team memberships.")

if __name__ == "__main__":
    sync_roles()
