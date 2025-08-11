from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from payroll.models import Role, UserRole

class Command(BaseCommand):
    help = 'Sets up initial roles and user roles'

    def handle(self, *args, **kwargs):
        # Create roles
        roles = [
            {
                'name': 'Admin',
                'description': 'Full system access',
                'permissions': {
                    'can_manage_users': True,
                    'can_manage_roles': True,
                    'can_manage_employees': True,
                    'can_manage_payroll': True,
                    'can_manage_leave': True
                }
            },
            {
                'name': 'Manager',
                'description': 'Department management access',
                'permissions': {
                    'can_manage_employees': True,
                    'can_manage_leave': True,
                    'can_view_payroll': True
                }
            },
            {
                'name': 'Employee',
                'description': 'Basic employee access',
                'permissions': {
                    'can_view_profile': True,
                    'can_request_leave': True,
                    'can_view_payroll': True
                }
            }
        ]

        created_roles = []
        for role_data in roles:
            role, created = Role.objects.get_or_create(
                name=role_data['name'],
                defaults={
                    'description': role_data['description'],
                    'permissions': role_data['permissions']
                }
            )
            created_roles.append(role)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created role: {role.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Role already exists: {role.name}'))

        # Create a superuser if it doesn't exist
        superuser, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            superuser.set_password('admin123')
            superuser.save()
            self.stdout.write(self.style.SUCCESS('Created superuser: admin'))

        # Assign admin role to superuser
        admin_role = Role.objects.get(name='Admin')
        user_role, created = UserRole.objects.get_or_create(
            user=superuser,
            defaults={
                'role': admin_role,
                'is_active': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Assigned Admin role to {superuser.username}'))
        else:
            self.stdout.write(self.style.WARNING(f'User role already exists for {superuser.username}')) 