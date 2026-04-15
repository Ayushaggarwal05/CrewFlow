from django.urls import path
from .views import (
    JoinViaCodeView,
    GenerateOrgCodeView,
    GenerateTeamCodeView,
    GenerateProjectCodeView,
)

urlpatterns = [
    # Join via code (entity-agnostic)
    path("join/", JoinViaCodeView.as_view(), name="join-via-code"),

    # Generate / regenerate codes
    path("organizations/<int:pk>/generate-code/", GenerateOrgCodeView.as_view(), name="org-generate-code"),
    path(
        "teams/organizations/<int:org_pk>/teams/<int:pk>/generate-code/",
        GenerateTeamCodeView.as_view(),
        name="team-generate-code",
    ),
    path(
        "projects/teams/<int:team_pk>/projects/<int:pk>/generate-code/",
        GenerateProjectCodeView.as_view(),
        name="project-generate-code",
    ),
]
