
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from .models import Organization

@receiver(pre_delete, sender=Organization)
def manual_cascade_delete_org(sender, instance, **kwargs):
    """
    Manually delete related teams before the organization is deleted
    to bypass broken database-level CASCADE constraints.
    """
    # Use delete() on the queryset to trigger pre_delete signals of Team model
    instance.teams.all().delete()
