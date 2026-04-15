from rest_framework import serializers
from rest_framework.exceptions import NotFound
from .models import Comment
from apps.tasks.models import Task


class CommentUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    email = serializers.EmailField()


#-------------------------Base-----------------------
class CommentBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = [
            "id",
            "task",
            "user",
            "content",
            "created_at"
        ]
        read_only_fields = [
            "id",
            "task",
            "user",
            "created_at",
        ]


#-------------------read------------

class CommentSerializer(CommentBaseSerializer):
    user = CommentUserSerializer(read_only=True)

#----------------------------write---------------------
class CommentWriteSerializer(CommentBaseSerializer):
    class Meta(CommentBaseSerializer.Meta):
        fields = [
            "id" , "content"
        ]
    
    def create(self , validated_data):
        request = self.context["request"]
        task_id = self.context["view"].kwargs["task_id"]

        task = Task.objects.filter(id=task_id).first()
        if not task:
            raise NotFound(detail="Task not found")

        comment = Comment.objects.create(task=task, user=request.user, **validated_data)
        return comment