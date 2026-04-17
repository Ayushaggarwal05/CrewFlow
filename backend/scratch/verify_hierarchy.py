import os
import django
import sys

# Setup django
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.organizations.models import Organization, OrganizationMembership
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

def verify():
    import uuid
    # 1. Setup test data
    suffix = uuid.uuid4().hex[:6]
    unique_org_name = f"Hierarchy Org {suffix}"
    owner = User.objects.get_or_create(email=f"owner_{suffix}@test.local", defaults={"full_name": "Owner H"})[0]
    org = Organization.objects.create(name=unique_org_name, owner=owner)
    
    # Ensure owner is Admin
    owner_mem, _ = OrganizationMembership.objects.get_or_create(user=owner, organization=org, defaults={"role": "ADMIN"})
    
    user1 = User.objects.get_or_create(email=f"u1_{suffix}@test.local", defaults={"full_name": "User 1"})[0]
    user2 = User.objects.get_or_create(email=f"u2_{suffix}@test.local", defaults={"full_name": "User 2"})[0]
    user3 = User.objects.get_or_create(email=f"u3_{suffix}@test.local", defaults={"full_name": "User 3"})[0]


    
    m1, _ = OrganizationMembership.objects.update_or_create(user=user1, organization=org, defaults={"role": "MANAGER"})
    m2, _ = OrganizationMembership.objects.update_or_create(user=user2, organization=org, defaults={"role": "LEAD"})
    m3, _ = OrganizationMembership.objects.update_or_create(user=user3, organization=org, defaults={"role": "MEMBER"})

    
    print("\n--- Testing Hierarchy Constraints ---")
    
    # Test 1: Set self as manager
    print("Test 1: Self as manager...")
    try:
        m1.manager = m1
        m1.save()
        print("FAIL: Managed to set self as manager")
    except ValidationError as e:
        print(f"PASS: Caught expected error: {e}")
    m1.refresh_from_db()

    # Test 2: Valid assignment (M2 managed by M1)
    print("Test 2: Valid assignment (M2 managed by M1)...")
    m2.manager = m1
    m2.save()
    print("PASS: Valid assignment worked")

    # Test 3: Circular hierarchy (M1 managed by M2)
    print("Test 3: Circular hierarchy (M1 managed by M2)...")
    try:
        m1.manager = m2
        m1.save()
        print("FAIL: Managed to create circular hierarchy")
    except ValidationError as e:
        print(f"PASS: Caught expected error: {e}")
    
    # Test 4: Same organization check
    print("Test 4: Cross-org assignment...")
    org2 = Organization.objects.get_or_create(name="Other Org", owner=owner)[0]
    m_other = OrganizationMembership.objects.create(user=user3, organization=org2, role="MEMBER")
    try:
        m1.manager = m_other
        m1.save()
        print("FAIL: Managed to assign cross-org manager")
    except ValidationError as e:
        print(f"PASS: Caught expected error: {e}")

    print("\n--- Testing Visibility Logic ---")
    from apps.organizations.views import OrganizationMembershipListCreateView
    from rest_framework.test import APIRequestFactory, force_authenticate
    factory = APIRequestFactory()
    view = OrganizationMembershipListCreateView.as_view()

    def get_count(res_data):
        if isinstance(res_data, dict) and 'results' in res_data:
            return len(res_data['results'])
        return len(res_data)

    # Admin visibility
    print("Testing Admin visibility...")
    request = factory.get('/')
    force_authenticate(request, user=owner)
    res = view(request, org_id=org.id)
    print(f"Admin saw {get_count(res.data)} members (expected all 4)")

    # Manager visibility (M1)
    print("Testing Manager visibility...")
    request = factory.get('/')
    force_authenticate(request, user=user1)
    res = view(request, org_id=org.id)
    print(f"Manager saw {get_count(res.data)} members (expected only subordinates: m2)")

    # Member visibility (M3)
    print("Testing Member visibility...")
    request = factory.get('/')
    force_authenticate(request, user=user3)
    res = view(request, org_id=org.id)
    print(f"Member saw {get_count(res.data)} members (expected only self)")


if __name__ == "__main__":
    verify()
