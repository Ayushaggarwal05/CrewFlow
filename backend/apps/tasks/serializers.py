from rest_framework import serializers
from rest_framework.exceptions import NotFound
from .models import Task
from apps.projects.models import Project

class TaskBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "project",
            "assigned_to",
            "status",
            "priority",
            "due_date",
            "created_at"
        ]
        read_only_fields = [
            "id",
            "project",
            "created_at",
        ]


class TaskSerializer(TaskBaseSerializer):
    pass

class TaskWriteSerializer(TaskBaseSerializer):
    class Meta(TaskBaseSerializer.Meta):
        fields = [
            "id",
            "title",
            "description",
            "status",
            "assigned_to",
            "priority",
            "due_date"
        ]

    def create(self, validated_data):
        project_id = self.context["view"].kwargs["project_id"]
        project = Project.objects.filter(id=project_id).first()
        if not project:
            raise NotFound(detail="Project not found")
        task = Task.objects.create(project = project , **validated_data)
        return task