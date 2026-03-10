from django.urls import path
from .views import ProjectListView , ProjectCreateView , ProjectDetailView

urlpatterns = [
    path('organizations/<int:organization_id>/projects/' , ProjectListView.as_view() , name="list-projects"),
    path('projects/create/' , ProjectCreateView.as_view() , name="create-projects"),
    path('projects/<int:pk>/' , ProjectDetailView.as_view()),

]