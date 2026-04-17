
import os
import django
import sys

# Setup django
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.organizations.models import Organization, OrganizationMembership
from django.contrib.auth import get_user_model

User = get_user_model()

def check_data():
    print("Checking organization ownership and memberships...")
    orgs = Organization.objects.all()
    for org in orgs:
        print(f"\nOrganization: {org.name} (ID: {org.id})")
        print(f"  Official Owner (from model): {org.owner.email} (ID: {org.owner.id})")
        
        memberships = OrganizationMembership.objects.filter(organization=org)
        for m in memberships:
            print(f"  Member: {m.user.email} (ID: {m.user.id}), Role: {m.role}")

if __name__ == "__main__":
    check_data()
