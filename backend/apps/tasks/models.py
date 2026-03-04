
from django.db import models

# Create your models here.

class Task(models.Model):
    STATUS_CHOICES = (
        ("TODO", "Todo"),
        ("IN_PROGRESS", "In Progress"),
        ("DONE", "Done"),
    )

    PRIORITY_CHOICES = (
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    project = models.ForeignKey("projects.Project" , on_delete=models.CASCADE , related_name="tasks")
    assigned_to = models.ForeignKey("users.User" , on_delete=models.SET_NULL , null=True , blank=True)
    status = models.CharField(max_length=20 , choices=STATUS_CHOICES ,default="TODO")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES,default="MEDIUM")
    due_date = models.DateField(null=True , blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
