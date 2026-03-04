from django.db import models

class Project(models.Model):
    STATUS_CHOICES = (
        ("ACTIVE", "Active"),
        ("COMPLETED", "Completed"),
        ("ARCHIVED", "Archived"),
    )

    name = models.CharField(max_length=255)
    description  = models.TextField(blank=True)
    team = models.ForeignKey("teams.Team" , on_delete=models.CASCADE , related_name="projects")
    created_by = models.ForeignKey("users.User" , on_delete=models.SET_NULL , null=True)
    deadline = models.DateField(null=True , blank=True)
    status = models.CharField(max_length=20  , choices=STATUS_CHOICES , default="ACTIVE")
    created_at = models.DateTimeField(auto_now_add=True)

    