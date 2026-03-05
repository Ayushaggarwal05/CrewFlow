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


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True)

    class Meta :
        model = User
        fields = [
            "email",
            "full_name",
            "password"
        ]

    def create(self,validate_data):
        user = User.objects.create_user(**validate_data)
        return user