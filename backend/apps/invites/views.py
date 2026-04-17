"""
Invite system views for CrewFlow.

Endpoints:
  POST /api/join/                                  — Join via any code
  POST /api/organizations/<id>/generate-code/     — Regenerate org code
  POST /api/teams/<id>/generate-code/             — Regenerate team code
  POST /api/projects/<id>/generate-code/          — Regenerate project code
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.organizations.models import Organization, OrganizationMembership
from apps.organizations.utils import is_admin_or_owner
from apps.teams.models import Team, TeamMembership

from apps.projects.models import Project


# ─────────────────────────────────────────────────────────────────────────────
# Helper: permission check — is the requesting user an ADMIN in an org?
# ─────────────────────────────────────────────────────────────────────────────

def _is_org_admin(user, organization):
    return OrganizationMembership.objects.filter(
        user=user, organization=organization, role="ADMIN"
    ).exists()


def _is_org_admin_or_manager(user, organization):
    return OrganizationMembership.objects.filter(
        user=user, organization=organization, role__in=["ADMIN", "MANAGER"]
    ).exists()


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/join/
# ─────────────────────────────────────────────────────────────────────────────

from apps.invites.models import InviteCode

# ─────────────────────────────────────────────────────────────────────────────
# POST /api/join/
# ─────────────────────────────────────────────────────────────────────────────

class JoinViaCodeView(APIView):
    """
    Allow any authenticated user to join an Organization, Team, or Project
    by submitting a join code.

    Logic:
    1. Validate code exists and is active.
    2. Check if user is already a member (Return 409 Conflict).
    3. Create membership with the role predefined in the InviteCode.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        code_str = (request.data.get("code") or "").strip().upper()
        user = request.user

        if not code_str:
            return Response(
                {"detail": "A join code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. Look up the code
        try:
            invite = InviteCode.objects.get(code=code_str)
        except InviteCode.DoesNotExist:
            return Response(
                {"detail": "Invalid join code."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # 2. Check validity
        if not invite.is_valid():
            return Response(
                {"detail": "This invite code is inactive or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 3. Handle by entity type
        if invite.entity_type == "ORG":
            return self._join_organization(user, invite)
        elif invite.entity_type == "TEAM":
            return self._join_team(user, invite)
        elif invite.entity_type == "PROJECT":
            return self._join_project(user, invite)
        
        return Response({"detail": "Unknown entity type."}, status=400)

    def _join_organization(self, user, invite):
        org = invite.organization
        if OrganizationMembership.objects.filter(user=user, organization=org).exists():
            return Response(
                {"detail": "You are already a member of this organization."},
                status=status.HTTP_409_CONFLICT,
            )

        # REDESIGN: Always join as MEMBER
        OrganizationMembership.objects.create(
            user=user,
            organization=org,
            role="MEMBER",
        )

        return Response(
            {
                "detail": f"Successfully joined organization '{org.name}' as MEMBER.",
                "entity_type": "organization",
                "entity_id": org.id,
                "entity_name": org.name,
            },
            status=status.HTTP_201_CREATED,
        )

    def _join_team(self, user, invite):
        team = invite.team
        if TeamMembership.objects.filter(user=user, team=team).exists():
            return Response(
                {"detail": "You are already a member of this team."},
                status=status.HTTP_409_CONFLICT,
            )

        # Ensure user is in org first (as MEMBER by default if not there)
        OrganizationMembership.objects.get_or_create(
            user=user,
            organization=team.organization,
            defaults={"role": "MEMBER"},
        )

        # REDESIGN: Always join as MEMBER
        TeamMembership.objects.create(
            user=user,
            team=team,
            role="MEMBER",
        )

        return Response(
            {
                "detail": f"Successfully joined team '{team.name}' as MEMBER.",
                "entity_type": "team",
                "entity_id": team.id,
                "entity_name": team.name,
                "org_id": team.organization.id,
            },
            status=status.HTTP_201_CREATED,
        )

    def _join_project(self, user, invite):
        project = invite.project
        team = project.team
        org = team.organization

        if TeamMembership.objects.filter(user=user, team=team).exists():
             return Response(
                {"detail": "You are already a member of this team/project."},
                status=status.HTTP_409_CONFLICT,
            )

        # Ensure memberships up the chain
        OrganizationMembership.objects.get_or_create(
            user=user,
            organization=org,
            defaults={"role": "MEMBER"},
        )

        # REDESIGN: Always join as MEMBER
        TeamMembership.objects.create(
            user=user,
            team=team,
            role="MEMBER",
        )

        return Response(
            {
                "detail": f"Successfully joined project '{project.name}' as MEMBER.",
                "entity_type": "project",
                "entity_id": project.id,
                "entity_name": project.name,
                "team_id": team.id,
                "org_id": org.id,
            },
            status=status.HTTP_201_CREATED,
        )



# ─────────────────────────────────────────────────────────────────────────────
# POST /api/organizations/<id>/generate-code/
# POST /api/teams/<id>/generate-code/
# POST /api/projects/<id>/generate-code/
# ─────────────────────────────────────────────────────────────────────────────

from apps.organizations.utils import can_generate_join_codes, get_user_role

class GenerateOrgCodeView(APIView):
    """Regenerate join code for an organization. OWNER/ADMIN only."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            org = Organization.objects.get(pk=pk)
        except Organization.DoesNotExist:
            return Response({"detail": "Organization not found."}, status=status.HTTP_404_NOT_FOUND)

        user_role = get_user_role(request.user, org)
        if not can_generate_join_codes(user_role):
            return Response(
                {"detail": "Only organization admins or owners can generate join codes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # REDESIGN: Always generate for MEMBER role
        role = "MEMBER"

        # Deactivate previous code for this role if it exists
        InviteCode.objects.filter(organization=org, role=role).update(is_active=False)

        # Create new code
        invite = InviteCode.objects.create(
            entity_type="ORG",
            organization=org,
            role=role,
        )

        return Response(
            {
                "detail": "Join code generated.",
                "join_code": invite.code,
                "join_role": invite.role,
            },
            status=status.HTTP_200_OK,
        )



class GenerateTeamCodeView(APIView):
    """Regenerate join code for a team. ADMIN or MANAGER of the parent org."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk, **kwargs):
        try:
            team = Team.objects.select_related("organization").get(pk=pk)
        except Team.DoesNotExist:
            return Response({"detail": "Team not found."}, status=status.HTTP_404_NOT_FOUND)

        user_role = get_user_role(request.user, team.organization)
        if not can_generate_join_codes(user_role):
            return Response(
                {"detail": "Only organization admins or owners can generate join codes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # REDESIGN: Always generate for MEMBER role
        role = "MEMBER"

        InviteCode.objects.filter(team=team, role=role).update(is_active=False)
        
        invite = InviteCode.objects.create(
            entity_type="TEAM",
            team=team,
            role=role,
        )

        return Response(
            {
                "detail": "Join code generated.",
                "join_code": invite.code,
                "join_role": invite.role,
            },
            status=status.HTTP_200_OK,
        )



class GenerateProjectCodeView(APIView):
    """Regenerate join code for a project. ADMIN or MANAGER of the parent org."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk, **kwargs):
        try:
            project = Project.objects.select_related("team__organization").get(pk=pk)
        except Project.DoesNotExist:
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)

        user_role = get_user_role(request.user, project.team.organization)
        if not can_generate_join_codes(user_role):
            return Response(
                {"detail": "Only organization admins or owners can generate join codes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # REDESIGN: Always generate for MEMBER role
        role = "MEMBER"

        InviteCode.objects.filter(project=project, role=role).update(is_active=False)

        invite = InviteCode.objects.create(
            entity_type="PROJECT",
            project=project,
            role=role,
        )

        return Response(
            {
                "detail": "Join code generated.",
                "join_code": invite.code,
                "join_role": invite.role,
            },
            status=status.HTTP_200_OK,
        )


