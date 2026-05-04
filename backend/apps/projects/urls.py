from django.urls import path
from .views import ProjectListCreateView, ProjectDetailView, ProjectMembersView, ProjectMembershipDetailView

urlpatterns = [
    path('teams/<int:team_id>/projects/', ProjectListCreateView.as_view(), name="project-list"),
    path("teams/<int:team_id>/projects/<int:pk>/", ProjectDetailView.as_view(), name="project-detail"),
    path("<int:project_id>/members/", ProjectMembersView.as_view(), name="project-members"),
    path("<int:project_id>/members/<int:pk>/", ProjectMembershipDetailView.as_view(), name="project-membership-detail"),
]