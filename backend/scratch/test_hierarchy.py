
import os
import django
import sys

# Setup django
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.organizations.models import Organization, OrganizationMembership
from apps.organizations.utils import can_manage_role, ROLE_RANK
from apps.invites.models import InviteCode
from apps.invites.views import JoinViaCodeView
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status

User = get_user_model()

def test_hierarchy():
    factory = APIRequestFactory()
    
    # 1. Setup Test Data
    print("--- Setting up test data ---")
    owner_user = User.objects.get_or_create(email="owner_h@test.local", defaults={"full_name":"Owner"})[0]
    org = Organization.objects.get_or_create(name="Hierarchy Org", owner=owner_user)[0]
    
    # Ensure owner membership
    OrganizationMembership.objects.get_or_create(user=owner_user, organization=org, role="OWNER")
    
    # Create subordinate roles
    u1 = User.objects.get_or_create(email="u1@test.local", defaults={"full_name":"U1"})[0]
    u2 = User.objects.get_or_create(email="u2@test.local", defaults={"full_name":"U2"})[0]
    u3 = User.objects.get_or_create(email="u3@test.local", defaults={"full_name":"U3"})[0]
    
    m1 = OrganizationMembership.objects.update_or_create(user=u1, organization=org, defaults={"role": "MANAGER"})[0]
    m2 = OrganizationMembership.objects.update_or_create(user=u2, organization=org, defaults={"role": "LEAD"})[0]
    m3 = OrganizationMembership.objects.update_or_create(user=u3, organization=org, defaults={"role": "MEMBER"})[0]

    # 2. Test can_manage_role logic
    print("\n--- Testing can_manage_role logic ---")
    tests = [
        ('OWNER', 'ADMIN', True),
        ('ADMIN', 'MANAGER', True),
        ('MANAGER', 'LEAD', True),
        ('LEAD', 'MEMBER', True),
        ('MANAGER', 'MANAGER', False), # Strict >
        ('LEAD', 'ADMIN', False),
    ]
    for r1, r2, expected in tests:
        res = can_manage_role(r1, r2)
        print(f"{r1} > {r2}? {res} (Expected: {expected})")
        assert res == expected

    # 3. Test Join Logic (Must force MEMBER)
    print("\n--- Testing Join Logic (Force MEMBER) ---")
    # Cleanup previous test code
    InviteCode.objects.filter(code="FORCE_MEMBER_TEST").delete()
    # Create a code that claims to be ADMIN (legacy or data-injected)
    invite = InviteCode.objects.create(entity_type="ORG", organization=org, role="ADMIN", code="FORCE_MEMBER_TEST")
    
    new_user = User.objects.get_or_create(email="v_joiner@test.local", defaults={"full_name":"Joiner"})[0]
    # Remove if exists
    OrganizationMembership.objects.filter(user=new_user, organization=org).delete()
    
    view = JoinViaCodeView.as_view()
    request = factory.post('/api/join/', {'code': 'FORCE_MEMBER_TEST'})
    force_authenticate(request, user=new_user)
    
    response = view(request)
    print(f"Join Response: {response.data}")
    
    membership = OrganizationMembership.objects.get(user=new_user, organization=org)
    print(f"Assigned Role: {membership.role}")
    assert membership.role == "MEMBER", f"Expected MEMBER, got {membership.role}"
    print("SUCCESS: Join code correctly ignored 'ADMIN' and assigned 'MEMBER'.")

    # 4. Test Membership Serializer Validation (Indirectly via Serializer directly)
    from apps.organizations.serializers import OrganizationMembershipWriteSerializer
    from rest_framework.viewsets import ModelViewSet
    
    print("\n--- Testing Serializer Validation ---")
    
    class MockView:
        kwargs = {"org_id": org.id}
        
    # Case: MANAGER tries to promote someone to ADMIN
    request = factory.post('/')
    request.user = u1 # MANAGER
    
    serializer = OrganizationMembershipWriteSerializer(
        data={"user": u3.id, "role": "ADMIN"},
        context={'request': request, 'view': MockView()}
    )
    
    if not serializer.is_valid():
        print(f"Caught invalid promotion (MANAGER -> ADMIN): {serializer.errors.get('non_field_errors')}")
        assert "Your role (MANAGER) is not high enough" in str(serializer.errors.get('non_field_errors'))
    else:
        print("FAILED: Manager was able to assign ADMIN role!")
        # assert False

    print("\nAll Hierarchy Tests Passed!")

if __name__ == "__main__":
    test_hierarchy()
