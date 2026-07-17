from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    department = models.CharField(max_length=100, blank=True, null=True)
    institution = models.CharField(max_length=200, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    cargo = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.username
    
    @property
    def full_name(self):
        return self.get_full_name() or self.username
    
    @property
    def role(self):
        if self.is_superuser:
            return 'admin'
        elif self.is_staff:
            return 'jefe'
        return 'usuario'


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    institution = models.CharField(max_length=200, blank=True, default='')
    department = models.CharField(max_length=200, blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    cargo = models.CharField(max_length=100, blank=True, default='')
    bio = models.TextField(blank=True, default='')
    avatar = models.TextField(blank=True, default='')
    email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(blank=True, null=True)
    email_verification_sent_at = models.DateTimeField(blank=True, null=True)
    email_verification_code_hash = models.CharField(max_length=128, blank=True, default='')
    email_verification_code_expires_at = models.DateTimeField(blank=True, null=True)
    email_verification_attempts = models.IntegerField(default=0)
    
    def __str__(self):
        return f"Perfil de {self.user.username}"