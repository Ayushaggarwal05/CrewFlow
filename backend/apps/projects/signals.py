
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import Project

@receiver(pre_delete, sender=Project)
def manual_cascade_delete_project(sender, instance, **kwargs):
    """
    Manually delete related tasks before the project is deleted
    to bypass broken database-level CASCADE constraints.
    """
    instance.tasks.all().delete()
