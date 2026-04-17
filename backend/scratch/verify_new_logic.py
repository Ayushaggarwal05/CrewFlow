import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.organizations.models import Organization, OrganizationMembership
from apps.teams.models import Team, TeamMembership
from apps.projects.models import Project
from apps.invites.models import InviteCode
from rest_framework.test import APIRequestFactory, force_authenticate
from apps.invites.views import JoinViaCodeView
from apps.organizations.views import DashboardStatsView, OrganizationMembershipListCreateView
from django.utils import timezone
import uuid

User = get_user_model()

def verify():
    suffix = uuid.uuid4().hex[:6]
    owner = User.objects.create_user(email=f"owner_{suffix}@test.local", password="pass", full_name="Owner")
    manager = User.objects.create_user(email=f"manager_{suffix}@test.local", password="pass", full_name="Manager")
    member = User.objects.create_user(email=f"member_{suffix}@test.local", password="pass", full_name="Member")
    stranger = User.objects.create_user(email=f"stranger_{suffix}@test.local", password="pass", full_name="Stranger")

    org = Organization.objects.create(name=f"Org {suffix}", owner=owner)
    OrganizationMembership.objects.create(user=owner, organization=org, role="ADMIN")
    
    # 1. Test Invite Code Generation & Join
    print("--- Testing Join Codes ---")
    invite = InviteCode.objects.create(entity_type="ORG", organization=org, role="MANAGER")
    
    factory = APIRequestFactory()
    view = JoinViaCodeView.as_view()
    
    # Invalid code
    request = factory.post('/api/join/', {'code': 'INVALID'})
    force_authenticate(request, user=manager)
    res = view(request)
    print(f"Test Invalid Code: {res.status_code == 404} (Expected 404)")

    # Join as Manager
    request = factory.post('/api/join/', {'code': invite.code})
    force_authenticate(request, user=manager)
    res = view(request)
    print(f"Test Join Org: {res.status_code == 201} (Expected 201)")
    
    # Join again (Conflict)
    res = view(request)
    print(f"Test Already Member: {res.status_code == 409} (Expected 409) - {res.data.get('detail')}")

    # Set manager for member
    manager_membership = OrganizationMembership.objects.get(user=manager, organization=org)
    member_membership = OrganizationMembership.objects.create(user=member, organization=org, role="MEMBER", manager=manager_membership)

    # 2. Test Visibility Logic
    print("\n--- Testing Visibility Logic ---")
    list_view = OrganizationMembershipListCreateView.as_view()
    
    # Admin see all
    request = factory.get('/')
    force_authenticate(request, user=owner)
    res = list_view(request, org_id=org.id)
    print(f"Admin visible count: {len(res.data['results'])} (Expected 3: Owner, Manager, Member)")

    # Manager see subordinate
    request = factory.get('/')
    force_authenticate(request, user=manager)
    res = list_view(request, org_id=org.id)
    print(f"Manager visible count: {len(res.data['results'])} (Expected 1: Member)")

    # Member see self + manager (+ colleagues later)
    request = factory.get('/')
    force_authenticate(request, user=member)
    res = list_view(request, org_id=org.id)
    print(f"Member visible count: {len(res.data['results'])} (Expected 2: Self, Manager)")

    # 3. Test Scoped Stats
    print("\n--- Testing Scoped Stats ---")
    stats_view = DashboardStatsView.as_view()
    
    request = factory.get(f'/api/dashboard/stats/?org_id={org.id}')
    force_authenticate(request, user=owner)
    res = stats_view(request)
    print(f"Stats Teams: {res.data['teams_count']}, Projects: {res.data['projects_count']}")

if __name__ == "__main__":
    verify()
