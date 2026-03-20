from django.urls import path
from .views import ActivityLogListView

urlpatterns = [
    path("projects/<int:project_id>/activity/", ActivityLogListView.as_view() , name="activity-list"),
]