from rest_framework import serializers # pyright: ignore[reportMissingImports]
from django.contrib.auth import get_user_model
from users.models import UserProfile

from users.serializers import UserProfileSerializer
User = get_user_model()
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


class ProductoSerializer(serializers.ModelSerializer):
    categoria_texto = serializers.CharField(write_only=True, required=False)
    categoria_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'tipo', 'categoria', 'categoria_texto', 'categoria_nombre', 
                  'cantidad', 'minimo', 'ubicacion', 'unidad', 'es_sensible', 'estado',
                  # ✅ AGREGAR ESTOS CAMPOS
            'horas_uso', 'marca', 'modelo', 'serie', 
            'responsable', 'proveedor']
        
        read_only_fields = ['id']
    
    def get_categoria_nombre(self, obj):
        return obj.categoria.nombre if obj.categoria else None
    
    def create(self, validated_data):
        categoria_texto = validated_data.pop('categoria_texto', None)
        if categoria_texto:
            categoria, _ = Categoria.objects.get_or_create(nombre=categoria_texto)
            validated_data['categoria'] = categoria
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        categoria_texto = validated_data.pop('categoria_texto', None)
        if categoria_texto:
            categoria, _ = Categoria.objects.get_or_create(nombre=categoria_texto)
            validated_data['categoria'] = categoria
        return super().update(instance, validated_data)


class PracticaReactivoSerializer(serializers.ModelSerializer):
    reactivo_nombre = serializers.CharField(source='reactivo.nombre', read_only=True)
    class Meta:
        model = PracticaReactivo
        fields = '__all__'
        read_only_fields = ('practica',)


class PracticaMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticaMaterial
        fields = ['id', 'nombre', 'cantidad_por_grupo', 'cantidad_total', 'unidad']


class PracticaReactivoSerializer(serializers.ModelSerializer):
    reactivo_nombre = serializers.CharField(source='reactivo.nombre', read_only=True)
    unidad_simbolo = serializers.CharField(source='unidad.simbolo', read_only=True)
    
    # ✅ CORREGIDO: usar allow_null=True en lugar de null=True
    peso_inicial = serializers.FloatField(allow_null=True, required=False)
    peso_final = serializers.FloatField(allow_null=True, required=False)
    cantidad_consumida = serializers.FloatField(allow_null=True, required=False)
    cantidad_solucion_ml = serializers.FloatField(allow_null=True, required=False)
    
    class Meta:
        model = PracticaReactivo
        fields = [
            'id', 'reactivo', 'reactivo_nombre', 'cantidad', 'unidad', 'unidad_simbolo', 
            'es_sensible', 'peso_inicial', 'peso_final', 'cantidad_consumida',
            'nombre_solucion', 'concentracion', 'cantidad_solucion_ml'
        ]


class PracticaEquipoSerializer(serializers.ModelSerializer):
    equipo_nombre = serializers.CharField(source='equipo.nombre', read_only=True)
    
    class Meta:
        model = PracticaEquipo
        fields = ['id', 'equipo', 'equipo_nombre', 'tiempo_uso_min', 'desgaste_estimado', 'mantenimiento_requerido']


class PracticaSerializer(serializers.ModelSerializer):
    instructor_nombre = serializers.SerializerMethodField()
    competencia_nombre = serializers.SerializerMethodField()
    reactivos = PracticaReactivoSerializer(many=True, read_only=True)
    equipos = PracticaEquipoSerializer(many=True, read_only=True)
    materiales = PracticaMaterialSerializer(many=True, read_only=True)
    
    class Meta:
        model = Practica
        fields = [
            'id', 'ficha', 'nombre', 'fecha', 'grupos_trabajo',
            'instructor', 'instructor_nombre', 'estado',
            'requiere_doble_aprobacion', 'observaciones',
            'competencia', 'competencia_nombre',
            'es_recurrente', 'periodicidad_dias',
            'fecha_ultima_repeticion', 'repeticiones_totales',
            'repeticiones_realizadas',
            'reactivos', 'equipos', 'materiales'
        ]
    
    def get_instructor_nombre(self, obj):
        return obj.instructor.get_full_name() or obj.instructor.username
    
    def get_competencia_nombre(self, obj):
        return obj.competencia.nombre if obj.competencia else None

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


class CurrentUserProfileSerializer(serializers.ModelSerializer):
    # ... resto del código
    def get_profile(self, obj):
        profile, _ = UserProfile.objects.get_or_create(user=obj)
        return UserProfileSerializer(profile).data

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
    practica_nombre = serializers.CharField(source='practica.nombre', read_only=True, allow_null=True)  # ← NUEVO
    
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
    
    class Meta:
        model = ProgramacionLaboratorio
        fields = '__all__'

        # inventario/serializers.py
class PedidoDetalleSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    producto_categoria = serializers.CharField(source='producto.categoria.nombre', read_only=True)
    producto_stock = serializers.IntegerField(source='producto.cantidad', read_only=True)
    producto_unidad = serializers.CharField(source='producto.unidad', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.get_full_name', read_only=True)
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    practica_nombre = serializers.SerializerMethodField()
    practica_fecha = serializers.SerializerMethodField()
    practica_franja = serializers.SerializerMethodField()
    
    class Meta:
        model = Pedido
        fields = [
            'id', 'codigo', 'producto', 'producto_nombre', 'producto_categoria',
            'producto_stock', 'producto_unidad', 'cantidad', 'estado', 'prioridad',
            'solicitante', 'departamento', 'fecha_solicitud', 'fecha_respuesta',
            'observaciones', 'motivo_rechazo', 'usuario', 'usuario_nombre',
            'usuario_username', 'requiere_aprobacion_jefe', 'aprobado_por_jefe',
            'fecha_aprobacion_jefe', 'practica_nombre', 'practica_fecha', 'practica_franja'
        ]
    
    def get_practica_nombre(self, obj):
        if obj.observaciones:
            import re
            match = re.search(r'Práctica:\s*(.+?)(?:\n|$)', obj.observaciones)
            if match:
                return match.group(1).strip()
        return None
    
    def get_practica_fecha(self, obj):
        if obj.observaciones:
            import re
            match = re.search(r'Fecha:\s*(.+?)(?:\n|$)', obj.observaciones)
            if match:
                return match.group(1).strip()
        return None
    
    def get_practica_franja(self, obj):
        if obj.observaciones:
            import re
            match = re.search(r'Franja:\s*(.+?)(?:\n|$)', obj.observaciones)
            if match:
                return match.group(1).strip()
        return None