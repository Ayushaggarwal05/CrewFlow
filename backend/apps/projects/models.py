
import secrets
import string
from django.db import models
from django.utils import timezone


def _generate_code(prefix: str, length: int = 6) -> str:
    alphabet = string.ascii_uppercase + string.digits
    suffix = "".join(secrets.choice(alphabet) for _ in range(length))
    return f"{prefix}{suffix}"


class Project(models.Model):
    STATUS_CHOICES = (
        ("ACTIVE", "Active"),
        ("COMPLETED", "Completed"),
        ("ARCHIVED", "Archived"),
    )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    team = models.ForeignKey("teams.Team", on_delete=models.CASCADE, related_name="projects")
    created_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True)
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="ACTIVE")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["-created_at"]


class ProjectMembership(models.Model):
    ROLE_CHOICES = [
        ("LEAD", "Lead"),
        ("MEMBER", "Member"),
    ]

    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="project_memberships"
    )
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="memberships"
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="MEMBER")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "project")
        ordering = ["joined_at"]

    def __str__(self):
        return f"{self.user} — {self.project} ({self.role})"
