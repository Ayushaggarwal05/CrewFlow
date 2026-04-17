from django.urls import path
from .views import TaskListCreateView, TaskDetailView, MyOrgTasksListView

urlpatterns = [
    path("projects/<int:project_id>/tasks/" , TaskListCreateView.as_view() , name="task-list"),
    path("projects/<int:project_id>/tasks/<int:pk>/" , TaskDetailView.as_view() , name="task-detail"),
    path("my-tasks/", MyOrgTasksListView.as_view(), name="my-tasks"),
]