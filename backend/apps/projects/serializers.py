from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "team",
            "created_by",
            "deadline",
            "status",
            "created_at"    
        ]

class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "name" , 
            "description",
            "team",
            "deadline"
        ]
    
    def create(self , validated_data):
        user = self.context["request"].user
        return Project.objects.create(created_by=user , **validated_data)