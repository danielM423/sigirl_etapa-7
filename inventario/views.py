from rest_framework import viewsets
from .models import Categoria, Producto, Movimiento
from .serializers import (
    CategoriaSerializer,
    ProductoSerializer,
    MovimientoSerializer
)


# ViewSet CRUD para categorías.
# Django REST Framework genera listar, crear, editar y eliminar automáticamente.
class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer


# ViewSet CRUD para productos del inventario.
class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer


# ViewSet CRUD para registrar entradas y salidas de stock.
class MovimientoViewSet(viewsets.ModelViewSet):
    queryset = Movimiento.objects.all()
    serializer_class = MovimientoSerializer