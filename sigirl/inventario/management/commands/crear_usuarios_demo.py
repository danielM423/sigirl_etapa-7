from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Crea usuarios de demo para SIGIRL'

    def handle(self, *args, **options):
        usuarios = [
            {
                'username': 'admin',
                'password': 'demo',
                'email': 'admin@sigirl.com',
                'is_staff': True,
                'is_superuser': True,
            },
            {
                'username': 'jefe',
                'password': 'demo',
                'email': 'jefe@sigirl.com',
                'is_staff': True,
                'is_superuser': False,
            },
            {
                'username': 'user',
                'password': 'demo',
                'email': 'user@sigirl.com',
                'is_staff': False,
                'is_superuser': False,
            },
        ]

        for usuario in usuarios:
            if not User.objects.filter(username=usuario['username']).exists():
                User.objects.create_user(
                    username=usuario['username'],
                    password=usuario['password'],
                    email=usuario['email'],
                    is_staff=usuario['is_staff'],
                    is_superuser=usuario['is_superuser'],
                )
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Usuario '{usuario['username']}' creado exitosamente")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"⚠️ Usuario '{usuario['username']}' ya existe")
                )

        self.stdout.write(self.style.SUCCESS("\n🎉 ¡Proceso completado!"))
