
import secrets
import string
from django.db import models
from django.utils import timezone


def _generate_code(prefix: str, length: int = 6) -> str:
    """Generate a secure random alphanumeric code with a given prefix."""
    alphabet = string.ascii_uppercase + string.digits
    suffix = "".join(secrets.choice(alphabet) for _ in range(length))
    return f"{prefix}{suffix}"


from django.core.exceptions import ValidationError


ORG_ROLE_CHOICES = (
    ("OWNER", "Owner"),
    ("ADMIN", "Admin"),
    ("MANAGER", "Manager"),
    ("LEAD", "Lead"),
    ("MEMBER", "Member"),
)


class Organization(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="owned_organization")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["-created_at"]



class OrganizationMembership(models.Model):

    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="memberships")
    role = models.CharField(max_length=20, choices=ORG_ROLE_CHOICES)
    joined_at = models.DateTimeField(auto_now_add=True)

    # --- Hierarchy ---
    manager = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="subordinates"
    )

    class Meta:
        unique_together = ("user", "organization")

    def clean(self):
        if self.manager:
            # 1. Same organization check
            if self.manager.organization != self.organization:
                raise ValidationError("The manager must belong to the same organization.")
            
            # 2. Prevent being own manager
            if self.manager == self:
                raise ValidationError("A user cannot be their own manager.")
            
            # 3. Prevent circular hierarchy (A -> B -> A)
            curr = self.manager
            while curr is not None:
                if curr == self:
                    raise ValidationError("Circular hierarchy detected: A user cannot be managed by their subordinate.")
                curr = curr.manager

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - {self.organization.name} ({self.role})"


