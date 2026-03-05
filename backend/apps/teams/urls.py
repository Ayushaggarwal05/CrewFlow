from django.urls import path
from .views import TeamCreateView , TeamListView

urlpatterns = [
    path('create/' , TeamCreateView.as_view() , name="team-create"),
    path('' , TeamListView.as_view() , name="team-list"),
]