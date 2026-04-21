from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Categoria, Producto, Movimiento

admin.site.register(Categoria)
admin.site.register(Producto)
admin.site.register(Movimiento)