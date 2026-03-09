from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Comment
from .serializers import CommentSerializer, CommentCreateSerializer

class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        task = serializer.validated_data["task"]
        user = self.request.user

        is_member = task.project.team.organisation.memberships.filter(user = user).exists()

        if not is_member:
            raise PermissionDenied("NOt allowed")

        serializer.save(user=user)


class CommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs["task_id"]
        user = self.request.user
        return Comment.objects.filter(task_id=task_id , task_project_team_organisation_membership_user = user)