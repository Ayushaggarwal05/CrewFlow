from django.urls import path
from .views import ActivityLogListView, MyActivityLogListView

urlpatterns = [
    path("projects/<int:project_id>/activity/", ActivityLogListView.as_view() , name="activity-list"),
    path("me/", MyActivityLogListView.as_view(), name="my-activity"),
]