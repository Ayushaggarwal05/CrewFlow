
import secrets
import string
from django.db import models
from django.utils import timezone


def _generate_code(prefix: str, length: int = 6) -> str:
    alphabet = string.ascii_uppercase + string.digits
    suffix = "".join(secrets.choice(alphabet) for _ in range(length))
    return f"{prefix}{suffix}"


TEAM_ROLE_CHOICES = [
    ("MANAGER", "Manager"),
    ("LEAD", "Lead"),
    ("MEMBER", "Member"),
]


class Team(models.Model):
    name = models.CharField(max_length=255)
    organization = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, related_name="teams")
    members = models.ManyToManyField("users.User", through="TeamMembership", related_name="teams")
    manager = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="managed_teams",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["-created_at"]



class TeamMembership(models.Model):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="team_memberships")
    team = models.ForeignKey("teams.Team", on_delete=models.CASCADE, related_name="memberships")
    role = models.CharField(max_length=50, choices=TEAM_ROLE_CHOICES)
    joined_at = models.DateTimeField(auto_now_add=True)


    class Meta:
        unique_together = ("user", "team")

    def __str__(self):
        return f"{self.user} - {self.team} - {self.role}"
