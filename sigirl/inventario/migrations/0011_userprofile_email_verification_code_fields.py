from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventario', '0010_userprofile_email_verification_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='email_verification_attempts',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='email_verification_code_expires_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='email_verification_code_hash',
            field=models.CharField(blank=True, default='', max_length=128),
        ),
    ]
