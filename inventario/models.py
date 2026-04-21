from django.db import models
from datetime import date

# Modelo de categoría.
# Permite agrupar productos como reactivos, insumos o equipos.
class Categoria(models.Model):
    # Nombre visible de la categoría en formularios y tablas.
    nombre = models.CharField(max_length=100)

    # Texto que Django mostrará al representar este registro.
    def __str__(self):
        return self.nombre


# Modelo principal de productos del laboratorio.
# Almacena cantidades, mínimo permitido, ubicación y vencimiento.
class Producto(models.Model):
    # Lista cerrada de tipos permitidos para cada producto.
    TIPOS = [
        ('reactivo', 'Reactivo'),
        ('insumo', 'Insumo'),
        ('equipo', 'Equipo'),
    ]

    # Nombre descriptivo del producto.
    nombre = models.CharField(max_length=150)
    # Tipo lógico del recurso inventariado.
    tipo = models.CharField(max_length=20, choices=TIPOS)
    # Relación con su categoría.
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    # Cantidad disponible actualmente.
    cantidad = models.IntegerField()
    # Umbral mínimo permitido antes de disparar alerta.
    minimo = models.IntegerField()
    # Ubicación física del material dentro del laboratorio.
    ubicacion = models.CharField(max_length=100, blank=True, null=True)
    # Fecha de vencimiento opcional para reactivos o insumos.
    fecha_vencimiento = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.nombre

    # Devuelve True si la cantidad actual ya está en nivel crítico o por debajo del mínimo.
    def bajo_stock(self):
        return self.cantidad <= self.minimo

    # Devuelve True si el producto vence en 7 días o menos.
    def por_vencer(self):
        if self.fecha_vencimiento:
            return (self.fecha_vencimiento - date.today()).days <= 7
        return False


# Registra cada movimiento de inventario: entradas o salidas.
class Movimiento(models.Model):
    # Solo se permiten dos tipos de movimiento: entrada o salida.
    TIPOS = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
    ]

    # Producto afectado por el movimiento.
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    # Tipo de operación realizada sobre el stock.
    tipo = models.CharField(max_length=10, choices=TIPOS)
    # Cantidad movida.
    cantidad = models.IntegerField()
    # Fecha generada automáticamente al crear el registro.
    fecha = models.DateTimeField(auto_now_add=True)
    # Observación opcional para justificar el movimiento.
    observacion = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.tipo} - {self.producto.nombre}"