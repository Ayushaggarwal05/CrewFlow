from rest_framework import serializers
from .models import Project
from apps.teams.models import Team


#-----------------Base_----------------
class ProjectBaseSerializer(serializers.ModelSerializer):
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
        read_only_fields = [
            "id",
            "team",
            "created_by",
            "created_at",
        ]

#_-------------------------READ-----------------
class ProjectSerializer(ProjectBaseSerializer):
    pass

class ProjectWriteSerializer(ProjectBaseSerializer):
    class Meta(ProjectBaseSerializer.Meta):
        fields = [
            "id",
            "name" , 
            "description",
            "status",
            "deadline"
        ]
    
    def create(self , validated_data):
        request = self.context["request"]
        team_id = self.context["view"].kwargs["team_id"]
        team = Team.objects.get(id=team_id)
        project  = Project.objects.create(team = team , created_by  = request.user , **validated_data)
        return project