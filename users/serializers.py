from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['institution', 'department', 'phone', 'cargo', 'bio', 'avatar', 'email_verified']
        read_only_fields = ['email_verified']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    role = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'role', 'profile', 'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def get_role(self, obj):
        return obj.role
    
    def get_full_name(self, obj):
        return obj.full_name


class UserManagementSerializer(serializers.ModelSerializer):
    nombre = serializers.SerializerMethodField()
    departamento = serializers.SerializerMethodField()
    rol = serializers.SerializerMethodField()
    total_pedidos = serializers.SerializerMethodField()
    rechazos = serializers.SerializerMethodField()
    nombre_input = serializers.CharField(write_only=True, required=False, allow_blank=True)
    departamento_input = serializers.CharField(write_only=True, required=False, allow_blank=True)
    rol_input = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'is_active',
            'nombre', 'departamento', 'rol', 'total_pedidos', 'rechazos',
            'nombre_input', 'departamento_input', 'rol_input', 'password',
        ]
        read_only_fields = ['id', 'is_active']
    
    def get_nombre(self, obj):
        return obj.full_name
    
    def get_departamento(self, obj):
        try:
            return obj.profile.department or ''
        except:
            return ''
    
    def get_rol(self, obj):
        return obj.role
    
    def get_total_pedidos(self, obj):
        return getattr(obj, 'pedidos', []).count() if hasattr(obj, 'pedidos') else 0
    
    def get_rechazos(self, obj):
        if hasattr(obj, 'pedidos'):
            return obj.pedidos.filter(estado='rechazado').count()
        return 0
    
    def create(self, validated_data):
        import re
        nombre = validated_data.pop('nombre_input', '').strip()
        departamento = validated_data.pop('departamento_input', '').strip()
        rol = validated_data.pop('rol_input', 'usuario')
        password = validated_data.pop('password', None)
        email = validated_data.get('email', '')
        
        base = re.sub(r'[^a-z0-9_]', '', nombre.lower().replace(' ', '_'))[:20] or 'usuario'
        username, suffix = base, 1
        while User.objects.filter(username=username).exists():
            username = f'{base}{suffix}'
            suffix += 1
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password or 'SigirlTemp2025!',
            first_name=nombre,
        )
        self._set_rol(user, rol)
        self._set_profile(user, departamento)
        return user
    
    def update(self, instance, validated_data):
        nombre = validated_data.pop('nombre_input', None)
        departamento = validated_data.pop('departamento_input', None)
        rol = validated_data.pop('rol_input', None)
        password = validated_data.pop('password', None)
        
        if 'email' in validated_data:
            instance.email = validated_data['email']
        if nombre is not None:
            instance.first_name = nombre.strip()
        if password:
            instance.set_password(password)
        instance.save()
        
        if rol is not None:
            self._set_rol(instance, rol)
        if departamento is not None:
            self._set_profile(instance, departamento)
        return instance
    
    def _set_rol(self, user, rol):
        if rol == 'admin':
            user.is_superuser = True
            user.is_staff = True
        elif rol == 'jefe':
            user.is_superuser = False
            user.is_staff = True
        else:
            user.is_superuser = False
            user.is_staff = False
        user.save(update_fields=['is_superuser', 'is_staff'])
    
    def _set_profile(self, user, department):
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.department = department
        profile.save(update_fields=['department'])


class CurrentUserProfileSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'date_joined', 'role', 'full_name', 'profile',
        ]
        read_only_fields = ['id', 'date_joined', 'role', 'full_name', 'profile']
    
    def get_role(self, obj):
        return obj.role
    
    def get_full_name(self, obj):
        return obj.full_name
    
    def get_profile(self, obj):
        profile, _ = UserProfile.objects.get_or_create(user=obj)
        return UserProfileSerializer(profile).data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user