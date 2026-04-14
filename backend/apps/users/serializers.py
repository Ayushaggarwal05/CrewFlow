from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id" ,
            "email",
            "full_name",
            "date_joined"
        ]
        read_only_fields = [
            "id" , 
            "email" , 
            "date_joined"
        ]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True)

    class Meta :
        model = User
        fields = [
            "email",
            "full_name",
            "password"
        ]

    def create(self,validated_data):
        user = User.objects.create_user(
            email = validated_data["email"],
            full_name = validated_data["full_name"],
            password = validated_data["password"],
        )
        return user