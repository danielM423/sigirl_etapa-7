from django.urls import path, include
from .views import programacion_semanal
from .views import MantenimientoEquipoViewSet, reporte_equipos
from rest_framework.routers import DefaultRouter
from .views import (
    register,
    get_current_user,
    manage_profile,
    verify_email,
    verify_email_code,
    resend_verification_email,
    PublicTokenObtainPairView,
    PublicTokenRefreshView,
    PracticaViewSet,
    ProductoViewSet,
    CategoriaViewSet,
    MovimientoViewSet,
    PedidoViewSet,
    AlertaViewSet,
    PedidoHistorialViewSet,
    PDFDocumentoViewSet,
    AsistenciaViewSet,
    ListadoDiarioViewSet,
    top_reactivos_usados,
    instructores_list,
    inventario_practicas_abiertas_instructor,
    ProgramaViewSet,
    CompetenciaViewSet,
    calcular_pedido,
    generar_pedido,
    generar_pdf_solicitud,
    pedidos_requieren_aprobacion,
    aprobar_excepcion_pedido,
)
from .views_auditoria import AuditoriaViewSet
from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from .serializers import UserManagementSerializer
User = get_user_model()
from .views import reporte_sustancias_controladas
from .views import toggle_reactivo_sensible, crear_reactivo_sensible
from .views import FormularioPlantillaViewSet, CampoFormularioViewSet, FormularioRespuestaViewSet, mis_formularios

# ============================================================
# ROUTER
# ============================================================
router = DefaultRouter()

# Routers existentes
# Formularios
router.register(r'formularios-plantilla', FormularioPlantillaViewSet)
router.register(r'formularios-campos', CampoFormularioViewSet)
router.register(r'formularios-respuesta', FormularioRespuestaViewSet)
router.register(r'practicas', PracticaViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'movimientos', MovimientoViewSet)
router.register(r'pedidos', PedidoViewSet)
router.register(r'alertas', AlertaViewSet)
router.register(r'pedido-historial', PedidoHistorialViewSet)
router.register(r'pdf-documentos', PDFDocumentoViewSet)
router.register(r'asistencias', AsistenciaViewSet)
router.register(r'listados-diarios', ListadoDiarioViewSet)
router.register(r'auditoria', AuditoriaViewSet)

# NUEVOS ROUTERS PARA GESTIÓN ACADÉMICA
router.register(r'programas', ProgramaViewSet)
router.register(r'competencias', CompetenciaViewSet)
router.register(r'mantenimientos-equipo', MantenimientoEquipoViewSet)
# Usuario ViewSet
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserManagementSerializer
    permission_classes = [permissions.IsAdminUser]

router.register(r'usuarios', UsuarioViewSet)

# ============================================================
# URL PATTERNS
# ============================================================
urlpatterns = [
    # JWT (Public)
    path('token/', PublicTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', PublicTokenRefreshView.as_view(), name='token_refresh'),
    path('reporte-sustancias-controladas/', reporte_sustancias_controladas, name='reporte_sustancias_controladas'),
    path('toggle-reactivo-sensible/<int:reactivo_id>/', toggle_reactivo_sensible, name='toggle_reactivo_sensible'),
    path('crear-reactivo-sensible/', crear_reactivo_sensible, name='crear_reactivo_sensible'),
    path('mis-formularios/', mis_formularios, name='mis_formularios'),
    # Auth (Public)
    path('register/', register, name='register'),
    path('verify-email/<str:uidb64>/<str:token>/', verify_email, name='verify_email'),
    path('auth/verify-email-code/', verify_email_code, name='verify_email_code'),
    path('auth/resend-verification/', resend_verification_email, name='resend_verification_email'),
    
    # Perfil de usuario (requiere autenticación)
    path('auth/user/', get_current_user, name='get_current_user'),
    path('auth/profile/', manage_profile, name='manage_profile'),

    # Endpoints REST principales
    path('', include(router.urls)),

    # Endpoints adicionales
    path('top-reactivos-usados/', top_reactivos_usados, name='top_reactivos_usados'),
    path('instructores/', instructores_list, name='instructores_list'),
    path('inventario-practicas-abiertas-instructor/', inventario_practicas_abiertas_instructor, name='inventario_practicas_abiertas_instructor'),
    
    # Endpoints de cálculo automático y PDF
    path('calculo-pedido/calcular/', calcular_pedido, name='calcular_pedido'),
    path('calculo-pedido/generar_pedido/', generar_pedido, name='generar_pedido'),
    path('generar-pdf-solicitud/', generar_pdf_solicitud, name='generar_pdf_solicitud'),
    path('reporte-equipos/', reporte_equipos, name='reporte-equipos'),
    
    # ========== ENDPOINTS DE APROBACIÓN DE EXCEPCIONES ==========
    path('pedidos-requieren-aprobacion/', pedidos_requieren_aprobacion, name='pedidos_requieren_aprobacion'),
    path('aprobar-excepcion-pedido/<int:pedido_id>/', aprobar_excepcion_pedido, name='aprobar_excepcion_pedido'),
    
    # ========== PROGRAMACIÓN SEMANAL ==========
    path('programacion-semanal/', programacion_semanal, name='programacion-semanal'),  # ← AGREGADO
]