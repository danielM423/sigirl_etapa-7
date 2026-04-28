import os

from django.db import migrations


def seed_default_access_users(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    UserProfile = apps.get_model('inventario', 'UserProfile')

    from django.contrib.auth.hashers import make_password
    from django.utils import timezone

    admin_username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
    admin_password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'demo')
    admin_email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@sigirl.com')

    jefe_username = os.environ.get('DJANGO_JEFE_USERNAME', 'jefe')
    jefe_password = os.environ.get('DJANGO_JEFE_PASSWORD', 'demo')
    jefe_email = os.environ.get('DJANGO_JEFE_EMAIL', 'jefe@sigirl.com')

    user_username = os.environ.get('DJANGO_USER_USERNAME', 'user')
    user_password = os.environ.get('DJANGO_USER_PASSWORD', 'demo')
    user_email = os.environ.get('DJANGO_USER_EMAIL', 'user@sigirl.com')

    users_to_sync = [
        {
            'username': admin_username,
            'password': admin_password,
            'email': admin_email,
            'is_staff': True,
            'is_superuser': True,
        },
        {
            'username': jefe_username,
            'password': jefe_password,
            'email': jefe_email,
            'is_staff': True,
            'is_superuser': False,
        },
        {
            'username': user_username,
            'password': user_password,
            'email': user_email,
            'is_staff': False,
            'is_superuser': False,
        },
    ]

    profile_fields = {field.name for field in UserProfile._meta.get_fields() if getattr(field, 'concrete', False)}

    for data in users_to_sync:
        user, _ = User.objects.update_or_create(
            username=data['username'],
            defaults={
                'email': data['email'],
                'is_staff': data['is_staff'],
                'is_superuser': data['is_superuser'],
                'is_active': True,
                'password': make_password(data['password']),
            },
        )

        profile_defaults = {}
        if 'email_verified' in profile_fields:
            profile_defaults['email_verified'] = True
        if 'email_verified_at' in profile_fields:
            profile_defaults['email_verified_at'] = timezone.now()
        if 'email_verification_attempts' in profile_fields:
            profile_defaults['email_verification_attempts'] = 0
        if 'email_verification_code_hash' in profile_fields:
            profile_defaults['email_verification_code_hash'] = ''
        if 'email_verification_code_expires_at' in profile_fields:
            profile_defaults['email_verification_code_expires_at'] = None

        UserProfile.objects.update_or_create(user=user, defaults=profile_defaults)


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0012_userprofile_attempts_db_default'),
    ]

    operations = [
        migrations.RunPython(seed_default_access_users, noop_reverse),
    ]
