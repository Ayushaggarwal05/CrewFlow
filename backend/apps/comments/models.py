
from django.db import models

# Create your models here.

class Comment(models.Model):
    task = models.ForeignKey("tasks.Task" ,on_delete=models.CASCADE , related_name="comments")
    user = models.ForeignKey("users.User" , on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
