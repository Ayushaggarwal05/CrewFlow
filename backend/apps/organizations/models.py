    
from django.db import models

class Organization(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey("users.User" , on_delete=models.CASCADE , related_name="owned_organization")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class OrganizationMembership(models.Model):
    ROLE_CHOICES = ( ("ADMIN", "Admin"), ("MANAGER", "Manager"), ("DEVELOPER", "Developer") )

    user = models.ForeignKey("users.User" , on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization , on_delete=models.CASCADE , related_name="memberships") 
    role = models.CharField(max_length=20 , choices=ROLE_CHOICES)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user" , "organization")
