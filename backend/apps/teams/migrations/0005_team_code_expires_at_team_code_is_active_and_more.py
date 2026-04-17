"""
Custom migration for Team join code fields.

Strategy to avoid UNIQUE constraint violation on existing rows:
1. Add join_code as non-unique with blank default
2. Run data migration to populate a unique code per existing team
3. Alter field to add unique=True constraint
"""

import secrets
import string
from django.db import migrations, models


def _gen_code(prefix="TEAM-", length=6):
    alphabet = string.ascii_uppercase + string.digits
    return prefix + "".join(secrets.choice(alphabet) for _ in range(length))


def populate_team_join_codes(apps, schema_editor):
    Team = apps.get_model("teams", "Team")
    used = set()
    for team in Team.objects.all():
        code = _gen_code()
        while code in used:
            code = _gen_code()
        used.add(code)
        team.join_code = code
        team.save(update_fields=["join_code"])


class Migration(migrations.Migration):

    dependencies = [
        ("teams", "0004_alter_team_options"),
    ]

    operations = [
        # Step 1: add non-unique fields
        migrations.AddField(
            model_name="team",
            name="code_expires_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="team",
            name="code_is_active",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="team",
            name="join_code",
            field=models.CharField(blank=True, max_length=20, default=""),
            preserve_default=False,
        ),

        # Step 2: data migration — generate unique codes for existing rows
        migrations.RunPython(populate_team_join_codes, migrations.RunPython.noop),

        # Step 3: add unique constraint
        migrations.AlterField(
            model_name="team",
            name="join_code",
            field=models.CharField(blank=True, max_length=20, unique=True),
        ),
    ]
