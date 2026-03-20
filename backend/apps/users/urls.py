from django.urls import path
from .views import RegisterView , CurrentUserView , OrganizationUsersView , TeamUsersView
urlpatterns = [
    path('auth/register/' , RegisterView.as_view() , name="register"),
    path("users/me/" , CurrentUserView.as_view() , name="current-user"),
    path("organizations/<int:org_id>/users/" , OrganizationUsersView.as_view() , name="organization-users"),
    path("teams/<int:team_id>/users/" , TeamUsersView.as_view() , name="team-user"),
]