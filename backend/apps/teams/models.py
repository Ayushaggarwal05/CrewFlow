
from django.db import models

class Team(models.Model):
    name = models.CharField(max_length=255)
    organization = models.ForeignKey("organizations.Organization" , on_delete=models.CASCADE , related_name="teams")
    members = models.ManyToManyField("users.User" , through="TeamMembership")
    created_at = models.DateTimeField(auto_now_add=True)

    def _str_(self):
        return self.name
    

class TeamMembership(models.Model):
    user = models.ForeignKey("users.User" , on_delete=models.CASCADE)
    team = models.ForeignKey('teams.Team' , on_delete=models.CASCADE)
    role = models.CharField(max_length=50 , choices=[('lead' , 'Lead') , ('member' , 'Member')])
    joined_at  =models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user' , 'team')
