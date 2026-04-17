
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
from apps.projects.models import Project
from apps.projects.serializers import ProjectSerializer
from apps.invites.views import GenerateProjectCodeView
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate

User = get_user_model()

def debug():
    factory = APIRequestFactory()
    
    # Target our specific owner who reported issues
    target_email = "aayushaggarwal348@gmail.com"
    try:
        user = User.objects.get(email=target_email)
        print(f"Testing with user: {target_email} (ID: {user.id})")
    except User.DoesNotExist:
        print(f"User {target_email} not found, using first user.")
        user = User.objects.first()

    # Find an org for this user
    membership = OrganizationMembership.objects.filter(user=user).first()
    if not membership:
        print("User has no memberships.")
        return
    
    org = membership.organization
    print(f"\n--- Checking Organization: {org.name} ---")
    print(f"Membership Role: {membership.role}")
    
    request = factory.get('/')
    request.user = user
    serializer = OrganizationSerializer(org, context={'request': request})
    print(f"Serializer Result (join_code): {serializer.data.get('join_code')}")
    print(f"Serializer Result (user_role): {serializer.data.get('user_role')}")

    # Check Team
    team = Team.objects.filter(organization=org).first()
    if not team:
        print("No team found.")
        return
    
    print(f"\n--- Checking Team: {team.name} ---")
    serializer = TeamSerializer(team, context={'request': request})
    print(f"Serializer Result (join_code): {serializer.data.get('join_code')}")
    print(f"Serializer Result (user_role): {serializer.data.get('user_role')}")
    
    project = Project.objects.filter(team=team).first()
    if not project:
        print("No project found. Creating one...")
        project = Project.objects.create(name="Debug Project", team=team, created_by=user)
    
    print(f"\n--- Checking Project: {project.name} ---")
    serializer = ProjectSerializer(project, context={'request': request})
    print(f"Serializer Result (join_code): {serializer.data.get('join_code')}")
    print(f"Serializer Result (user_role): {serializer.data.get('user_role')}")

    # Test Project Regeneration (The thing that was failing)
    print("\n--- Testing Project Code Regeneration ---")
    view = GenerateProjectCodeView.as_view()
    # Mocking the nested URL parameter team_pk
    request = factory.post(f'/api/projects/teams/{team.id}/projects/{project.id}/generate-code/', {"role": "MEMBER"})
    force_authenticate(request, user=user)
    
    try:
        response = view(request, team_pk=team.id, pk=project.id)
        print(f"Response Status: {response.status_code}")
        print(f"Response Data: {response.data}")
    except TypeError as te:
        print(f"FAILED: TypeError still exists: {te}")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    debug()
