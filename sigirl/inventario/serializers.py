from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework import serializers
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
    nivel_riesgo = serializers.SerializerMethodField()
    mensaje = serializers.SerializerMethodField()
    recomendacion = serializers.SerializerMethodField()
    bajo_stock = serializers.SerializerMethodField()
    por_vencer = serializers.SerializerMethodField()
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    categoria_texto = serializers.CharField(write_only=True, required=False, allow_blank=True)
    umbral_minimo = serializers.IntegerField(source='minimo', required=False)
    estado = serializers.CharField(read_only=True)

    class Meta:
        model = Producto
        fields = [
            'id',
            'nombre',
            'tipo',
            'categoria',
            'categoria_nombre',
            'categoria_texto',
            'cantidad',
            'minimo',
            'umbral_minimo',
            'ubicacion',
            'fecha_vencimiento',
            'ultima_actualizacion',
            'bajo_stock',
            'por_vencer',
            'estado',
            'nivel_riesgo',
            'mensaje',
            'recomendacion',
        ]

    def get_nivel_riesgo(self, obj):
        if obj.cantidad <= 0:
            return '🔴 Crítico'
        elif obj.cantidad <= obj.minimo:
            return '🟠 Medio'
        else:
            return '🟢 Leve'

    def get_mensaje(self, obj):
        if obj.cantidad <= 0:
            return 'Stock insuficiente'
        elif obj.cantidad <= obj.minimo:
            return 'Stock cercano al mínimo'
        else:
            return 'Estado normal'

    def get_recomendacion(self, obj):
        if obj.cantidad <= 0:
            return 'Realizar reposición inmediata'
        elif obj.cantidad <= obj.minimo:
            return 'Planificar reposición pronto'
        else:
            return 'Sin acción requerida'

    def get_bajo_stock(self, obj):
        return obj.bajo_stock()

    def get_por_vencer(self, obj):
        return obj.por_vencer()

    def _resolve_categoria(self, validated_data):
        categoria_texto = (validated_data.pop('categoria_texto', '') or '').strip()

        if categoria_texto:
            categoria, _ = Categoria.objects.get_or_create(nombre=categoria_texto)
            validated_data['categoria'] = categoria
        elif not validated_data.get('categoria'):
            categoria, _ = Categoria.objects.get_or_create(nombre='General')
            validated_data['categoria'] = categoria

        return validated_data

    def validate_cantidad(self, value):
        if value < 0:
            raise serializers.ValidationError('La cantidad no puede ser negativa.')
        return value

    def validate_minimo(self, value):
        if value < 0:
            raise serializers.ValidationError('El umbral mínimo no puede ser negativo.')
        return value

    def create(self, validated_data):
        validated_data = self._resolve_categoria(validated_data)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data = self._resolve_categoria(validated_data)
        return super().update(instance, validated_data)


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
    class Meta:
        model = Alerta
        fields = '__all__'


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
            return 'jefe'
        if obj.is_staff:
            return 'admin'
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