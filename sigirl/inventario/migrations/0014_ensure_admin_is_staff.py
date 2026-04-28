import os

from django.db import migrations


def ensure_admin_is_staff(apps, schema_editor):
    """Garantizar que admin siempre sea staff/superuser, sin importar cómo se creó."""
    User = apps.get_model('auth', 'User')

    admin_username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
    jefe_username = os.environ.get('DJANGO_JEFE_USERNAME', 'jefe')

    # Admin debe ser superuser y staff
    admin_user = User.objects.filter(username=admin_username).first()
    if admin_user:
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.save(update_fields=['is_staff', 'is_superuser', 'is_active'])

    # Jefe debe ser staff pero no superuser
    jefe_user = User.objects.filter(username=jefe_username).first()
    if jefe_user:
        jefe_user.is_staff = True
        jefe_user.is_superuser = False
        jefe_user.is_active = True
        jefe_user.save(update_fields=['is_staff', 'is_superuser', 'is_active'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0013_seed_default_access_users'),
    ]

    operations = [
        migrations.RunPython(ensure_admin_is_staff, noop_reverse),
    ]
