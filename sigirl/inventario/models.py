from django.db import models
from django.contrib.auth.models import User
# === RF-034: Historial de pedidos ===
class PedidoHistorial(models.Model):
    pedido = models.ForeignKey('Pedido', on_delete=models.CASCADE, related_name='historial')
    estado = models.CharField(max_length=20)
    fecha = models.DateTimeField(auto_now_add=True)
    usuario_modificador = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    comentario = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.pedido.codigo} - {self.estado} ({self.fecha:%Y-%m-%d %H:%M})"

# === RF-039: Almacenamiento de PDFs ===
class PDFDocumento(models.Model):
    archivo = models.FileField(upload_to='pdfs/')
    fecha = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    tipo = models.CharField(max_length=50, blank=True, default='')
    referencia = models.CharField(max_length=100, blank=True, default='')

    def __str__(self):
        return f"PDF {self.tipo} - {self.referencia} ({self.fecha:%Y-%m-%d})"

# === RF-055/056/057/058: Listados diarios y asistencia ===
class Asistencia(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    practica = models.ForeignKey('Practica', on_delete=models.CASCADE)
    fecha = models.DateField()
    presente = models.BooleanField(default=True)
    observaciones = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.usuario.username} - {self.practica.nombre} - {self.fecha} ({'Presente' if self.presente else 'Ausente'})"

class ListadoDiario(models.Model):
    practica = models.ForeignKey('Practica', on_delete=models.CASCADE)
    fecha = models.DateField()
    creado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    observaciones = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Listado {self.practica.nombre} - {self.fecha}"
from datetime import date
from django.db import models
from django.contrib.auth.models import User

# 📁 Categoría de productos
class Categoria(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre


# 🧪 Producto (reactivo, insumo o equipo)
class Producto(models.Model):
    TIPOS = [
        ('reactivo', 'Reactivo'),
        ('insumo', 'Insumo'),
        ('equipo', 'Equipo'),
    ]

    nombre = models.CharField(max_length=150)
    tipo = models.CharField(max_length=20, choices=TIPOS)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    minimo = models.IntegerField()
    ubicacion = models.CharField(max_length=100, blank=True, null=True)
    fecha_vencimiento = models.DateField(blank=True, null=True)
    ultima_actualizacion = models.DateTimeField(auto_now=True)
    unidad = models.CharField(max_length=30, default='unidades')
    es_sensible = models.BooleanField(default=False, help_text='¿Este producto es sensible y requiere doble aprobación?')

    def __str__(self):
        return self.nombre

    # 🔔 ALERTA: bajo stock
    def bajo_stock(self):
        return self.cantidad <= self.minimo

    # ⏳ ALERTA: por vencer (7 días)
    def por_vencer(self):
        if self.fecha_vencimiento:
            return (self.fecha_vencimiento - date.today()).days <= 7
        return False

    @property
    def estado(self):
        if self.cantidad <= 0:
            return 'agotado'
        elif self.cantidad <= self.minimo:
            return 'bajo_stock'
        return 'ok'


# 📊 Movimientos (entrada/salida)
class Movimiento(models.Model):
    TIPOS = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]

    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=10, choices=TIPOS)
    cantidad = models.IntegerField()
    fecha = models.DateTimeField(auto_now_add=True)
    observacion = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.tipo} - {self.producto.nombre}"


class Pedido(models.Model):
    PRIORIDADES = [
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
    ]

    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
        ('entregado', 'Entregado'),
    ]

    CONDICIONES_ENTREGA = [
        ('completa', 'Entrega completa — sin observaciones'),
        ('parcial', 'Entrega parcial — cantidad reducida'),
        ('observaciones', 'Con observaciones — requiere seguimiento'),
        ('urgente', 'Urgente — verificación necesaria'),
    ]

    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pedidos')
    producto = models.ForeignKey('Producto', on_delete=models.CASCADE, related_name='pedidos')
    codigo = models.CharField(max_length=30, unique=True, blank=True, null=True)
    cantidad = models.IntegerField(default=1)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    prioridad = models.CharField(max_length=10, choices=PRIORIDADES, default='media')
    solicitante = models.CharField(max_length=150, blank=True)
    departamento = models.CharField(max_length=150, blank=True)
    fecha_solicitud = models.DateField(default=date.today)
    fecha_respuesta = models.DateField(blank=True, null=True)
    observaciones = models.TextField(blank=True, null=True)
    motivo_rechazo = models.TextField(blank=True, null=True)
    evaluacion_seguridad = models.JSONField(blank=True, null=True)
    creado_por = models.CharField(max_length=150, blank=True, null=True)
    # Campos de entrega
    fecha_entrega = models.DateField(blank=True, null=True)
    condicion_entrega = models.CharField(max_length=20, choices=CONDICIONES_ENTREGA, blank=True, null=True)
    responsable_entrega = models.CharField(max_length=150, blank=True, null=True)
    notas_entrega = models.TextField(blank=True, null=True)
     # NUEVO CAMPO PARA APROBACIÓN DE EXCEPCIONES
    requiere_aprobacion_jefe = models.BooleanField(default=False)
    aprobado_por_jefe = models.BooleanField(default=False)
    fecha_aprobacion_jefe = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-fecha_solicitud', '-id']

    def save(self, *args, **kwargs):
        if not self.codigo:
            base_id = self.pk or (Pedido.objects.order_by('-id').values_list('id', flat=True).first() or 0) + 1
            self.codigo = f'PED-{base_id:04d}'
        if not self.solicitante:
            self.solicitante = self.usuario.get_full_name().strip() or self.usuario.username
        if not self.creado_por:
            self.creado_por = self.usuario.username
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.usuario} - {self.producto} ({self.estado})"


# 📋 Historial de cambios
class HistorialCambio(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    modelo = models.CharField(max_length=100, blank=True, default='')
    campo = models.CharField(max_length=100, blank=True, default='')
    valor_anterior = models.TextField(blank=True, default='')
    valor_nuevo = models.TextField(blank=True, default='')
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario} - {self.modelo} - {self.campo}"


# 🚨 Alertas del sistema
class Alerta(models.Model):
    TIPOS = [
        ('bajo_stock', 'Bajo stock'),
        ('vencimiento', 'Por vencer'),
        ('otro', 'Otro'),
    ]
    PRIORIDADES = [
        ('alta', 'Alta'),
        ('media', 'Media'),
        ('baja', 'Baja'),
    ]

    tipo = models.CharField(max_length=50, choices=TIPOS, default='otro')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, null=True, blank=True)
    titulo = models.CharField(max_length=200)
    mensaje = models.TextField(blank=True, default='')
    descripcion = models.TextField(blank=True)
    remitente = models.CharField(max_length=100, blank=True)
    prioridad = models.CharField(max_length=20, choices=PRIORIDADES, default='media')
    resuelta = models.BooleanField(default=False)
    fecha = models.DateTimeField(auto_now_add=True)
    unidad = models.CharField(max_length=30, default='unidades', blank=True)

    @property
    def estado(self):
        return 'resuelta' if self.resuelta else 'activa'

    def __str__(self):
        return self.titulo


# 👤 Perfil extendido del usuario
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

    def __str__(self):
        return f"Perfil de {self.user.username}"


# 🔍 Auditoría de acciones
class Auditoria(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    accion = models.CharField(max_length=100, default='')
    modulo = models.CharField(max_length=100, default='')
    descripcion = models.TextField(blank=True, default='')
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario} - {self.accion} - {self.modulo}"


class UnidadMedida(models.Model):
    nombre = models.CharField(max_length=50)
    simbolo = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.nombre} ({self.simbolo})"


class Practica(models.Model):
    ficha = models.CharField(max_length=50)
    nombre = models.CharField(max_length=200)
    fecha = models.DateField()
    grupos_trabajo = models.PositiveIntegerField()
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='practicas')
    estado = models.CharField(max_length=20, choices=[
        ("pendiente", "Pendiente"),
        ("aprobacion", "En aprobacion"),
        ("aprobada", "Aprobada"),
        ("rechazada", "Rechazada"),
        ("cancelada", "Cancelada"),
        ("finalizada", "Finalizada"),
    ], default="pendiente")
    requiere_doble_aprobacion = models.BooleanField(default=False)
    observaciones = models.TextField(blank=True, null=True)  # ← SOLO UNA VEZ
    
    # NUEVO CAMPO - Competencia
    competencia = models.ForeignKey(
        'Competencia', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='practicas'
    )
    
    # ========== NUEVOS CAMPOS PARA PRÁCTICAS RECURRENTES ==========
    es_recurrente = models.BooleanField(default=False)
    periodicidad_dias = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="Número de días entre repeticiones (ej: 2 = cada 2 días, 7 = semanal)"
    )
    fecha_ultima_repeticion = models.DateField(null=True, blank=True)
    repeticiones_totales = models.IntegerField(default=1, help_text="Número total de veces que se repite")
    repeticiones_realizadas = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.nombre} ({self.ficha}) - {self.fecha}"

class PracticaMaterial(models.Model):
    practica = models.ForeignKey(Practica, on_delete=models.CASCADE, related_name="materiales")
    nombre = models.CharField(max_length=150)
    cantidad_por_grupo = models.FloatField(default=0)
    cantidad_total = models.FloatField(default=0)

    def __str__(self):
        return f"{self.nombre} (por grupo: {self.cantidad_por_grupo}, total: {self.cantidad_total})"


# --- MODELOS RESTAURADOS PARA PRÁCTICAS ---
class PracticaReactivo(models.Model):
    practica = models.ForeignKey(Practica, on_delete=models.CASCADE, related_name='reactivos')
    reactivo = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.FloatField()
    unidad = models.ForeignKey(UnidadMedida, on_delete=models.CASCADE)
    es_sensible = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.reactivo} x {self.cantidad} {self.unidad}"

# ============================================================
# NUEVOS MODELOS PARA GESTIÓN ACADÉMICA
# ============================================================

class Programa(models.Model):
    """
    Programa de formación (ej: ADSO, Redes, Electricidad)
    """
    nombre = models.CharField(max_length=100, unique=True)
    codigo = models.CharField(max_length=20, unique=True)
    version = models.CharField(max_length=10, blank=True, default='1')
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Programa"
        verbose_name_plural = "Programas"
        ordering = ['nombre']

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class Competencia(models.Model):
    """
    Competencia asociada a un programa (ej: Construir Bases de Datos)
    """
    programa = models.ForeignKey(Programa, on_delete=models.CASCADE, related_name='competencias')
    nombre = models.CharField(max_length=200)
    codigo = models.CharField(max_length=20)
    descripcion = models.TextField(blank=True, null=True)
    horas_estimadas = models.IntegerField(default=0, help_text="Horas estimadas para la competencia")
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Competencia"
        verbose_name_plural = "Competencias"
        ordering = ['programa__nombre', 'nombre']
        unique_together = ['programa', 'codigo']

    def __str__(self):
        return f"{self.programa.codigo} - {self.nombre}"

class PracticaEquipo(models.Model):
    practica = models.ForeignKey(Practica, on_delete=models.CASCADE, related_name='equipos')
    equipo = models.ForeignKey(Producto, on_delete=models.CASCADE)
    tiempo_uso_min = models.PositiveIntegerField()
    desgaste_estimado = models.FloatField(default=0.0)
    mantenimiento_requerido = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.equipo} ({self.tiempo_uso_min} min)"
    
    # ============================================================
# FORMULARIOS DE LABORATORIO
# ============================================================

class FormularioPlantilla(models.Model):
    """Plantilla de formulario de laboratorio"""
    TIPOS_CAMPO = [
        ('text', 'Texto corto'),
        ('textarea', 'Texto largo'),
        ('number', 'Número'),
        ('date', 'Fecha'),
        ('checkbox', 'Checkbox'),
        ('select', 'Selección'),
    ]
    
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Formulario"
        verbose_name_plural = "Formularios"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.nombre


class CampoFormulario(models.Model):
    """Campos del formulario"""
    plantilla = models.ForeignKey('FormularioPlantilla', on_delete=models.CASCADE, related_name='campos')
    nombre = models.CharField(max_length=100, help_text="Identificador interno")
    etiqueta = models.CharField(max_length=200, help_text="Texto visible para el usuario")
    tipo = models.CharField(max_length=20, choices=FormularioPlantilla.TIPOS_CAMPO)
    obligatorio = models.BooleanField(default=False)
    opciones = models.TextField(blank=True, null=True, help_text="Para select: opción1,opción2,opción3")
    orden = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['orden']
    
    def __str__(self):
        return f"{self.plantilla.nombre} - {self.etiqueta}"


class FormularioRespuesta(models.Model):
    plantilla = models.ForeignKey('FormularioPlantilla', on_delete=models.CASCADE, related_name='respuestas')
    usuario = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='formularios_respuestas')
    practica = models.ForeignKey('Practica', on_delete=models.SET_NULL, null=True, blank=True, related_name='formularios')  # ← NUEVO
    fecha = models.DateTimeField(auto_now_add=True)
    datos = models.JSONField(default=dict, help_text="Diccionario con respuestas: {'campo_id': 'valor'}")
    
    class Meta:
        verbose_name = "Respuesta de formulario"
        verbose_name_plural = "Respuestas de formularios"
        ordering = ['-fecha']
    
    def __str__(self):
        return f"{self.plantilla.nombre} - {self.usuario.username} - {self.fecha.strftime('%Y-%m-%d')}"



# ============================================================
# HOJA DE VIDA DE EQUIPOS - MANTENIMIENTOS (DÍA 6)
# ============================================================

class MantenimientoEquipo(models.Model):
    TIPOS_MANTENIMIENTO = [
        ('preventivo', 'Preventivo'),
        ('correctivo', 'Correctivo'),
        ('calibracion', 'Calibración'),
        ('predictivo', 'Predictivo'),
    ]
    
    equipo = models.ForeignKey('Producto', on_delete=models.CASCADE, related_name='mantenimientos')
    tipo = models.CharField(max_length=20, choices=TIPOS_MANTENIMIENTO)
    fecha = models.DateField()
    descripcion = models.TextField()
    tecnico = models.CharField(max_length=150, blank=True)
    costo = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    observaciones = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-fecha']
        verbose_name = "Mantenimiento"
        verbose_name_plural = "Mantenimientos"
    
    def __str__(self):
        return f"{self.equipo.nombre} - {self.tipo} - {self.fecha}"


# ============================================================
# PROGRAMACIÓN DE LABORATORIOS (NUEVO)
# ============================================================

class Ambiente(models.Model):
    """Ambientes de laboratorio (TOC 501, 505, 507, 503)"""
    nombre = models.CharField(max_length=20, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    capacidad = models.IntegerField(default=20)
    activo = models.BooleanField(default=True)
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        verbose_name = "Ambiente"
        verbose_name_plural = "Ambientes"
        ordering = ['nombre']


class FranjaHoraria(models.Model):
    """Franjas horarias (6:00-12:00, 12:00-18:00, 18:00-22:00)"""
    nombre = models.CharField(max_length=20)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    
    def __str__(self):
        return f"{self.nombre} ({self.hora_inicio.strftime('%H:%M')}-{self.hora_fin.strftime('%H:%M')})"
    
    class Meta:
        verbose_name = "Franja Horaria"
        verbose_name_plural = "Franjas Horarias"
        ordering = ['hora_inicio']


class ProgramacionLaboratorio(models.Model):
    """
    Programación de prácticas en laboratorios
    """
    practica = models.ForeignKey('Practica', on_delete=models.CASCADE, related_name='programaciones')
    ambiente = models.ForeignKey('Ambiente', on_delete=models.CASCADE)
    franja = models.ForeignKey('FranjaHoraria', on_delete=models.CASCADE)
    fecha = models.DateField()
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='programaciones')
    grupo = models.CharField(max_length=20, blank=True, null=True)
    observaciones = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['ambiente', 'fecha', 'franja']
        ordering = ['fecha', 'franja', 'ambiente']
        verbose_name = "Programación de Laboratorio"
        verbose_name_plural = "Programaciones de Laboratorio"
    
    def __str__(self):
        return f"{self.practica.nombre} - {self.ambiente.nombre} - {self.fecha} - {self.franja.nombre}"