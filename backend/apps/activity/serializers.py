from rest_framework import serializers
from .models import ActivityLog


class ActivityUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    email = serializers.EmailField()

class ActivityProjectSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()

class ActivityOrgSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class ActivityLogSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    project = ActivityProjectSerializer(read_only=True)
    organization = ActivityOrgSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            "id",
            "user",
            "project",
            "organization",
            "action",
            "timestamp"
        ]
        read_only_fields = ["id", "timestamp", "user", "project", "organization", "action"]

    def get_user(self, obj):
        """
        Activity logs can be created without a user (e.g. task events when unassigned).
        Return a stable shape for the frontend.
        """
        u = getattr(obj, "user", None)
        if not u:
            return None
        return {"id": u.id, "full_name": u.full_name, "email": u.email}
