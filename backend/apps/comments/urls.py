from django.urls import path
from .views import CommentCreateView , CommentListView , CommentDetailView

urlpatterns = [
    path("comments/create/" , CommentCreateView.as_view() , name='create-comment'),
    path("task/<int:task_id>/comments/" , CommentListView.as_view() , name='task-comments'),
     path("comments/<int:pk>/",CommentDetailView.as_view()),
]