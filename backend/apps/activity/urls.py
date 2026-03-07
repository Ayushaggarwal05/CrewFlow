from django.urls import path
from .views import ActivityCreateView, ActivityListView

urlpatterns = [
    path("", ActivityListView.as_view()),
    path("create/", ActivityCreateView.as_view()),
]