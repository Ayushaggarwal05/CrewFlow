"""
Custom migration for Organization join code fields.

Strategy to avoid UNIQUE constraint violation on existing rows:
1. Add join_code as non-unique with blank default
2. Run data migration to populate a unique code per existing org
3. Alter field to add unique=True constraint
"""

import secrets
import string
from django.db import migrations, models


def _gen_code(prefix="ORG-", length=6):
    alphabet = string.ascii_uppercase + string.digits
    return prefix + "".join(secrets.choice(alphabet) for _ in range(length))


def populate_org_join_codes(apps, schema_editor):
    Organization = apps.get_model("organizations", "Organization")
    used = set()
    for org in Organization.objects.all():
        code = _gen_code()
        while code in used:
            code = _gen_code()
        used.add(code)
        org.join_code = code
        org.save(update_fields=["join_code"])


class Migration(migrations.Migration):

    dependencies = [
        ("organizations", "0003_alter_organization_options"),
    ]

    operations = [
        # Step 1: add non-unique nullable/blank fields
        migrations.AddField(
            model_name="organization",
            name="code_expires_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="organization",
            name="code_is_active",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="organization",
            name="join_code",
            field=models.CharField(blank=True, max_length=20, default=""),
            preserve_default=False,
        ),

        # Step 2: data migration — generate unique codes for existing rows
        migrations.RunPython(populate_org_join_codes, migrations.RunPython.noop),

        # Step 3: add unique constraint now that all rows have distinct values
        migrations.AlterField(
            model_name="organization",
            name="join_code",
            field=models.CharField(blank=True, max_length=20, unique=True),
        ),
    ]
