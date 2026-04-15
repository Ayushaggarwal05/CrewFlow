
from django.db import models

# Create your models here.

class ActivityLog(models.Model):
    user = models.ForeignKey("users.User" , on_delete=models.SET_NULL ,null=True)
    organization = models.ForeignKey("organizations.Organization", on_delete=models.CASCADE, null=True, blank=True)
    project = models.ForeignKey("projects.Project" ,on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)