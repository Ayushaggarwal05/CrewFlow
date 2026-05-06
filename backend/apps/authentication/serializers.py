from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

class CustomTokenSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        data = super().validate(attrs)
        
        if not self.user.is_verified:
            raise serializers.ValidationError(
                {"detail": "Email not verified. Please verify your email before logging in."}
            )
        
        return data