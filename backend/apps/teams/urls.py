from django.urls import path
from .views import  TeamListCreateView , TeamDetailView , TeamMembershipListCreateView , TeamMembershipDetailView

urlpatterns = [
    path('organizations/<int:org_id>/teams/' , TeamListCreateView.as_view() , name="team-list"),
    path('organizations/<int:org_id>/teams/<int:pk>/' , TeamDetailView.as_view() , name="team-detail"),
    path(
        "teams/<int:team_id>/memberships/",
        TeamMembershipListCreateView.as_view(),
        name="team-membership-list",
    ),

    path(
        "teams/<int:team_id>/memberships/<int:pk>/",
        TeamMembershipDetailView.as_view(),
        name="team-membership-detail",
    ),
]