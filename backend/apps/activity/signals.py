from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from apps.tasks.models import Task
from apps.projects.models import Project
from apps.comments.models import Comment
from apps.organizations.models import OrganizationMembership

from .models import ActivityLog

#-------------------------TASK-----------------------------------

@receiver(post_save, sender=Task)
def log_task(sender, instance, created, **kwargs):
    # Use assigned_to if available, otherwise fall back to None (user field is nullable)
    actor = instance.assigned_to
    ActivityLog.objects.create(
        user=actor, 
        project=instance.project, 
        organization=instance.project.team.organization,
        action=action
    )

@receiver(post_delete, sender=Task)
def log_task_delete(sender, instance, **kwargs):
    actor = instance.assigned_to
    organization = None
    try:
        organization = instance.project.team.organization
    except Exception:
        organization = None
    
    try:
        ActivityLog.objects.create(
            user=actor,
            project=None,
            organization=organization,
            action=f"Task deleted: {instance.title}"
        )
    except Exception:
        # Ignore errors if organization itself is being deleted
        pass


#-------------------------------COMMENT------------------------

@receiver(post_save, sender=Comment)
def log_comment(sender, instance, created, **kwargs):
    if created:
        ActivityLog.objects.create(
            user=instance.user,
            project=instance.task.project,
            organization=instance.task.project.team.organization,
            action=f"Comment added on task: {instance.task.title}"
        )


@receiver(post_delete, sender=Comment)
def log_comment_delete(sender, instance, **kwargs):
    organization = None
    try:
        organization = instance.task.project.team.organization
    except Exception:
        organization = None
    
    try:
        ActivityLog.objects.create(
            user=instance.user,
            project=None,
            organization=organization,
            action=f"Comment deleted on task: {instance.task.title}"
        )
    except Exception:
        pass


#-------------------------------PROJECT---------------------

@receiver(post_save, sender=Project)
def log_project(sender, instance, created, **kwargs):
    if created:
        ActivityLog.objects.create(
            user=instance.created_by,
            project=instance,
            organization=instance.team.organization,
            action=f"Project created: {instance.name}"
        )


@receiver(post_delete, sender=Project)
def log_project_delete(sender, instance, **kwargs):
    # The project row is already deleted here. Storing a FK to it would break.
    organization = None
    try:
        organization = instance.team.organization
    except Exception:
        organization = None

    try:
        ActivityLog.objects.create(
            user=instance.created_by,
            project=None,
            organization=organization,
            action=f"Project deleted: {instance.name}"
        )
    except Exception:
        pass


#---------------------------------ORGANISATION MEMBERSHIP-----------------

@receiver(post_save, sender=OrganizationMembership)
def log_membership_activity(sender, instance, created, **kwargs):
    if created:
        ActivityLog.objects.create(
            user=instance.user,
            action=f"Joined organization: {instance.organization.name}",
            organization=instance.organization,
        )