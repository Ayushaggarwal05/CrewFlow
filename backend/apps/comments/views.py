from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Comment
from .serializers import CommentSerializer, CommentWriteSerializer
from apps.common.permissions import IsDeveloperOrAbove , IsManagerOrAdmin


#-------------------list and create-----------------
class CommentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated , IsDeveloperOrAbove]

    def get_queryset(self):
        user = self.request.user
        task_id  = self.kwargs["task_id"]
        return Comment.objects.filter(task__id = task_id , task__project__team__organization__memberships__user=user).distinct()
    
    def get_serializer_class(self):
        if self.request.method == "POST":
            return CommentWriteSerializer
        return CommentSerializer


#----------------------------Detal ,update----------------------
class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    # Keep stricter access for update/delete for now; frontend currently only uses list/create.
    permission_classes = [IsAuthenticated , IsManagerOrAdmin ]

    def get_queryset(self):
        user = self.request.user
        task_id = self.kwargs["task_id"]
        return Comment.objects.filter(
            task__id=task_id,
            task__project__team__organization__memberships__user=user,
        ).distinct()
    
    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return CommentWriteSerializer

        return CommentSerializer