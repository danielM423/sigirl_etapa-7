from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *

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


# ============================================================
# PRODUCTO SERIALIZER - CORREGIDO
# ============================================================
class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    
    class Meta:
        model = Producto
        fields = '__all__'
        extra_kwargs = {
            'es_sensible': {'required': False},
            'marca': {'required': False, 'allow_null': True},
            'modelo': {'required': False, 'allow_null': True},
            'serial': {'required': False, 'allow_null': True},
            'estado': {'required': False, 'allow_null': True},
            'fecha_compra': {'required': False, 'allow_null': True},
            'proveedor': {'required': False, 'allow_null': True},
        }

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
    reactivos = serializers.SerializerMethodField()
    equipos = serializers.SerializerMethodField()
    materiales = serializers.SerializerMethodField()
    
    class Meta:
        model = Practica
        fields = '__all__'
        # ✅ IMPORTANTE: Decirle al serializer que acepte estos campos aunque no estén en el modelo
        extra_kwargs = {
            'reactivos': {'required': False, 'allow_null': True},
            'equipos': {'required': False, 'allow_null': True},
        }
    
    def get_reactivos(self, obj):
        from .serializers import PracticaReactivoSerializer
        return PracticaReactivoSerializer(obj.reactivos.all(), many=True).data
    
    def get_equipos(self, obj):
        from .serializers import PracticaEquipoSerializer
        return PracticaEquipoSerializer(obj.equipos.all(), many=True).data
    
    def get_materiales(self, obj):
        from .serializers import PracticaMaterialSerializer
        return PracticaMaterialSerializer(obj.materiales.all(), many=True).data
    
    def to_internal_value(self, data):
        """
        Este método se ejecuta antes de create/update.
        Aquí podemos ver qué datos llegan y procesarlos.
        """
        print("=" * 60)
        print("🔍 to_internal_value - DATOS RECIBIDOS:")
        print(f"📦 data: {data}")
        print("=" * 60)
        
        # Guardar reactivos y equipos para usarlos después
        self._reactivos_data = data.get('reactivos', [])
        self._equipos_data = data.get('equipos', [])
        
        # Remover reactivos y equipos de los datos para que no causen error
        # porque no son campos del modelo Practica
        data_copy = data.copy()
        data_copy.pop('reactivos', None)
        data_copy.pop('equipos', None)
        
        return super().to_internal_value(data_copy)
    
    def create(self, validated_data):
        print("=" * 60)
        print("🔍 CREATE - validated_data recibido:")
        print(f"📦 validated_data: {validated_data}")
        print(f"📦 Reactivos guardados en to_internal_value: {getattr(self, '_reactivos_data', [])}")
        print(f"📦 Equipos guardados en to_internal_value: {getattr(self, '_equipos_data', [])}")
        print("=" * 60)
        
        # ✅ Obtener reactivos y equipos que guardamos en to_internal_value
        reactivos_data = getattr(self, '_reactivos_data', [])
        equipos_data = getattr(self, '_equipos_data', [])
        
        # ✅ Crear la práctica
        practica = Practica.objects.create(**validated_data)
        print(f"✅ Práctica creada: ID={practica.id} - {practica.nombre}")
        
        # ✅ Crear los reactivos asociados
        for r_data in reactivos_data:
            try:
                PracticaReactivo.objects.create(
                    practica=practica,
                    reactivo_id=r_data['reactivo'],
                    cantidad=r_data['cantidad'],
                    unidad_id=r_data['unidad'],
                    es_sensible=r_data.get('es_sensible', False)
                )
                print(f"✅ Reactivo agregado: ID={r_data['reactivo']}")
            except Exception as e:
                print(f"❌ Error al crear reactivo: {e}")
                import traceback
                traceback.print_exc()
        
        # ✅ Crear los equipos asociados
        for e_data in equipos_data:
            try:
                PracticaEquipo.objects.create(
                    practica=practica,
                    equipo_id=e_data['equipo'],
                    tiempo_uso_min=e_data['tiempo_uso_min'],
                    desgaste_estimado=e_data.get('desgaste_estimado', 0),
                    mantenimiento_requerido=e_data.get('mantenimiento_requerido', False)
                )
                print(f"✅ Equipo agregado: ID={e_data['equipo']}")
            except Exception as e:
                print(f"❌ Error al crear equipo: {e}")
                import traceback
                traceback.print_exc()
        
        print(f"✅ Práctica {practica.id} guardada con {len(reactivos_data)} reactivos y {len(equipos_data)} equipos")
        return practica
    
    def update(self, instance, validated_data):
        print("=" * 60)
        print("🔍 UPDATE - validated_data recibido:")
        print(f"📦 validated_data: {validated_data}")
        print("=" * 60)
        
        # ✅ Obtener reactivos y equipos
        reactivos_data = getattr(self, '_reactivos_data', None)
        equipos_data = getattr(self, '_equipos_data', None)
        
        # Actualizar campos básicos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # ✅ Actualizar reactivos (borrar y crear de nuevo)
        if reactivos_data is not None:
            instance.reactivos.all().delete()
            for r_data in reactivos_data:
                PracticaReactivo.objects.create(
                    practica=instance,
                    reactivo_id=r_data['reactivo'],
                    cantidad=r_data['cantidad'],
                    unidad_id=r_data['unidad'],
                    es_sensible=r_data.get('es_sensible', False)
                )
            print(f"✅ Reactivos actualizados: {len(reactivos_data)}")
        
        # ✅ Actualizar equipos (borrar y crear de nuevo)
        if equipos_data is not None:
            instance.equipos.all().delete()
            for e_data in equipos_data:
                PracticaEquipo.objects.create(
                    practica=instance,
                    equipo_id=e_data['equipo'],
                    tiempo_uso_min=e_data['tiempo_uso_min'],
                    desgaste_estimado=e_data.get('desgaste_estimado', 0),
                    mantenimiento_requerido=e_data.get('mantenimiento_requerido', False)
                )
            print(f"✅ Equipos actualizados: {len(equipos_data)}")
        
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


# ============================================================
# FORMULARIOS
# ============================================================

class CampoFormularioSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampoFormulario
        fields = '__all__'


class FormularioPlantillaSerializer(serializers.ModelSerializer):
    campos = CampoFormularioSerializer(many=True, read_only=True)
    campos_count = serializers.SerializerMethodField()
    
    class Meta:
        model = FormularioPlantilla
        fields = '__all__'
    
    def get_campos_count(self, obj):
        return obj.campos.count()


class FormularioRespuestaSerializer(serializers.ModelSerializer):
    plantilla_nombre = serializers.CharField(source='plantilla.nombre', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)
    practica_nombre = serializers.CharField(source='practica.nombre', read_only=True, allow_null=True)
    
    class Meta:
        model = FormularioRespuesta
        fields = '__all__'
        read_only_fields = ('usuario', 'fecha')


# ============================================================
# HOJA DE VIDA DE EQUIPOS
# ============================================================

class MantenimientoEquipoSerializer(serializers.ModelSerializer):
    equipo_nombre = serializers.CharField(source='equipo.nombre', read_only=True)
    
    class Meta:
        model = MantenimientoEquipo
        fields = '__all__'


# ============================================================
# PROGRAMACIÓN DE LABORATORIOS
# ============================================================

class AmbienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ambiente
        fields = '__all__'


class FranjaHorariaSerializer(serializers.ModelSerializer):
    class Meta:
        model = FranjaHoraria
        fields = '__all__'


class ProgramacionLaboratorioSerializer(serializers.ModelSerializer):
    practica_nombre = serializers.CharField(source='practica.nombre', read_only=True)
    ambiente_nombre = serializers.CharField(source='ambiente.nombre', read_only=True)
    instructor_nombre = serializers.CharField(source='instructor.username', read_only=True)
    franja_nombre = serializers.CharField(source='franja.nombre', read_only=True)
    creado_por = serializers.CharField(source='creado_por', read_only=True, default='admin')
    creado_por = serializers.CharField(read_only=True)
    class Meta:
        model = ProgramacionLaboratorio
        fields = '__all__'