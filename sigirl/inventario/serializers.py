from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Programa, Competencia, Practica, PracticaReactivo, PracticaEquipo, 
    PracticaMaterial, PedidoHistorial, PDFDocumento, Asistencia, ListadoDiario,
    UnidadMedida, HistorialCambio, Alerta, Categoria, Movimiento, Pedido, 
    Producto, UserProfile
)

User = get_user_model()

# ============================================================
# SERIALIZERS EXISTENTES
# ============================================================

class PedidoHistorialSerializer(serializers.ModelSerializer):
    usuario_modificador = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = PedidoHistorial
        fields = '__all__'

class PDFDocumentoSerializer(serializers.ModelSerializer):
    usuario = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = PDFDocumento
        fields = '__all__'

class AsistenciaSerializer(serializers.ModelSerializer):
    usuario = serializers.StringRelatedField(read_only=True)
    practica = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Asistencia
        fields = '__all__'

class ListadoDiarioSerializer(serializers.ModelSerializer):
    practica = serializers.StringRelatedField(read_only=True)
    creado_por = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = ListadoDiario
        fields = '__all__'

class UnidadMedidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnidadMedida
        fields = '__all__'

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
    categoria_id = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all(), source='categoria', write_only=True, required=False)
    class Meta:
        model = Producto
        fields = '__all__'
        extra_kwargs = {'es_sensible': {'required': False}}

class PracticaReactivoSerializer(serializers.ModelSerializer):
    reactivo_nombre = serializers.CharField(source='reactivo.nombre', read_only=True)
    class Meta:
        model = PracticaReactivo
        fields = '__all__'
        read_only_fields = ('practica',)

class PracticaMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticaMaterial
        fields = '__all__'

class PracticaEquipoSerializer(serializers.ModelSerializer):
    equipo_nombre = serializers.CharField(source='equipo.nombre', read_only=True)
    class Meta:
        model = PracticaEquipo
        fields = '__all__'

class PracticaSerializer(serializers.ModelSerializer):
    instructor_nombre = serializers.CharField(source='instructor.username', read_only=True)
    competencia_nombre = serializers.CharField(source='competencia.nombre', read_only=True, allow_null=True)
    
    # Estos campos son de solo lectura para evitar errores en PUT
    reactivos = PracticaReactivoSerializer(many=True, required=False, read_only=True)
    equipos = PracticaEquipoSerializer(many=True, required=False, read_only=True)
    materiales = PracticaMaterialSerializer(many=True, required=False, read_only=True)

    class Meta:
        model = Practica
        fields = '__all__'

    def create(self, validated_data):
        # Los datos anidados se ignoran en la creación por ahora
        return Practica.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Actualizar solo los campos directos, ignorar los anidados
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
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
    class Meta:
        model = Alerta
        fields = ['id', 'tipo', 'producto', 'titulo', 'mensaje', 'descripcion', 'remitente', 'prioridad', 'resuelta', 'estado', 'fecha']
    def get_estado(self, obj):
        return obj.estado

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['avatar', 'phone', 'department', 'institution', 'cargo', 'bio', 'updated_at']
        read_only_fields = ['updated_at']

# ============================================================
# SERIALIZERS PARA GESTIÓN ACADÉMICA
# ============================================================

class ProgramaSerializer(serializers.ModelSerializer):
    competencias_count = serializers.SerializerMethodField()
    practicas_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Programa
        fields = '__all__'
    
    def get_competencias_count(self, obj):
        return obj.competencias.filter(activo=True).count()
    
    def get_practicas_count(self, obj):
        total = 0
        for comp in obj.competencias.filter(activo=True):
            total += comp.practicas.count()
        return total

class CompetenciaSerializer(serializers.ModelSerializer):
    programa_nombre = serializers.CharField(source='programa.nombre', read_only=True)
    practicas_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Competencia
        fields = '__all__'
    
    def get_practicas_count(self, obj):
        return obj.practicas.count()


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
        except:
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
        user.is_superuser = (rol == 'admin')
        user.is_staff = rol in ('admin', 'jefe')
        user.save(update_fields=['is_superuser', 'is_staff'])

    def _set_profile(self, user, department):
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.department = department
        profile.save(update_fields=['department'])

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
            'id', 'username', 'email', 'first_name', 'last_name',
            'date_joined', 'role', 'full_name', 'profile',
            'department', 'institution', 'phone', 'cargo', 'bio', 'avatar',
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