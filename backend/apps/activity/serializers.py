from rest_framework import serializers
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):

    class Meta:
        model = ActivityLog
        fields = [
            "id",
            "user",
            "project",
            "action",
            "timestamp"
        ]
        read_only_fields = ["id", "timestamp" , "user"]

    def validate(self , data):
        request = self.context["request"]
        user = request.user
        project = data.get("project")

        if project :
            if not project.team.organization.memberships.filter(user=user).exists():
                raise serializers.ValidationError("You cannot use this project ")
        return data