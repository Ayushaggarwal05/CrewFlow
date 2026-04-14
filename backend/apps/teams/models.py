
from django.db import models

class Team(models.Model):
    name = models.CharField(max_length=255)
    organization = models.ForeignKey("organizations.Organization" , on_delete=models.CASCADE , related_name="teams")
    members = models.ManyToManyField("users.User" , through="TeamMembership" , related_name="teams")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-created_at']
    

class TeamMembership(models.Model):
    ROLE_CHOICES = [
        ("LEAD", "Lead"),
        ("MEMBER", "Member"),
    ]
    user = models.ForeignKey("users.User" , on_delete=models.CASCADE , related_name="team_memberships")
    team = models.ForeignKey('teams.Team' , on_delete=models.CASCADE , related_name="memberships")
    role = models.CharField(max_length=50 , choices=ROLE_CHOICES)
    joined_at  =models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user' , 'team')
    
    def __str__(self):
        return f"{self.user} - {self.team} - {self.role}"
