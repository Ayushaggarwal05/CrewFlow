"""
Custom migration for Project join code fields.

Strategy to avoid UNIQUE constraint violation on existing rows:
1. Add join_code as non-unique with blank default
2. Run data migration to populate a unique code per existing project
3. Alter field to add unique=True constraint
"""

import secrets
import string
from django.db import migrations, models


def _gen_code(prefix="PROJ-", length=6):
    alphabet = string.ascii_uppercase + string.digits
    return prefix + "".join(secrets.choice(alphabet) for _ in range(length))


def populate_project_join_codes(apps, schema_editor):
    Project = apps.get_model("projects", "Project")
    used = set()
    for project in Project.objects.all():
        code = _gen_code()
        while code in used:
            code = _gen_code()
        used.add(code)
        project.join_code = code
        project.save(update_fields=["join_code"])


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0002_initial"),
    ]

    operations = [
        # Step 1: change Meta options
        migrations.AlterModelOptions(
            name="project",
            options={"ordering": ["-created_at"]},
        ),

        # Step 2: add non-unique fields
        migrations.AddField(
            model_name="project",
            name="code_expires_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="project",
            name="code_is_active",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="project",
            name="join_code",
            field=models.CharField(blank=True, max_length=20, default=""),
            preserve_default=False,
        ),

        # Step 3: data migration — generate unique codes for existing rows
        migrations.RunPython(populate_project_join_codes, migrations.RunPython.noop),

        # Step 4: add unique constraint
        migrations.AlterField(
            model_name="project",
            name="join_code",
            field=models.CharField(blank=True, max_length=20, unique=True),
        ),
    ]
