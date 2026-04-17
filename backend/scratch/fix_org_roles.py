
import os
import django
import sys

# Setup django
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.organizations.models import Organization, OrganizationMembership

def fix_roles():
    print("Starting organization role correction...")
    orgs = Organization.objects.all()
    count = 0
    updated = 0
    created = 0

    for org in orgs:
        count += 1
        owner = org.owner
        
        # Check if membership exists for the creator
        membership, was_created = OrganizationMembership.objects.get_or_create(
            user=owner,
            organization=org,
            defaults={'role': 'OWNER'}
        )

        if was_created:
            print(f"CREATED: OWNER membership for {owner.email} in {org.name}")
            created += 1
        elif membership.role != "OWNER":
            old_role = membership.role
            membership.role = "OWNER"
            membership.save()
            print(f"UPDATED: {owner.email} in {org.name} from {old_role} to OWNER")
            updated += 1
        else:
            # Already OWNER, do nothing
            pass

    print(f"\nFinished! Processed {count} organizations.")
    print(f"Created: {created}, Updated: {updated}")

if __name__ == "__main__":
    fix_roles()
