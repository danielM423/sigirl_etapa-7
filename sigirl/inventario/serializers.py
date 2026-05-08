from rest_framework import serializers
from .models import UnidadMedida, Practica, PracticaReactivo, PracticaEquipo
# --- SERIALIZER UNIDAD DE MEDIDA ---
class UnidadMedidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadMedida
        fields = '__all__'

from django.contrib.auth import get_user_model
User = get_user_model()
from .models import HistorialCambio
from .models import Alerta, Categoria, Movimiento, Pedido, Producto, UserProfile


class HistorialCambioSerializer(serializers.ModelSerializer):
    usuario = serializers.StringRelatedField()
    class Meta:
        model = HistorialCambio
        fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'


class ProductoSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    class Meta:
        model = Producto
        fields = '__all__'

# --- SERIALIZERS PARA PRÁCTICAS Y RELACIONES ---
class PracticaReactivoSerializer(serializers.ModelSerializer):
    reactivo = serializers.PrimaryKeyRelatedField(queryset=Producto.objects.filter(tipo='reactivo'))
    unidad = serializers.PrimaryKeyRelatedField(queryset=UnidadMedida.objects.all())
    class Meta:
        model = PracticaReactivo
        fields = '__all__'

class PracticaEquipoSerializer(serializers.ModelSerializer):
    equipo = serializers.PrimaryKeyRelatedField(queryset=Producto.objects.filter(tipo='equipo'))
    class Meta:
        model = PracticaEquipo
        fields = '__all__'

class PracticaSerializer(serializers.ModelSerializer):
    instructor = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    reactivos = PracticaReactivoSerializer(many=True, required=False)
    equipos = PracticaEquipoSerializer(many=True, required=False)
    class Meta:
        model = Practica
        fields = '__all__'

    def create(self, validated_data):
        reactivos_data = validated_data.pop('reactivos', [])
        equipos_data = validated_data.pop('equipos', [])
        practica = Practica.objects.create(**validated_data)
        for reactivo in reactivos_data:
            PracticaReactivo.objects.create(practica=practica, **reactivo)
        for equipo in equipos_data:
            PracticaEquipo.objects.create(practica=practica, **equipo)
        return practica

    def update(self, instance, validated_data):
        reactivos_data = validated_data.pop('reactivos', None)
        equipos_data = validated_data.pop('equipos', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if reactivos_data is not None:
            instance.reactivos.all().delete()
            for reactivo in reactivos_data:
                PracticaReactivo.objects.create(practica=instance, **reactivo)
        if equipos_data is not None:
            instance.equipos.all().delete()
            for equipo in equipos_data:
                PracticaEquipo.objects.create(practica=instance, **equipo)
        return instance


class MovimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movimiento
        fields = '__all__'


class PedidoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    producto_id = serializers.IntegerField(source='producto.id', read_only=True)
    stock_actual = serializers.IntegerField(source='producto.cantidad', read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = Pedido
        fields = '__all__'
        read_only_fields = ('usuario',)

    def validate_cantidad(self, value):
        if value <= 0:
            raise serializers.ValidationError('La cantidad debe ser mayor que cero.')
        return value


class AlertaSerializer(serializers.ModelSerializer):
    estado = serializers.SerializerMethodField()
    mensaje = serializers.CharField(required=False, allow_blank=True, default='')
    tipo = serializers.CharField(required=False, default='otro')

    class Meta:
        model = Alerta
        fields = ['id', 'tipo', 'producto', 'titulo', 'mensaje', 'descripcion', 'remitente', 'prioridad', 'resuelta', 'estado', 'fecha']

    def get_estado(self, obj):
        return obj.estado

    def validate_tipo(self, value):
        if value in ('ayuda', 'problema'):
            return 'otro'
        return value


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
            'id', 'email', 'is_active',
            'nombre', 'departamento', 'rol', 'total_pedidos', 'rechazos',
            'nombre_input', 'departamento_input', 'rol_input', 'password',
        ]
        read_only_fields = ['id', 'is_active']

    def get_nombre(self, obj):
        full = obj.get_full_name().strip()
        return full if full else obj.username

    def get_departamento(self, obj):
        try:
            return obj.profile.department or ''
        except Exception:
            return ''

    def get_rol(self, obj):
        if obj.is_superuser:
            return 'admin'
        if obj.is_staff:
            return 'jefe'
        return 'usuario'

    def get_total_pedidos(self, obj):
        return obj.pedidos.count()

    def get_rechazos(self, obj):
        return obj.pedidos.filter(estado='rechazado').count()

    def create(self, validated_data):
        import re
        nombre = validated_data.pop('nombre_input', '').strip()
        departamento = validated_data.pop('departamento_input', '').strip()
        # Fuerza el rol a 'usuario' SIEMPRE, sin importar lo que llegue
        rol = 'usuario'
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
        user.is_superuser = (rol == 'admin')
        user.is_staff = rol in ('admin', 'jefe')
        user.save(update_fields=['is_superuser', 'is_staff'])

    def _set_profile(self, user, department):
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.department = department
        profile.save(update_fields=['department'])


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['avatar', 'phone', 'department', 'institution', 'cargo', 'bio', 'updated_at']
        read_only_fields = ['updated_at']


class CurrentUserProfileSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    profile = serializers.SerializerMethodField()
    department = serializers.CharField(write_only=True, required=False, allow_blank=True)
    institution = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    cargo = serializers.CharField(write_only=True, required=False, allow_blank=True)
    bio = serializers.CharField(write_only=True, required=False, allow_blank=True)
    avatar = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'date_joined',
            'role',
            'full_name',
            'profile',
            'department',
            'institution',
            'phone',
            'cargo',
            'bio',
            'avatar',
        ]
        read_only_fields = ['id', 'date_joined', 'role', 'full_name', 'profile']

    def get_role(self, obj):
        if obj.is_superuser:
            return 'admin'
        if obj.is_staff:
            return 'jefe'
        return 'usuario'

    def get_full_name(self, obj):
        return obj.get_full_name().strip() or obj.username

    def get_profile(self, obj):
        profile, _ = UserProfile.objects.get_or_create(user=obj)
        return UserProfileSerializer(profile).data

    def validate_username(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('El nombre de usuario es obligatorio.')
        if User.objects.exclude(pk=self.instance.pk if self.instance else None).filter(username=value).exists():
            raise serializers.ValidationError('Ese nombre de usuario ya está en uso.')
        return value

    def validate_email(self, value):
        value = value.strip()
        if value and User.objects.exclude(pk=self.instance.pk if self.instance else None).filter(email__iexact=value).exists():
            raise serializers.ValidationError('Ese correo ya está registrado.')
        return value

    def validate_avatar(self, value):
        if value and len(value) > 2_500_000:
            raise serializers.ValidationError('La imagen es demasiado grande. Usa una foto más ligera.')
        return value

    def update(self, instance, validated_data):
        profile_fields = {}
        for field in ['department', 'institution', 'phone', 'cargo', 'bio', 'avatar']:
            if field in validated_data:
                profile_fields[field] = validated_data.pop(field)

        for field, value in validated_data.items():
            setattr(instance, field, value.strip() if isinstance(value, str) else value)
        instance.save()

        if profile_fields:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            for field, value in profile_fields.items():
                cleaned_value = value if field == 'avatar' else (value.strip() if isinstance(value, str) else value)
                setattr(profile, field, cleaned_value or '')
            profile.save()

        return instance