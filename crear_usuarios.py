#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigirl.settings')
django.setup()

from django.contrib.auth.models import User

usuarios = [
    {'username': 'admin', 'password': 'demo', 'email': 'admin@sigirl.com', 'is_staff': True, 'is_superuser': True},
    {'username': 'jefe', 'password': 'demo', 'email': 'jefe@sigirl.com', 'is_staff': True, 'is_superuser': False},
    {'username': 'user', 'password': 'demo', 'email': 'user@sigirl.com', 'is_staff': False, 'is_superuser': False},
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
        print(f"✅ Usuario '{usuario['username']}' creado")
    else:
        print(f"⚠️ Usuario '{usuario['username']}' ya existe")

print("\n🎉 ¡Listo!")
