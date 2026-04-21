from rest_framework import serializers
from .models import Categoria, Producto, Movimiento


# Convierte el modelo Categoria en JSON para exponerlo en la API.
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'


# Convierte productos a JSON e incluye dos campos calculados de solo lectura:
# bajo_stock y por_vencer.
class ProductoSerializer(serializers.ModelSerializer):
    bajo_stock = serializers.ReadOnlyField()
    por_vencer = serializers.ReadOnlyField()

    class Meta:
        model = Producto
        fields = '__all__'


# Convierte los movimientos de inventario a JSON.
class MovimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movimiento
        fields = '__all__'