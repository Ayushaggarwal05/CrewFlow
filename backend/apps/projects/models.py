
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

    # --- Invite code fields ---
    join_code = models.CharField(max_length=20, unique=True, blank=True)
    join_role = models.CharField(
        max_length=20,
        choices=[("LEAD", "Lead"), ("MEMBER", "Member")],
        default="MEMBER"
    )
    code_is_active = models.BooleanField(default=True)

    code_expires_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.join_code:
            self.join_code = self._unique_code()
        super().save(*args, **kwargs)

    def _unique_code(self):
        code = _generate_code("PROJ-")
        while Project.objects.filter(join_code=code).exists():
            code = _generate_code("PROJ-")
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
