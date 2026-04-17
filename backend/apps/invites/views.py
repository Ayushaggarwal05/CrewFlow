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

class JoinViaCodeView(APIView):
    """
    Allow any authenticated user to join an Organization, Team, or Project
    by submitting a join code.

    Logic:
    - Code prefix determines entity type (ORG- / TEAM- / PROJ-)
    - Validates code is active and not expired
    - Creates membership with default role (no-op if already a member)
    - Returns entity info so the frontend can navigate to it
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = (request.data.get("code") or "").strip().upper()

        if not code:
            return Response(
                {"detail": "A join code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user

        # ── Detect entity ────────────────────────────────────────────────────
        if code.startswith("ORG-"):
            return self._join_organization(user, code)
        elif code.startswith("TEAM-"):
            return self._join_team(user, code)
        elif code.startswith("PROJ-"):
            return self._join_project(user, code)
        else:
            return Response(
                {"detail": "Invalid code format. Expected ORG-…, TEAM-…, or PROJ-…."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    # ── Organization join ────────────────────────────────────────────────────

    def _join_organization(self, user, code):
        try:
            org = Organization.objects.get(join_code=code)
        except Organization.DoesNotExist:
            return Response({"detail": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)

        if not org.is_code_valid():
            return Response(
                {"detail": "This invite code is inactive or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership, created = OrganizationMembership.objects.get_or_create(
            user=user,
            organization=org,
            defaults={"role": "DEVELOPER"},
        )

        if not created:
            return Response(
                {
                    "detail": "You are already a member of this organization.",
                    "entity_type": "organization",
                    "entity_id": org.id,
                    "entity_name": org.name,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "detail": f"Successfully joined organization '{org.name}'.",
                "entity_type": "organization",
                "entity_id": org.id,
                "entity_name": org.name,
            },
            status=status.HTTP_201_CREATED,
        )

    # ── Team join ─────────────────────────────────────────────────────────────

    def _join_team(self, user, code):
        try:
            team = Team.objects.select_related("organization").get(join_code=code)
        except Team.DoesNotExist:
            return Response({"detail": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)

        if not team.is_code_valid():
            return Response(
                {"detail": "This invite code is inactive or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Ensure user is in the parent organization first
        OrganizationMembership.objects.get_or_create(
            user=user,
            organization=team.organization,
            defaults={"role": "DEVELOPER"},
        )

        membership, created = TeamMembership.objects.get_or_create(
            user=user,
            team=team,
            defaults={"role": "MEMBER"},
        )

        if not created:
            return Response(
                {
                    "detail": "You are already a member of this team.",
                    "entity_type": "team",
                    "entity_id": team.id,
                    "entity_name": team.name,
                    "org_id": team.organization.id,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "detail": f"Successfully joined team '{team.name}'.",
                "entity_type": "team",
                "entity_id": team.id,
                "entity_name": team.name,
                "org_id": team.organization.id,
            },
            status=status.HTTP_201_CREATED,
        )

    # ── Project join ──────────────────────────────────────────────────────────

    def _join_project(self, user, code):
        try:
            project = Project.objects.select_related("team__organization").get(join_code=code)
        except Project.DoesNotExist:
            return Response({"detail": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)

        if not project.is_code_valid():
            return Response(
                {"detail": "This invite code is inactive or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        team = project.team
        org = team.organization

        # Ensure memberships up the chain
        OrganizationMembership.objects.get_or_create(
            user=user,
            organization=org,
            defaults={"role": "DEVELOPER"},
        )

        team_membership, team_created = TeamMembership.objects.get_or_create(
            user=user,
            team=team,
            defaults={"role": "MEMBER"},
        )

        already_in_team = not team_created

        return Response(
            {
                "detail": f"Successfully joined project '{project.name}'" + (
                    " (already in team)" if already_in_team else " and its team"
                ) + ".",
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

class GenerateOrgCodeView(APIView):
    """Regenerate join code for an organization. ADMIN only."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            org = Organization.objects.get(pk=pk)
        except Organization.DoesNotExist:
            return Response({"detail": "Organization not found."}, status=status.HTTP_404_NOT_FOUND)

        if not _is_org_admin(request.user, org):
            return Response(
                {"detail": "Only organization admins can regenerate the join code."},
                status=status.HTTP_403_FORBIDDEN,
            )

        org.regenerate_join_code()
        return Response(
            {
                "detail": "Join code regenerated.",
                "join_code": org.join_code,
                "code_is_active": org.code_is_active,
            },
            status=status.HTTP_200_OK,
        )


class GenerateTeamCodeView(APIView):
    """Regenerate join code for a team. ADMIN or MANAGER of the parent org."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            team = Team.objects.select_related("organization").get(pk=pk)
        except Team.DoesNotExist:
            return Response({"detail": "Team not found."}, status=status.HTTP_404_NOT_FOUND)

        if not _is_org_admin_or_manager(request.user, team.organization):
            return Response(
                {"detail": "Only admins or managers can regenerate the team join code."},
                status=status.HTTP_403_FORBIDDEN,
            )

        team.regenerate_join_code()
        return Response(
            {
                "detail": "Join code regenerated.",
                "join_code": team.join_code,
                "code_is_active": team.code_is_active,
            },
            status=status.HTTP_200_OK,
        )


class GenerateProjectCodeView(APIView):
    """Regenerate join code for a project. ADMIN or MANAGER of the parent org."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            project = Project.objects.select_related("team__organization").get(pk=pk)
        except Project.DoesNotExist:
            return Response({"detail": "Project not found."}, status=status.HTTP_404_NOT_FOUND)

        if not _is_org_admin_or_manager(request.user, project.team.organization):
            return Response(
                {"detail": "Only admins or managers can regenerate the project join code."},
                status=status.HTTP_403_FORBIDDEN,
            )

        project.regenerate_join_code()
        return Response(
            {
                "detail": "Join code regenerated.",
                "join_code": project.join_code,
                "code_is_active": project.code_is_active,
            },
            status=status.HTTP_200_OK,
        )
