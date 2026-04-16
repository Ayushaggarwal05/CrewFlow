import os
import django
import sys

# Setup django
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.organizations.models import Organization, OrganizationMembership
from apps.teams.models import Team, TeamMembership
from apps.invites.views import JoinViaCodeView, GenerateOrgCodeView
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate

User = get_user_model()

def verify():
    factory = APIRequestFactory()
    
    # 1. Setup test data
    owner = User.objects.get_or_create(email="owner_role@test.local", defaults={"full_name": "Owner"})[0]
    org = Organization.objects.get_or_create(name="Role Test Org", owner=owner)[0]
    
    # 2. Test Admin Regenerating Code with Specific Role
    print("\n--- Testing Role Regeneration ---")
    gen_view = GenerateOrgCodeView.as_view()
    
    # Regenerate as ADMIN role
    request = factory.post('/', {'role': 'ADMIN'}, format='json')
    force_authenticate(request, user=owner)
    res = gen_view(request, pk=org.id)
    print(f"Regenerate ADMIN code: {res.status_code} | Role: {res.data.get('join_role')}")
    admin_code = res.data.get('join_code')
    
    # 3. Test User Joining with ADMIN-role code
    print("\n--- Testing Join with ADMIN-role code ---")
    joiner = User.objects.get_or_create(email="joiner_admin@test.local", defaults={"full_name": "Joiner Admin"})[0]
    # Remove existing membership if any
    OrganizationMembership.objects.filter(user=joiner, organization=org).delete()

    join_view = JoinViaCodeView.as_view()
    request = factory.post('/', {'code': admin_code}, format='json')
    force_authenticate(request, user=joiner)
    res = join_view(request)
    print(f"Join Status: {res.status_code}")
    
    membership = OrganizationMembership.objects.get(user=joiner, organization=org)
    print(f"Assigned Role: {membership.role} | Expected: ADMIN | Status: {'PASS' if membership.role == 'ADMIN' else 'FAIL'}")

    # 4. Test User Joining with DEFAULT-role code (DEVELOPER)
    print("\n--- Testing Join with DEVELOPER-role code ---")
    request = factory.post('/', {'role': 'DEVELOPER'}, format='json')
    force_authenticate(request, user=owner)
    res = gen_view(request, pk=org.id)
    dev_code = res.data.get('join_code')

    joiner2 = User.objects.get_or_create(email="joiner_dev@test.local", defaults={"full_name": "Joiner Dev"})[0]
    OrganizationMembership.objects.filter(user=joiner2, organization=org).delete()
    
    request = factory.post('/', {'code': dev_code}, format='json')
    force_authenticate(request, user=joiner2)
    res = join_view(request)
    
    membership2 = OrganizationMembership.objects.get(user=joiner2, organization=org)
    print(f"Assigned Role: {membership2.role} | Expected: DEVELOPER | Status: {'PASS' if membership2.role == 'DEVELOPER' else 'FAIL'}")

if __name__ == "__main__":
    verify()
