from rest_framework import serializers
from .models import Comment

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = [
            "id",
            "task",
            "user",
            "content",
            "created_at"
        ]
        read_only_fields = ["user"]

class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = [
            "task" , "content"
        ]
    
    def create(self , validated_data):
        user = self.context["request"].user
        return Comment.objects.create(user=user , **validated_data)