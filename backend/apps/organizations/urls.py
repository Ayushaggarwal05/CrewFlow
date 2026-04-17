from django.urls import path
from .views import (
    OrganizationListCreateView, 
    OrganizationDetailView, 
    OrganizationMembershipDetailView, 
    OrganizationMembershipListCreateView, 
    MyTeamView,
    DashboardStatsView
)

urlpatterns = [
    path("" , OrganizationListCreateView.as_view() , name="organizations-list"),
    path("stats/" , DashboardStatsView.as_view() , name="dashboard-stats"),
    path("my-team/" , MyTeamView.as_view() , name="org-my-team-global"),
    path("<int:pk>/" , OrganizationDetailView.as_view() , name="organization-detail"),
    path("<int:org_id>/memberships/" , OrganizationMembershipListCreateView.as_view() , name="org-membership-list"),
    path("<int:org_id>/memberships/<int:pk>/" , OrganizationMembershipDetailView.as_view() , name="org-membership-detail"),
    path("<int:org_id>/my-team/" , MyTeamView.as_view() , name="org-my-team"),
]
