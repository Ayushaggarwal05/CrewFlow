import os
import django
import sys
import json

# Setup Django
sys.path.append(r'c:\Users\LENOVO\Desktop\Work\projects\CrewFlow\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.organizations.models import Organization, OrganizationMembership
from apps.tasks.models import Task
from apps.activity.models import ActivityLog
from django.contrib.auth import get_user_model

User = get_user_model()

def check_dashboard_data():
    user = User.objects.get(email='aayushaggarwal348@gmail.com')
    org = Organization.objects.filter(memberships__user=user).first()
    
    if not org:
        print("No organization found for user.")
        return

    print(f"Checking data for Org: {org.name} (ID: {org.id})")
    
    # 1. Check Stats View Logic (Internal call simulation)
    from apps.teams.models import Team, TeamMembership
    from apps.projects.models import Project
    
    teams_qs = Team.objects.filter(organization_id=org.id)
    projects_qs = Project.objects.filter(team__organization_id=org.id)
    tasks_qs = Task.objects.filter(project__team__organization_id=org.id)
    
    total_tasks = tasks_qs.count()
    completed_tasks = tasks_qs.filter(status="DONE").count()
    completion_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    active_projects_count = projects_qs.filter(tasks__status__in=["TODO", "IN_PROGRESS"]).distinct().count()

    print("\n--- Stats Metrics ---")
    print(f"Total Tasks: {total_tasks}")
    print(f"Completed Tasks: {completed_tasks}")
    print(f"Completion %: {completion_percentage:.1f}%")
    print(f"Active Projects: {active_projects_count}")

    # 2. Check My Tasks
    my_tasks = Task.objects.filter(assigned_to=user, project__team__organization_id=org.id)
    print("\n--- My Tasks in Org ---")
    for t in my_tasks[:3]:
        print(f"- {t.title} ({t.status})")
    
    # 3. Check Activity Feed
    activity = ActivityLog.objects.filter(organization_id=org.id, user__isnull=False).order_by("-timestamp")[:5]
    print("\n--- Recent Activity in Org ---")
    for a in activity:
        print(f"- {a.user.email}: {a.action} at {a.timestamp}")

if __name__ == "__main__":
    check_dashboard_data()
