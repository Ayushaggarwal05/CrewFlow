from django.urls import path
from .views import TaskCreateView , TaskListView

urlpatterns = [
    path('create/' , TaskCreateView.as_view() , name="create-task"),
    path('' , TaskListView.as_view() , name="list-task"),
]