
import secrets
import string
from django.db import models
from django.utils import timezone


def _generate_code(prefix: str, length: int = 6) -> str:
    """Generate a secure random alphanumeric code with a given prefix."""
    alphabet = string.ascii_uppercase + string.digits
    suffix = "".join(secrets.choice(alphabet) for _ in range(length))
    return f"{prefix}{suffix}"


class Organization(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="owned_organization")
    created_at = models.DateTimeField(auto_now_add=True)

    # --- Invite code fields ---
    join_code = models.CharField(max_length=20, unique=True, blank=True)
    code_is_active = models.BooleanField(default=True)
    code_expires_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.join_code:
            self.join_code = self._unique_code()
        super().save(*args, **kwargs)

    def _unique_code(self):
        code = _generate_code("ORG-")
        while Organization.objects.filter(join_code=code).exists():
            code = _generate_code("ORG-")
        return code

    def regenerate_join_code(self):
        self.join_code = self._unique_code()
        self.save(update_fields=["join_code"])

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


class OrganizationMembership(models.Model):
    ROLE_CHOICES = (("ADMIN", "Admin"), ("MANAGER", "Manager"), ("DEVELOPER", "Developer"))

    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="memberships")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "organization")

