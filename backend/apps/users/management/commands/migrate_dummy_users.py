from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Safely migrates dummy users after auth upgrade (OTP/email verification)'

    def handle(self, *args, **kwargs):
        users_to_migrate = {
            'admin@admin.com': 'admin1234',
            'manager@manager.com': 'manager1234',
            'lead@lead.com': 'lead1234',
            'member@member.com': 'member1234',
            'member2@member.com': 'member1234',
        }
        
        migrated_count = 0
        not_found_count = 0

        self.stdout.write(self.style.NOTICE('Starting safe migration of dummy users...'))

        for email, new_password in users_to_migrate.items():
            user = User.objects.filter(email=email).first()
            
            if not user:
                try:
                    user = User.objects.create_user(
                        email=email,
                        full_name=email.split("@")[0].capitalize(),
                        password=new_password
                    )
                    user.is_verified = True
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f'Successfully created and verified dummy user: {email}'))
                    migrated_count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Failed to create dummy user {email}: {str(e)}'))
                continue
                
            # Safely upgrade
            try:
                user.is_verified = True
                user.set_password(new_password)
                user.save()
                
                self.stdout.write(self.style.SUCCESS(f'Successfully migrated: {email}'))
                migrated_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Failed to migrate {email}: {str(e)}'))

        self.stdout.write(self.style.SUCCESS(f'\nMigration complete. Migrated: {migrated_count}, Skipped: {not_found_count}'))
