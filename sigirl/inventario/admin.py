from django.contrib import admin
from .models import (
    Categoria, Producto, Movimiento, Pedido, Alerta,
    Programa, Competencia, Practica, PracticaReactivo, 
    PracticaEquipo, PracticaMaterial, UnidadMedida,
    Ambiente, FranjaHoraria, ProgramacionLaboratorio,
    FormularioPlantilla, CampoFormulario, FormularioRespuesta,
    MantenimientoEquipo, UserProfile, Auditoria,
    PedidoHistorial, PDFDocumento, Asistencia, ListadoDiario
)

# ============================================================
# CONFIGURACIÓN DEL ADMIN
# ============================================================

# --- PROGRAMAS ---
@admin.register(Programa)
class ProgramaAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nombre', 'version', 'activo']
    search_fields = ['nombre', 'codigo']
    list_filter = ['activo']
    ordering = ['nombre']
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'codigo', 'version')
        }),
        ('Descripción', {
            'fields': ('descripcion',)
        }),
        ('Estado', {
            'fields': ('activo',)
        }),
    )

# --- COMPETENCIAS ---
@admin.register(Competencia)
class CompetenciaAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nombre', 'programa', 'horas_estimadas', 'activo']
    search_fields = ['nombre', 'codigo']
    list_filter = ['programa', 'activo']
    autocomplete_fields = ['programa']
    ordering = ['programa__nombre', 'nombre']
    fieldsets = (
        ('Información Básica', {
            'fields': ('programa', 'nombre', 'codigo')
        }),
        ('Detalles', {
            'fields': ('descripcion', 'horas_estimadas')
        }),
        ('Estado', {
            'fields': ('activo',)
        }),
    )

# --- PRÁCTICAS ---
class PracticaReactivoInline(admin.TabularInline):
    model = PracticaReactivo
    extra = 1
    autocomplete_fields = ['reactivo']
    fields = ['reactivo', 'cantidad', 'unidad', 'es_sensible']

class PracticaEquipoInline(admin.TabularInline):
    model = PracticaEquipo
    extra = 1
    autocomplete_fields = ['equipo']
    fields = ['equipo', 'tiempo_uso_min', 'desgaste_estimado', 'mantenimiento_requerido']

class PracticaMaterialInline(admin.TabularInline):
    model = PracticaMaterial
    extra = 1
    fields = ['nombre', 'cantidad_por_grupo', 'cantidad_total']

@admin.register(Practica)
class PracticaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'ficha', 'fecha', 'competencia', 'instructor', 'estado']
    search_fields = ['nombre', 'ficha', 'competencia__nombre']
    list_filter = ['estado', 'fecha', 'competencia', 'requiere_doble_aprobacion']
    autocomplete_fields = ['competencia', 'instructor']
    filter_horizontal = []  # Si tienes ManyToMany
    inlines = [PracticaReactivoInline, PracticaEquipoInline, PracticaMaterialInline]
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'ficha', 'fecha', 'competencia')
        }),
        ('Instructor y Grupos', {
            'fields': ('instructor', 'grupos_trabajo')
        }),
        ('Estado y Aprobación', {
            'fields': ('estado', 'requiere_doble_aprobacion', 'observaciones')
        }),
        ('Prácticas Recurrentes', {
            'fields': ('es_recurrente', 'periodicidad_dias', 'repeticiones_totales', 'repeticiones_realizadas', 'fecha_ultima_repeticion'),
            'classes': ('collapse',)
        }),
    )

# --- PRODUCTOS ---
@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'tipo', 'categoria', 'cantidad', 'minimo', 'ubicacion']
    search_fields = ['nombre', 'serial']
    list_filter = ['tipo', 'categoria', 'es_sensible']  # ✅ Usar un campo real
    list_editable = ['cantidad', 'minimo']
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'tipo', 'categoria', 'unidad')
        }),
        ('Stock', {
            'fields': ('cantidad', 'minimo', 'ubicacion')
        }),
        ('Información Equipo', {
            'fields': ('marca', 'modelo', 'serial', 'estado'),
            'classes': ('collapse',)
        }),
        ('Compra', {
            'fields': ('fecha_compra', 'proveedor'),
            'classes': ('collapse',)
        }),
        ('Control', {
            'fields': ('fecha_vencimiento', 'es_sensible')
        }),
    )

# --- CATEGORÍAS ---
@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nombre']
    search_fields = ['nombre']

# --- MOVIMIENTOS ---
@admin.register(Movimiento)
class MovimientoAdmin(admin.ModelAdmin):
    list_display = ['producto', 'tipo', 'cantidad', 'fecha']
    list_filter = ['tipo', 'fecha']
    search_fields = ['producto__nombre']

# --- PEDIDOS ---
@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'producto', 'cantidad', 'usuario', 'estado', 'prioridad', 'fecha_solicitud']
    list_filter = ['estado', 'prioridad', 'fecha_solicitud']
    search_fields = ['codigo', 'producto__nombre', 'usuario__username']
    list_editable = ['estado']
    readonly_fields = ['codigo', 'fecha_solicitud']
    fieldsets = (
        ('Información del Pedido', {
            'fields': ('codigo', 'usuario', 'producto', 'cantidad')
        }),
        ('Estado y Prioridad', {
            'fields': ('estado', 'prioridad')
        }),
        ('Solicitante', {
            'fields': ('solicitante', 'departamento', 'creado_por')
        }),
        ('Aprobación', {
            'fields': ('requiere_aprobacion_jefe', 'aprobado_por_jefe', 'fecha_aprobacion_jefe')
        }),
        ('Fechas', {
            'fields': ('fecha_solicitud', 'fecha_respuesta')
        }),
        ('Entrega', {
            'fields': ('fecha_entrega', 'condicion_entrega', 'responsable_entrega', 'notas_entrega'),
            'classes': ('collapse',)
        }),
        ('Observaciones', {
            'fields': ('observaciones', 'motivo_rechazo')
        }),
    )

# --- ALERTAS ---
@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ['titulo', 'tipo', 'prioridad', 'producto', 'fecha', 'resuelta']
    list_filter = ['tipo', 'prioridad', 'resuelta', 'fecha']
    search_fields = ['titulo', 'mensaje']

# --- UNIDADES DE MEDIDA ---
@admin.register(UnidadMedida)
class UnidadMedidaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'simbolo']
    search_fields = ['nombre']

# --- AMBIENTES ---
@admin.register(Ambiente)
class AmbienteAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'capacidad', 'activo']
    search_fields = ['nombre']

# --- FRANJAS HORARIAS ---
@admin.register(FranjaHoraria)
class FranjaHorariaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'hora_inicio', 'hora_fin']
    search_fields = ['nombre']

# --- PROGRAMACIÓN DE LABORATORIOS ---
@admin.register(ProgramacionLaboratorio)
class ProgramacionLaboratorioAdmin(admin.ModelAdmin):
    list_display = ['practica', 'fecha', 'ambiente', 'franja', 'instructor', 'estado']
    list_filter = ['fecha', 'ambiente', 'franja', 'estado']
    search_fields = ['practica__nombre', 'instructor__username']
    autocomplete_fields = ['practica', 'ambiente', 'franja', 'instructor']

# --- FORMULARIOS ---
class CampoFormularioInline(admin.TabularInline):
    model = CampoFormulario
    extra = 2
    fields = ['nombre', 'etiqueta', 'tipo', 'obligatorio', 'opciones', 'orden']

@admin.register(FormularioPlantilla)
class FormularioPlantillaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'activo', 'created_at']
    search_fields = ['nombre']
    list_filter = ['activo']
    inlines = [CampoFormularioInline]

@admin.register(CampoFormulario)
class CampoFormularioAdmin(admin.ModelAdmin):
    list_display = ['etiqueta', 'plantilla', 'tipo', 'obligatorio', 'orden']
    search_fields = ['etiqueta', 'plantilla__nombre']
    list_filter = ['tipo', 'obligatorio']

@admin.register(FormularioRespuesta)
class FormularioRespuestaAdmin(admin.ModelAdmin):
    list_display = ['id', 'plantilla', 'usuario', 'practica', 'fecha']
    list_filter = ['fecha', 'plantilla']
    search_fields = ['usuario__username', 'plantilla__nombre']

# --- MANTENIMIENTO DE EQUIPOS ---
@admin.register(MantenimientoEquipo)
class MantenimientoEquipoAdmin(admin.ModelAdmin):
    list_display = ['equipo', 'tipo', 'fecha', 'tecnico', 'costo']
    list_filter = ['tipo', 'fecha']
    search_fields = ['equipo__nombre', 'tecnico']
    autocomplete_fields = ['equipo']

# --- PERFILES DE USUARIO ---
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'department', 'phone', 'email_verified']
    search_fields = ['user__username', 'user__email']

# --- AUDITORÍA ---
@admin.register(Auditoria)
class AuditoriaAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'accion', 'modulo', 'fecha']
    list_filter = ['fecha', 'modulo']
    search_fields = ['usuario__username', 'accion']
    readonly_fields = ['usuario', 'accion', 'modulo', 'descripcion', 'fecha']

# --- HISTORIAL DE PEDIDOS ---
@admin.register(PedidoHistorial)
class PedidoHistorialAdmin(admin.ModelAdmin):
    list_display = ['pedido', 'estado', 'fecha', 'usuario_modificador']
    list_filter = ['estado', 'fecha']
    search_fields = ['pedido__codigo']

# --- PDF DOCUMENTOS ---
@admin.register(PDFDocumento)
class PDFDocumentoAdmin(admin.ModelAdmin):
    list_display = ['tipo', 'referencia', 'fecha', 'usuario']
    list_filter = ['fecha', 'tipo']
    search_fields = ['referencia']

# --- ASISTENCIA ---
@admin.register(Asistencia)
class AsistenciaAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'practica', 'fecha', 'presente']
    list_filter = ['fecha', 'presente']
    search_fields = ['usuario__username', 'practica__nombre']

# --- LISTADOS DIARIOS ---
@admin.register(ListadoDiario)
class ListadoDiarioAdmin(admin.ModelAdmin):
    list_display = ['practica', 'fecha', 'creado_por']
    list_filter = ['fecha']
    search_fields = ['practica__nombre']