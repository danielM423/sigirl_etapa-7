"""
WSGI config for sigirl project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigirl.settings')

application = get_wsgi_application()

# Ejecutar migraciones automáticamente en Render si la variable está presente
if os.environ.get("RUN_MIGRATIONS_ON_START") == "1":
	try:
		from django.core.management import call_command
		call_command("migrate")
		print("Migraciones ejecutadas automáticamente.")
	except Exception as e:
		print(f"Error al ejecutar migraciones automáticamente: {e}")
