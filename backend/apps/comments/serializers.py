from rest_framework import serializers
from .models import Comment
from apps.tasks.models import Task


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
            "author",
            "created_at",
        ]


#-------------------read------------

class CommentSerializer(CommentBaseSerializer):
    pass

#----------------------------write---------------------
class CommentWriteSerializer(CommentBaseSerializer):
    class Meta(CommentBaseSerializer.Meta):
        fields = [
            "id" , "content"
        ]
    
    def create(self , validated_data):
        request = self.context["request"]
        task_id = self.context["view"].kwargs["task_id"]

        task = Task.objects.get(id=task_id)
        comment = Comment.objects.create(task = task ,author = request.user , **validated_data)
        return comment