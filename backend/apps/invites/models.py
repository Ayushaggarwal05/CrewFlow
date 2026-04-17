from django.db import models
from django.utils import timezone
import random
import string

def _generate_code(prefix=""):
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"{prefix}{suffix}"

class InviteCode(models.Model):
    ENTITY_CHOICES = (
        ("ORG", "Organization"),
        ("TEAM", "Team"),
        ("PROJECT", "Project"),
    )

    code = models.CharField(max_length=20, unique=True, blank=True)
    entity_type = models.CharField(max_length=10, choices=ENTITY_CHOICES)
    
    # Entity links
    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE, null=True, blank=True, related_name="invite_codes"
    )
    team = models.ForeignKey(
        "teams.Team", on_delete=models.CASCADE, null=True, blank=True, related_name="invite_codes"
    )
    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, null=True, blank=True, related_name="invite_codes"
    )

    role = models.CharField(max_length=50) # The role to assign (ADMIN, MANAGER, LEAD, MEMBER, etc.)
    
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.code:
            prefix = f"{self.entity_type[:3]}-"
            self.code = self._unique_code(prefix)
        super().save(*args, **kwargs)

    def _unique_code(self, prefix):
        code = _generate_code(prefix)
        while InviteCode.objects.filter(code=code).exists():
            code = _generate_code(prefix)
        return code

    def is_valid(self):
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return True

    def __str__(self):
        entity_name = "Unknown"
        if self.organization: entity_name = self.organization.name
        elif self.team: entity_name = self.team.name
        elif self.project: entity_name = self.project.name
        return f"{self.code} ({self.entity_type}: {entity_name} as {self.role})"
