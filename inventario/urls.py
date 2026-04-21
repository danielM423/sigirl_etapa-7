from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, ProductoViewSet, MovimientoViewSet

# El router crea automáticamente las rutas REST para cada recurso del inventario.
router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'movimientos', MovimientoViewSet)

# Todas las rutas de esta app se publican bajo /api/.
urlpatterns = [
    path('api/', include(router.urls)),
]