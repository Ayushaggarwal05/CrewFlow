
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import Team

@receiver(pre_delete, sender=Team)
def manual_cascade_delete_team(sender, instance, **kwargs):
    """
    Manually delete related projects before the team is deleted
    to bypass broken database-level CASCADE constraints.
    """
    instance.projects.all().delete()
