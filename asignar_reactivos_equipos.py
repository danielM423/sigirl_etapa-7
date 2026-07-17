"""
Script para asignar reactivos y equipos a prácticas existentes
Ejecutar: python asignar_reactivos_equipos.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigirl.settings')
django.setup()

from sigirl.inventario.models import (
    Producto, UnidadMedida, 
    Practica, PracticaReactivo, PracticaEquipo
)

print("="*60)
print("🧪 ASIGNANDO REACTIVOS Y EQUIPOS A PRÁCTICAS")
print("="*60)

# Obtener unidades
g = UnidadMedida.objects.get(simbolo='g')
ml = UnidadMedida.objects.get(simbolo='ml')
uds = UnidadMedida.objects.get(simbolo='uds')

# Obtener productos
try:
    reactivo_agua = Producto.objects.get(nombre='Agua Destilada')
    reactivo_nacl = Producto.objects.get(nombre='Cloruro de Sodio (NaCl)')
    reactivo_hcl = Producto.objects.get(nombre='Ácido Clorhídrico (HCl)')
    reactivo_naoh = Producto.objects.get(nombre='Hidróxido de Sodio (NaOH)')
    reactivo_etanol = Producto.objects.get(nombre='Etanol 96%')
    reactivo_acetona = Producto.objects.get(nombre='Acetona')
    
    equipo_balanza = Producto.objects.get(nombre='Balanza Analítica')
    equipo_phmetro = Producto.objects.get(nombre='pHmetro (Potenciómetro)')
    equipo_centrifuga = Producto.objects.get(nombre='Centrífuga')
    equipo_mufla = Producto.objects.get(nombre='Mufla')
    equipo_estufa = Producto.objects.get(nombre='Estufa de Secado')
    equipo_desecador = Producto.objects.get(nombre='Desecador')
    
    print("✅ Productos encontrados")
except Producto.DoesNotExist as e:
    print(f"❌ Producto no encontrado: {e}")
    exit()

asignaciones = 0

for p in Practica.objects.all():
    print(f"\n📌 {p.nombre[:50]}...")
    
    # ============================================================
    # ASIGNAR REACTIVOS
    # ============================================================
    
    # Práctica 1: Identificación del material
    if 'identificación' in p.nombre.lower():
        # No necesita reactivos específicos
        pass
    
    # Práctica 2: Clasificación del material
    elif 'clasificación' in p.nombre.lower():
        # No necesita reactivos específicos
        pass
    
    # Práctica 3: Medición de volúmenes
    elif 'medición' in p.nombre.lower() or 'volúmenes' in p.nombre.lower():
        # Agua destilada
        pr, created = PracticaReactivo.objects.get_or_create(
            practica=p,
            reactivo=reactivo_agua,
            defaults={'cantidad': 500, 'unidad': ml, 'es_sensible': False}
        )
        if created:
            asignaciones += 1
            print(f"  ✅ Reactivo: Agua Destilada - 500 ml")
        
        # Cloruro de Sodio
        pr, created = PracticaReactivo.objects.get_or_create(
            practica=p,
            reactivo=reactivo_nacl,
            defaults={'cantidad': 50, 'unidad': g, 'es_sensible': False}
        )
        if created:
            asignaciones += 1
            print(f"  ✅ Reactivo: Cloruro de Sodio - 50 g")
    
    # Práctica: Balanza analítica
    if 'balanza' in p.nombre.lower() or 'pesada' in p.nombre.lower():
        # No necesita reactivos específicos
        pass
    
    # ============================================================
    # ASIGNAR EQUIPOS
    # ============================================================
    
    # Balanza analítica
    if 'balanza' in p.nombre.lower() or 'pesada' in p.nombre.lower():
        pe, created = PracticaEquipo.objects.get_or_create(
            practica=p,
            equipo=equipo_balanza,
            defaults={'tiempo_uso_min': 30, 'desgaste_estimado': 5, 'mantenimiento_requerido': False}
        )
        if created:
            asignaciones += 1
            print(f"  ✅ Equipo: Balanza Analítica - 30 min")
    
    # pHmetro
    if 'ph' in p.nombre.lower() or 'potenciómetro' in p.nombre.lower():
        pe, created = PracticaEquipo.objects.get_or_create(
            practica=p,
            equipo=equipo_phmetro,
            defaults={'tiempo_uso_min': 20, 'desgaste_estimado': 3, 'mantenimiento_requerido': False}
        )
        if created:
            asignaciones += 1
            print(f"  ✅ Equipo: pHmetro - 20 min")
    
    # Centrífuga
    if 'centrífuga' in p.nombre.lower():
        pe, created = PracticaEquipo.objects.get_or_create(
            practica=p,
            equipo=equipo_centrifuga,
            defaults={'tiempo_uso_min': 15, 'desgaste_estimado': 3, 'mantenimiento_requerido': False}
        )
        if created:
            asignaciones += 1
            print(f"  ✅ Equipo: Centrífuga - 15 min")
    
    # Mufla
    if 'mufla' in p.nombre.lower() or 'cenizas' in p.nombre.lower():
        pe, created = PracticaEquipo.objects.get_or_create(
            practica=p,
            equipo=equipo_mufla,
            defaults={'tiempo_uso_min': 60, 'desgaste_estimado': 10, 'mantenimiento_requerido': True}
        )
        if created:
            asignaciones += 1
            print(f"  ✅ Equipo: Mufla - 60 min")
    
    # Estufa de Secado
    if 'estufa' in p.nombre.lower() or 'secado' in p.nombre.lower():
        pe, created = PracticaEquipo.objects.get_or_create(
            practica=p,
            equipo=equipo_estufa,
            defaults={'tiempo_uso_min': 45, 'desgaste_estimado': 5, 'mantenimiento_requerido': False}
        )
        if created:
            asignaciones += 1
            print(f"  ✅ Equipo: Estufa de Secado - 45 min")
    
    # Desecador
    if 'desecador' in p.nombre.lower():
        pe, created = PracticaEquipo.objects.get_or_create(
            practica=p,
            equipo=equipo_desecador,
            defaults={'tiempo_uso_min': 30, 'desgaste_estimado': 2, 'mantenimiento_requerido': False}
        )
        if created:
            asignaciones += 1
            print(f"  ✅ Equipo: Desecador - 30 min")

print("\n" + "="*60)
print("📊 RESUMEN")
print("="*60)
print(f"   Reactivos en prácticas: {PracticaReactivo.objects.count()}")
print(f"   Equipos en prácticas: {PracticaEquipo.objects.count()}")
print(f"   Total nuevas asignaciones: {asignaciones}")
print("="*60)
print("\n🎉 ¡ASIGNACIÓN COMPLETADA!")