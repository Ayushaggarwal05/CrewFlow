from django.urls import path
from .views import CommentListCreateView , CommentDetailView

urlpatterns = [
    path("task/<int:task_id>/comments/" , CommentListCreateView.as_view() , name='comment-list'),
    path("tasks/<int:task_id>/comments/<int:pk>/",CommentDetailView.as_view() , name="comment-detail"),
]