from django.shortcuts import render
from rest_framework import generics
from .models import ActivityLog
from .serializers import ActivityLogSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.organizations.models import OrganizationMembership
from django.db.models import Q
from apps.common.permissions import IsMemberOrAbove
# Create your views here.

class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated  , IsMemberOrAbove]


    filterset_fields = [
        "project","user",
    ]

    search_fields = [
        "action",
    ]

    ordering_fields = [
        "timestamp",
    ]

    def get_queryset(self):
        user = self.request.user
        project_id = self.kwargs["project_id"]
        return (
            ActivityLog.objects.filter(
                project__id=project_id,
                project__team__organization__memberships__user=user,
            )
            .order_by("-timestamp")
        )
    

class MyActivityLogListView(generics.ListAPIView):
    """
    Global activity feed for the current user (across all orgs/projects).
    """

    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

    filterset_fields = [
        "project",
        "organization",
    ]

    search_fields = [
        "action",
    ]

    ordering_fields = [
        "timestamp",
    ]

    def get_queryset(self):
        user = self.request.user
        return ActivityLog.objects.filter(user=user).order_by("-timestamp")


class OrgActivityFeedView(generics.ListAPIView):
    """
    Returns the latest logs for a specific organization, 
    filtered by user's join date and role-based permissions.
    """
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        org_id = self.kwargs.get("org_id")
        user = self.request.user
        
        # 1. Membership Check & Join Date
        membership = get_object_or_404(OrganizationMembership, organization_id=org_id, user=user)
        
        queryset = ActivityLog.objects.filter(
            organization_id=org_id,
            timestamp__gte=membership.joined_at
        )

        # 2. Role-Based Visibility
        if membership.role == "ADMIN":
            # Admin sees all
            pass
        elif membership.role == "MANAGER":
            # Manager sees team and project activities
            # For now, scoping to projects in the organization
            pass
        else:
            # Members/Leads see activity in projects they are related to
            # This is a simplified scope: if they are in the org, they see org activity 
            # but we can filter by project memberships if they existed.
            # Requirement: "MEMBER sees only tasks assigned or related activity"
            # We'll filter to show logs they generated OR logs in projects they are part of teams for.
            user_teams = user.team_memberships.values_list('team_id', flat=True)
            queryset = queryset.filter(
                Q(user=user) | Q(project__team_id__in=user_teams)
            )

        return queryset.select_related("user", "project").order_by("-timestamp")[:30]

    def list(self, request, *args, **kwargs):
        # Override to support the URL pattern /api/activity/org/<org_id>/
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
