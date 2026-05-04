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

    def validate(self, data):
        request = self.context.get("request")
        project_id = self.context.get("view").kwargs.get("project_id") if self.context.get("view") else None
        
        if not request or not project_id:
            return data

        from apps.projects.models import Project, ProjectMembership
        from apps.projects.utils import get_project_role
        from rest_framework.exceptions import ValidationError

        project = Project.objects.filter(id=project_id).first()
        if not project:
            return data

        role = get_project_role(request.user, project)
        if not role:
            raise ValidationError("You are not part of this project.")

        if "assigned_to" in data:
            assigned_to = data["assigned_to"]
            if assigned_to:
                if role == "LEAD":
                    mem = ProjectMembership.objects.filter(project=project, user=assigned_to).first()
                    if not mem:
                        raise ValidationError({"assigned_to": "Assigned user is not a member of this project."})
                    if mem.role != "MEMBER":
                        raise ValidationError({"assigned_to": "Leads can only assign tasks to project Members."})
                
                elif role == "MEMBER":
                    if assigned_to != request.user.id and assigned_to != request.user:
                        raise ValidationError({"assigned_to": "Members cannot assign tasks to other users."})

        return data

    def create(self, validated_data):
        project_id = self.context["view"].kwargs["project_id"]
        project = Project.objects.filter(id=project_id).first()
        if not project:
            raise NotFound(detail="Project not found")
        task = Task.objects.create(project = project , **validated_data)
        return task