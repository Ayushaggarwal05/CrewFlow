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

def verify():
    # 1. Setup test data
    owner = User.objects.get_or_create(email="owner@test.com", defaults={"full_name": "owner"})[0]
    admin = User.objects.get_or_create(email="admin@test.com", defaults={"full_name": "admin"})[0]
    member = User.objects.get_or_create(email="member@test.com", defaults={"full_name": "member"})[0]

    
    org = Organization.objects.get_or_create(name="Security Test Org", owner=owner)[0]
    org.join_code = "ORG-SECURE123"
    org.save()
    
    OrganizationMembership.objects.get_or_create(user=admin, organization=org, role="ADMIN")
    OrganizationMembership.objects.get_or_create(user=member, organization=org, role="DEVELOPER")
    
    team = Team.objects.get_or_create(name="Security Test Team", organization=org)[0]
    team.join_code = "TEAM-SECURE123"
    team.save()
    
    factory = APIRequestFactory()
    
    print("\n--- Verifying Organization Serializer ---")
    
    users = [("Owner", owner, True), ("Admin", admin, True), ("Member", member, False)]
    
    for label, user, should_see in users:
        request = factory.get('/')
        request.user = user
        serializer = OrganizationSerializer(org, context={'request': request})
        data = serializer.data
        code = data.get('join_code')
        
        status = "PASS" if (code is not None if should_see else code is None) else "FAIL"
        print(f"[{label}] Join Code visible: {code is not None} | Expected: {should_see} | Status: {status}")

    print("\n--- Verifying Team Serializer ---")
    
    for label, user, should_see in users:
        request = factory.get('/')
        request.user = user
        serializer = TeamSerializer(team, context={'request': request})
        data = serializer.data
        code = data.get('join_code')
        
        status = "PASS" if (code is not None if should_see else code is None) else "FAIL"
        print(f"[{label}] Join Code visible: {code is not None} | Expected: {should_see} | Status: {status}")

if __name__ == "__main__":
    verify()
