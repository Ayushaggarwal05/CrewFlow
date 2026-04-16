
import secrets
import string
from django.db import models
from django.utils import timezone


def _generate_code(prefix: str, length: int = 6) -> str:
    alphabet = string.ascii_uppercase + string.digits
    suffix = "".join(secrets.choice(alphabet) for _ in range(length))
    return f"{prefix}{suffix}"


TEAM_ROLE_CHOICES = [
    ("LEAD", "Lead"),
    ("MEMBER", "Member"),
]


class Team(models.Model):
    name = models.CharField(max_length=255)
    organization = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, related_name="teams")
    members = models.ManyToManyField("users.User", through="TeamMembership", related_name="teams")
    created_at = models.DateTimeField(auto_now_add=True)

    # --- Invite code fields ---
    join_code = models.CharField(max_length=20, unique=True, blank=True)
    join_role = models.CharField(
        max_length=20,
        choices=TEAM_ROLE_CHOICES,
        default="MEMBER"
    )
    code_is_active = models.BooleanField(default=True)


    code_expires_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.join_code:
            self.join_code = self._unique_code()
        super().save(*args, **kwargs)

    def _unique_code(self):
        code = _generate_code("TEAM-")
        while Team.objects.filter(join_code=code).exists():
            code = _generate_code("TEAM-")
        return code

    def regenerate_join_code(self):
        self.join_code = self._unique_code()
        self.save(update_fields=["join_code", "join_role"])


    def is_code_valid(self):
        if not self.code_is_active:
            return False
        if self.code_expires_at and self.code_expires_at < timezone.now():
            return False
        return True

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
