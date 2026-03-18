from django.urls import path
from .views import ProjectListCreateView, ProjectDetailView

urlpatterns = [
    path('teams/<int:team_id>/projects/' , ProjectListCreateView.as_view() , name="project-list"),
    path("teams/<int:team_id>/projects/<int:pk>/" , ProjectDetailView.as_view() , name="project-detail"),

]