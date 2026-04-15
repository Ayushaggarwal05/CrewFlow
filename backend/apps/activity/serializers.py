from rest_framework import serializers
from .models import ActivityLog


class ActivityUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.CharField()
    email = serializers.EmailField()


class ActivityLogSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = [
            "id",
            "user",
            "project",
            "action",
            "timestamp"
        ]
        read_only_fields = ["id", "timestamp", "user", "project", "action"]

    def get_user(self, obj):
        """
        Activity logs can be created without a user (e.g. task events when unassigned).
        Return a stable shape for the frontend.
        """
        u = getattr(obj, "user", None)
        if not u:
            return None
        return {"id": u.id, "full_name": u.full_name, "email": u.email}
