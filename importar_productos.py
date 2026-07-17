"""
Script para importar productos al inventario SIGIRL (VERSIÓN CORTA)
Ejecutar: python importar_productos.py
"""

import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigirl.settings')
django.setup()

from django.contrib.auth import get_user_model
from sigirl.inventario.models import (
    Producto, Categoria, UnidadMedida, 
    Practica, PracticaReactivo, PracticaEquipo, PracticaMaterial
)

User = get_user_model()

# Obtener categorías
cat_solventes = Categoria.objects.get(nombre='Solventes')
cat_acidos = Categoria.objects.get(nombre='Ácidos')
cat_bases = Categoria.objects.get(nombre='Bases')
cat_sales = Categoria.objects.get(nombre='Sales')
cat_oxidantes = Categoria.objects.get(nombre='Oxidantes')
cat_indicadores = Categoria.objects.get(nombre='Indicadores')
cat_medios = Categoria.objects.get(nombre='Medios de cultivo')
cat_instrumentos = Categoria.objects.get(nombre='Instrumentos')
cat_equipos = Categoria.objects.get(nombre='Equipos de Laboratorio')
cat_materiales = Categoria.objects.get(nombre='Materiales de Laboratorio')
cat_vidrio = Categoria.objects.get(nombre='Materiales de Vidrio')
cat_epp = Categoria.objects.get(nombre='EPP')

# Unidades
ml = UnidadMedida.objects.get(simbolo='ml')
g = UnidadMedida.objects.get(simbolo='g')
uds = UnidadMedida.objects.get(simbolo='uds')
par = UnidadMedida.objects.get(simbolo='par')

print("\n📌 Creando REACTIVOS...")
reactivos = [
    {'nombre': 'Ácido Clorhídrico (HCl)', 'tipo': 'reactivo', 'categoria': cat_acidos, 'cantidad': 5000, 'minimo': 500, 'ubicacion': 'Almacén B', 'unidad': 'ml'},
    {'nombre': 'Ácido Sulfúrico (H2SO4)', 'tipo': 'reactivo', 'categoria': cat_acidos, 'cantidad': 2500, 'minimo': 250, 'ubicacion': 'Almacén B', 'unidad': 'ml'},
    {'nombre': 'Ácido Nítrico (HNO3)', 'tipo': 'reactivo', 'categoria': cat_acidos, 'cantidad': 2500, 'minimo': 250, 'ubicacion': 'Almacén B', 'unidad': 'ml'},
    {'nombre': 'Hidróxido de Sodio (NaOH)', 'tipo': 'reactivo', 'categoria': cat_bases, 'cantidad': 2000, 'minimo': 200, 'ubicacion': 'Almacén B', 'unidad': 'g'},
    {'nombre': 'Cloruro de Sodio (NaCl)', 'tipo': 'reactivo', 'categoria': cat_sales, 'cantidad': 2000, 'minimo': 200, 'ubicacion': 'Almacén B', 'unidad': 'g'},
    {'nombre': 'Nitrato de Plata (AgNO3)', 'tipo': 'reactivo', 'categoria': cat_sales, 'cantidad': 500, 'minimo': 50, 'ubicacion': 'Almacén B', 'unidad': 'g'},
    {'nombre': 'Etanol 96%', 'tipo': 'reactivo', 'categoria': cat_solventes, 'cantidad': 5000, 'minimo': 500, 'ubicacion': 'Almacén A', 'unidad': 'ml'},
    {'nombre': 'Acetona', 'tipo': 'reactivo', 'categoria': cat_solventes, 'cantidad': 5000, 'minimo': 500, 'ubicacion': 'Almacén A', 'unidad': 'ml'},
    {'nombre': 'Agua Destilada', 'tipo': 'reactivo', 'categoria': cat_solventes, 'cantidad': 10000, 'minimo': 1000, 'ubicacion': 'Almacén A', 'unidad': 'ml'},
    {'nombre': 'Fenolftaleína', 'tipo': 'reactivo', 'categoria': cat_indicadores, 'cantidad': 250, 'minimo': 25, 'ubicacion': 'Almacén B', 'unidad': 'ml'},
]

for r in reactivos:
    Producto.objects.get_or_create(
        nombre=r['nombre'],
        defaults={
            'tipo': r['tipo'],
            'categoria': r['categoria'],
            'cantidad': r['cantidad'],
            'minimo': r['minimo'],
            'ubicacion': r['ubicacion'],
            'unidad': r['unidad']
        }
    )
    print(f"  ✅ {r['nombre']}")

print("\n📌 Creando EQUIPOS...")
equipos = [
    {'nombre': 'Balanza Analítica', 'tipo': 'equipo', 'categoria': cat_instrumentos, 'cantidad': 3, 'minimo': 1, 'ubicacion': 'Laboratorio 1', 'unidad': 'uds'},
    {'nombre': 'pHmetro (Potenciómetro)', 'tipo': 'equipo', 'categoria': cat_instrumentos, 'cantidad': 3, 'minimo': 1, 'ubicacion': 'Laboratorio 1', 'unidad': 'uds'},
    {'nombre': 'Centrífuga', 'tipo': 'equipo', 'categoria': cat_instrumentos, 'cantidad': 2, 'minimo': 1, 'ubicacion': 'Laboratorio 1', 'unidad': 'uds'},
    {'nombre': 'Espectrofotómetro UV-VIS', 'tipo': 'equipo', 'categoria': cat_instrumentos, 'cantidad': 2, 'minimo': 1, 'ubicacion': 'Laboratorio 1', 'unidad': 'uds'},
    {'nombre': 'Mufla', 'tipo': 'equipo', 'categoria': cat_equipos, 'cantidad': 2, 'minimo': 1, 'ubicacion': 'Laboratorio 1', 'unidad': 'uds'},
    {'nombre': 'Estufa de Secado', 'tipo': 'equipo', 'categoria': cat_equipos, 'cantidad': 2, 'minimo': 1, 'ubicacion': 'Laboratorio 1', 'unidad': 'uds'},
    {'nombre': 'Desecador', 'tipo': 'equipo', 'categoria': cat_equipos, 'cantidad': 4, 'minimo': 2, 'ubicacion': 'Laboratorio 1', 'unidad': 'uds'},
]

for e in equipos:
    Producto.objects.get_or_create(
        nombre=e['nombre'],
        defaults={
            'tipo': e['tipo'],
            'categoria': e['categoria'],
            'cantidad': e['cantidad'],
            'minimo': e['minimo'],
            'ubicacion': e['ubicacion'],
            'unidad': e['unidad']
        }
    )
    print(f"  ✅ {e['nombre']}")

print("\n📌 Creando MATERIALES...")
materiales = [
    {'nombre': 'Probeta 100ml', 'tipo': 'insumo', 'categoria': cat_vidrio, 'cantidad': 10, 'minimo': 3, 'ubicacion': 'Almacén D', 'unidad': 'uds'},
    {'nombre': 'Matraz Erlenmeyer 250ml', 'tipo': 'insumo', 'categoria': cat_vidrio, 'cantidad': 10, 'minimo': 3, 'ubicacion': 'Almacén D', 'unidad': 'uds'},
    {'nombre': 'Vaso de Precipitados 100ml', 'tipo': 'insumo', 'categoria': cat_vidrio, 'cantidad': 10, 'minimo': 3, 'ubicacion': 'Almacén D', 'unidad': 'uds'},
    {'nombre': 'Pipeta Volumétrica 10ml', 'tipo': 'insumo', 'categoria': cat_vidrio, 'cantidad': 5, 'minimo': 2, 'ubicacion': 'Almacén D', 'unidad': 'uds'},
    {'nombre': 'Bureta 25ml', 'tipo': 'insumo', 'categoria': cat_vidrio, 'cantidad': 5, 'minimo': 2, 'ubicacion': 'Almacén D', 'unidad': 'uds'},
    {'nombre': 'Crisol de Porcelana', 'tipo': 'insumo', 'categoria': cat_vidrio, 'cantidad': 20, 'minimo': 5, 'ubicacion': 'Almacén D', 'unidad': 'uds'},
    {'nombre': 'Papel de Filtro', 'tipo': 'insumo', 'categoria': cat_materiales, 'cantidad': 500, 'minimo': 50, 'ubicacion': 'Almacén D', 'unidad': 'uds'},
    {'nombre': 'Guantes de Nitrilo', 'tipo': 'insumo', 'categoria': cat_epp, 'cantidad': 100, 'minimo': 20, 'ubicacion': 'Almacén C', 'unidad': 'par'},
    {'nombre': 'Gafas de Seguridad', 'tipo': 'insumo', 'categoria': cat_epp, 'cantidad': 30, 'minimo': 10, 'ubicacion': 'Almacén C', 'unidad': 'uds'},
    {'nombre': 'Bata de Laboratorio', 'tipo': 'insumo', 'categoria': cat_epp, 'cantidad': 30, 'minimo': 10, 'ubicacion': 'Almacén C', 'unidad': 'uds'},
]

for m in materiales:
    Producto.objects.get_or_create(
        nombre=m['nombre'],
        defaults={
            'tipo': m['tipo'],
            'categoria': m['categoria'],
            'cantidad': m['cantidad'],
            'minimo': m['minimo'],
            'ubicacion': m['ubicacion'],
            'unidad': m['unidad']
        }
    )
    print(f"  ✅ {m['nombre']}")

print("\n" + "="*60)
print("📊 RESUMEN")
print("="*60)
print(f"   Productos: {Producto.objects.count()}")
print("="*60)
print("\n🎉 ¡PRODUCTOS IMPORTADOS!")