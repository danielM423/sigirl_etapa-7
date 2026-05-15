
from .views import AlertaViewSet, PedidoHistorialViewSet, PDFDocumentoViewSet, AsistenciaViewSet, ListadoDiarioViewSet

from django.urls import path, include
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
    top_reactivos_usados,
    instructores_list,
    inventario_practicas_abiertas_instructor,
)


router = DefaultRouter()
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

# --- ENDPOINTS FALTANTES ---

# --- ENDPOINTS FALTANTES ---
from .views_auditoria import AuditoriaViewSet
router.register(r'auditoria', AuditoriaViewSet)

from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model
from .serializers import UserManagementSerializer
User = get_user_model()
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserManagementSerializer
    permission_classes = [permissions.IsAdminUser]
router.register(r'usuarios', UsuarioViewSet)

urlpatterns = [
    # JWT (Public)
    path('token/', PublicTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', PublicTokenRefreshView.as_view(), name='token_refresh'),

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

    # Endpoint para top de reactivos más usados
    path('top-reactivos-usados/', top_reactivos_usados, name='top_reactivos_usados'),
    # Endpoint para instructores (todos los usuarios)
    path('instructores/', instructores_list, name='instructores_list'),
    # Endpoint para inventario de prácticas abiertas del instructor
    path('inventario-practicas-abiertas-instructor/', inventario_practicas_abiertas_instructor, name='inventario_practicas_abiertas_instructor'),
]