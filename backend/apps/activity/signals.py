from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from apps.tasks.models import Task
from apps.projects.models import Project
from apps.comments.models import Comment

from .models import ActivityLog

#-------------------------TASK-----------------------------------

@receiver(post_save , sender=Task)
def log_task(sender , instance , created , **kwargs):
    if created:
        action = f"Task created: {instance.title}"
    else:
        action = f"Task Updated: {instance.title}"
    ActivityLog.objects.create(user = instance.assigned_to , project = instance.project , action = action)

@receiver(post_delete ,sender=Task)
def log_task_delete(sender , instance , **kwargs):
    ActivityLog.objects.create(user = instance.assigned_to , project = instance.project , action=f"Task deleted : {instance.title}")


#-------------------------------COMMENT------------------------

@receiver(post_save , sender=Comment)
def log_comment(sender , instance , created , **kwargs):
    if created:
        ActivityLog.objects.create(user = instance.user , project = instance.task.project , action="comment added")


@receiver(post_delete , sender=Comment)
def log_comment_delete(sender , instance , **kwargs):
    ActivityLog.objects.create(user = instance.user ,project = instance.task.project , action="comment deleted" )


#-------------------------------PROJECT---------------------

@receiver(post_save , sender=Project)
def log_project(sender , instance , created , **kwargs):
    if created:
        ActivityLog.objects.create(user = instance.created_by , project = instance  , action= "Project created")

    
@receiver(post_delete , sender=Project)
def log_project_delete(sender , instance , **kwargs):
    ActivityLog.objects.create(user = instance.created_by , project = instance  , action= "Project deleted")
    