from django.contrib import admin
from django.urls import path
from .views import (
    AprobarPedidoView,
    PedidoHistorialViewSet,
    RechazarPedidoView,
    pedidos_requieren_aprobacion,
    register,
    get_current_user,
    manage_profile,
    verify_email,
    verify_email_code,
    resend_verification_email,
    PublicTokenObtainPairView,
    PublicTokenRefreshView,
    ProductoViewSet,
    PracticaViewSet,
    UserManagementViewSet,
    AsistenciaViewSet,
    ListadoDiarioViewSet,
    CategoriaViewSet,
    MovimientoViewSet,
    PedidoViewSet,
    AlertaViewSet,
    ProgramaViewSet,
    CompetenciaViewSet,
    FormularioPlantillaViewSet,
    CampoFormularioViewSet,
    FormularioRespuestaViewSet,
    MantenimientoEquipoViewSet,
    AmbienteViewSet,
    FranjaHorariaViewSet,
    ProgramacionLaboratorioViewSet,
    programacion_semanal,
    mis_formularios,
    calcular_pedido,
    generar_pedido,
    aprobar_excepcion_pedido,
    reporte_sustancias_controladas,
    toggle_reactivo_sensible,
    crear_reactivo_sensible,
    generar_pdf_solicitud,
    reporte_equipos,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Autenticación
    path('register/', register, name='register'),
    path('verify-email/<str:uidb64>/<str:token>/', verify_email, name='verify_email'),
    path('verify-email-code/', verify_email_code, name='verify_email_code'),
    path('auth/verify-email-code/', verify_email_code, name='auth_verify_email_code'),
    path('resend-verification/', resend_verification_email, name='resend_verification_email'),
    path('auth/resend-verification/', resend_verification_email, name='auth_resend_verification_email'),
    path('current-user/', get_current_user, name='current_user'),
    path('auth/user/', get_current_user, name='auth_user'),
    path('profile/', manage_profile, name='profile'),
    path('auth/profile/', manage_profile, name='auth_profile'),
    path('token/', PublicTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', PublicTokenRefreshView.as_view(), name='token_refresh'),
    
    # Aprobar y Rechazar
    path('pedidos/<int:pk>/aprobar/', AprobarPedidoView.as_view(), name='aprobar-pedido'),
    path('pedidos/<int:pk>/rechazar/', RechazarPedidoView.as_view(), name='rechazar-pedido'),
    path('pedidos-requieren-aprobacion/', pedidos_requieren_aprobacion, name='pedidos_requieren_aprobacion'),
    
    # Gestión de datos
    path('productos/', ProductoViewSet.as_view({'get': 'list', 'post': 'create'}), name='productos-list'),
    path('productos/<int:pk>/', ProductoViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='productos-detail'),
    path('usuarios/', UserManagementViewSet.as_view({'get': 'list', 'post': 'create'}), name='usuarios-list'),
    path('usuarios/<int:pk>/', UserManagementViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='usuarios-detail'),
    path('practicas/', PracticaViewSet.as_view({'get': 'list', 'post': 'create'}), name='practicas-list'),
    path('practicas/<int:pk>/', PracticaViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='practicas-detail'),
    path('asistencias/', AsistenciaViewSet.as_view({'get': 'list', 'post': 'create'}), name='asistencias-list'),
    path('asistencias/<int:pk>/', AsistenciaViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='asistencias-detail'),
    path('listados-diarios/', ListadoDiarioViewSet.as_view({'get': 'list', 'post': 'create'}), name='listados-diarios-list'),
    path('listados-diarios/<int:pk>/', ListadoDiarioViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='listados-diarios-detail'),
    path('categorias/', CategoriaViewSet.as_view({'get': 'list', 'post': 'create'}), name='categorias-list'),
    path('categorias/<int:pk>/', CategoriaViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='categorias-detail'),
    path('movimientos/', MovimientoViewSet.as_view({'get': 'list', 'post': 'create'}), name='movimientos-list'),
    path('movimientos/<int:pk>/', MovimientoViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='movimientos-detail'),
    path('pedidos/', PedidoViewSet.as_view({'get': 'list', 'post': 'create'}), name='pedidos-list'),
    path('pedidos/<int:pk>/', PedidoViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='pedidos-detail'),
    path('alertas/', AlertaViewSet.as_view({'get': 'list', 'post': 'create'}), name='alertas-list'),
    path('alertas/<int:pk>/', AlertaViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='alertas-detail'),
    
    # Programas y Competencias
    path('programas/', ProgramaViewSet.as_view({'get': 'list', 'post': 'create'}), name='programas-list'),
    path('programas/<int:pk>/', ProgramaViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='programas-detail'),
    path('competencias/', CompetenciaViewSet.as_view({'get': 'list', 'post': 'create'}), name='competencias-list'),
    path('competencias/<int:pk>/', CompetenciaViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='competencias-detail'),
    
    # Formularios
    path('formularios-plantilla/', FormularioPlantillaViewSet.as_view({'get': 'list', 'post': 'create'}), name='formularios-plantilla-list'),
    path('formularios-plantilla/<int:pk>/', FormularioPlantillaViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='formularios-plantilla-detail'),
    path('formularios-campos/', CampoFormularioViewSet.as_view({'get': 'list', 'post': 'create'}), name='formularios-campos-list'),
    path('formularios-campos/<int:pk>/', CampoFormularioViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='formularios-campos-detail'),
    path('formularios-respuesta/', FormularioRespuestaViewSet.as_view({'get': 'list', 'post': 'create'}), name='formularios-respuesta-list'),
    path('formularios-respuesta/<int:pk>/', FormularioRespuestaViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='formularios-respuesta-detail'),
    path('mis-formularios/', mis_formularios, name='mis-formularios'),
    
    # Mantenimientos
    path('mantenimientos-equipo/', MantenimientoEquipoViewSet.as_view({'get': 'list', 'post': 'create'}), name='mantenimientos-equipo-list'),
    path('mantenimientos-equipo/<int:pk>/', MantenimientoEquipoViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='mantenimientos-equipo-detail'),
    path('reporte-equipos/', reporte_equipos, name='reporte-equipos'),
    
    # Programación
    path('ambientes/', AmbienteViewSet.as_view({'get': 'list', 'post': 'create'}), name='ambientes-list'),
    path('ambientes/<int:pk>/', AmbienteViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='ambientes-detail'),
    path('franjas-horarias/', FranjaHorariaViewSet.as_view({'get': 'list', 'post': 'create'}), name='franjas-horarias-list'),
    path('franjas-horarias/<int:pk>/', FranjaHorariaViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='franjas-horarias-detail'),
    path('programacion-laboratorio/', ProgramacionLaboratorioViewSet.as_view({'get': 'list', 'post': 'create'}), name='programacion-laboratorio-list'),
    path('programacion-laboratorio/<int:pk>/', ProgramacionLaboratorioViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='programacion-laboratorio-detail'),
    path('programacion-semanal/', programacion_semanal, name='programacion-semanal'),
    
    # Cálculo de pedidos
    path('calculo-pedido/calcular/', calcular_pedido, name='calcular-pedido'),
    path('calculo-pedido/generar_pedido/', generar_pedido, name='generar-pedido'),
    path('calculo-pedido/aprobar-excepcion/<int:pedido_id>/', aprobar_excepcion_pedido, name='aprobar-excepcion-pedido'),
    
    # PDF
    path('generar-pdf-solicitud/', generar_pdf_solicitud, name='generar-pdf-solicitud'),
    
    # Sustancias controladas
    path('reporte-sustancias-controladas/', reporte_sustancias_controladas, name='reporte-sustancias-controladas'),
    path('toggle-reactivo-sensible/<int:reactivo_id>/', toggle_reactivo_sensible, name='toggle-reactivo-sensible'),
    path('crear-reactivo-sensible/', crear_reactivo_sensible, name='crear-reactivo-sensible'),
    
    # Historial de pedidos
    path('pedidos-historial/', PedidoHistorialViewSet.as_view({'get': 'list'}), name='pedidos-historial'),
    path('pedido-historial/', PedidoHistorialViewSet.as_view({'get': 'list'}), name='pedido-historial'),
]