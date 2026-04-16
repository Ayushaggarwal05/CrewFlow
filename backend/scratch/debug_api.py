
import os
import django
import sys

# Setup django
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.organizations.models import Organization, OrganizationMembership
from apps.organizations.serializers import OrganizationSerializer
from apps.teams.models import Team
from apps.teams.serializers import TeamSerializer
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory

User = get_user_model()

def debug():
    factory = APIRequestFactory()
    
    # Try to find an existing organization
    org = Organization.objects.first()
    if not org:
        print("No organization found. Creating one...")
        owner = User.objects.get_or_create(email="owner@test.local", defaults={"full_name":"Owner"})[0]
        org = Organization.objects.create(name="Test Org", owner=owner)
    else:
        owner = org.owner

    member = User.objects.get_or_create(email="member@test.local", defaults={"full_name":"Member"})[0]
    # Ensure they are a member
    OrganizationMembership.objects.get_or_create(user=member, organization=org, role="DEVELOPER")
    
    print(f"Testing with Organization: {org.name} (ID: {org.id}) as Member: {member.email}")
    
    # 1. Test Organization Serializer
    request = factory.get('/')
    request.user = member

    
    try:
        print("Serializing Organization...")
        serializer = OrganizationSerializer(org, context={'request': request})
        print(f"Result: {serializer.data}")
    except Exception as e:
        print(f"OrganizationSerializer failed: {e}")
        import traceback
        traceback.print_exc()

    # 2. Test Team Serializer
    team = Team.objects.filter(organization=org).first()
    if not team:
        print("No team found for this org. Creating one...")
        team = Team.objects.create(name="Test Team", organization=org)
    
    print(f"Testing with Team: {team.name} (ID: {team.id})")
    
    # 3. Test View Permissions
    from apps.organizations.views import OrganizationDetailView
    from rest_framework.test import force_authenticate
    print("\n--- Testing OrganizationDetailView Permissions ---")
    view = OrganizationDetailView.as_view()
    
    try:
        # Re-mock the request but use force_authenticate
        request = factory.get('/')
        force_authenticate(request, user=member)
        response = view(request, pk=org.id)
        print(f"Response Status: {response.status_code}")
        if response.status_code == 200:
            print("SUCCESS: Member can now view organization details (permissions relaxed).")
        elif response.status_code == 403:
            print("ALERT: Member is still FORBIDDEN from viewing organization details!")
    except Exception as e:
        print(f"View execution failed: {e}")



if __name__ == "__main__":
    debug()
