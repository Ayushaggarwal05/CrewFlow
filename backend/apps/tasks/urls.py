from django.urls import path
from .views import TaskCreateView , TaskListView , TaskDetailView

urlpatterns = [
    path('tasks/create/' , TaskCreateView.as_view() , name="create-task"),
    path('projects/<int:project_id>/tasks/' , TaskListView.as_view() , name="list-task"),
    path('tasks/<int:pk>/' , TaskDetailView.as_view())
]