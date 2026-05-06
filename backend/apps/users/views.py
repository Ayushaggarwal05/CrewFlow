from django.shortcuts import render
from rest_framework import generics
from .models import User
from .serializers import UserSerializer , RegisterSerializer
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Q
from django.core.mail import send_mail
from django.conf import settings
import random
from apps.authentication.models import EmailOTP
from apps.common.permissions import IsOrganizationMember
# Create your views here.

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        email = request.data.get("email")
        existing_user = User.objects.filter(email=email).first()

        if existing_user:
            if existing_user.is_verified:
                return Response("User with this email already exists.", status=400)
            else:
                # User exists but is not verified - Resend OTP
                user = existing_user
                # Optionally update other fields if they changed
                user.full_name = request.data.get("full_name", user.full_name)
                user.username = request.data.get("username", user.username)
                password = request.data.get("password")
                if password:
                    user.set_password(password)
                user.save()
        else:
            # Normal signup flow
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()

        # Generate fresh OTP
        otp = str(random.randint(100000, 999999))
        # Delete old OTPs for this user
        EmailOTP.objects.filter(user=user).delete()
        EmailOTP.objects.create(user=user, otp=otp)

        # Send Email
        try:
            send_mail(
                "Verify your Email - CrewFlow",
                f"Your OTP for email verification is: {otp}. It is valid for 10 minutes.",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Error sending email: {e}")

        return Response("OTP sent to email.", status=201)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserStatsView(APIView):
    """
    Returns global stats for the current user across all organizations.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        from apps.tasks.models import Task
        from apps.projects.models import Project

        tasks_qs = Task.objects.filter(assigned_to=user)
        total_assigned = tasks_qs.count()
        completed = tasks_qs.filter(status="DONE").count()
        
        # Organizations part of
        orgs_count = user.organizationmembership_set.count()
        
        # Projects involved in
        projects_count = Project.objects.filter(
            Q(team__memberships__user=user) | Q(tasks__assigned_to=user)
        ).distinct().count()

        return Response({
            "tasks_assigned": total_assigned,
            "tasks_completed": completed,
            "organizations_count": orgs_count,
            "projects_involved": projects_count,
            "completion_rate": round((completed / total_assigned * 100), 1) if total_assigned > 0 else 0
        })
    

class OrganizationUsersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated , IsOrganizationMember]

    filterset_fields = [
        "is_active",
    ]

    search_fields = [
        "email","full_name",
    ]

    ordering_fields = [
        "date_joined",
    ]

    def get_queryset(self):
        org_id = self.kwargs["org_id"]
        return User.objects.filter(organizationmembership__organization__id = org_id).distinct()
    

class TeamUsersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated , IsOrganizationMember]

    filterset_fields = [
        "is_active",
    ]

    search_fields = [
        "email","full_name",
    ]

    ordering_fields = [
        "date_joined",
    ]

    def get_queryset(self):
        team_id = self.kwargs["team_id"]
        return User.objects.filter(team_memberships__team__id=team_id).distinct()
