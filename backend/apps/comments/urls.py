from django.urls import path
from .views import CommentCreateView , CommentListView

urlpatterns = [
    path("create/" , CommentCreateView.as_view() , name='create-comment'),
    path("task/<int:task_id>/" , CommentListView.as_view() , name='task-comments')
]