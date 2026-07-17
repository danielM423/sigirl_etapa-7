"""
Script completo para importar TODOS los datos desde Excel a SIGIRL
Ejecutar: python importar_excel_completo.py
"""

import os
import django
from datetime import date, datetime, timedelta
import pandas as pd
import re

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigirl.settings')
django.setup()

from django.contrib.auth import get_user_model
from sigirl.inventario.models import (
    Programa, Competencia, Practica, PracticaReactivo, 
    PracticaEquipo, PracticaMaterial, Producto, Categoria, 
    UnidadMedida, Ambiente, FranjaHoraria
)

User = get_user_model()

print("="*80)
print("📦 IMPORTADOR COMPLETO DE EXCEL A SIGIRL")
print("="*80)

# ============================================================
# 1. CREAR DATOS BASE
# ============================================================

def crear_categorias():
    """Crear categorías de productos"""
    print("\n📌 Creando categorías...")
    categorias = [
        'Solventes', 'Ácidos', 'Bases', 'EPP', 
        'Materiales de Vidrio', 'Instrumentos', 'Reactivos',
        'Sales', 'Oxidantes', 'Indicadores', 'Medios de cultivo',
        'Materiales de Laboratorio', 'Equipos de Laboratorio'
    ]
    
    for cat in categorias:
        Categoria.objects.get_or_create(nombre=cat)
        print(f"  ✅ {cat}")

def crear_unidades():
    """Crear unidades de medida"""
    print("\n📌 Creando unidades de medida...")
    unidades = [
        ('Mililitro', 'ml'), ('Gramo', 'g'), ('Unidades', 'uds'),
        ('Litro', 'L'), ('Kilogramo', 'kg'), ('Miligramo', 'mg'),
        ('Par', 'par'), ('Caja', 'caja'), ('Piezas', 'pz'),
        ('Mol', 'mol'), ('Metros', 'm'), ('Microgramo', 'µg')
    ]
    
    for nombre, simbolo in unidades:
        UnidadMedida.objects.get_or_create(nombre=nombre, simbolo=simbolo)
        print(f"  ✅ {nombre} ({simbolo})")

def crear_usuarios():
    """Crear usuarios de prueba"""
    print("\n📌 Creando usuarios...")
    usuarios = [
        {'username': 'admin', 'password': 'admin123', 'email': 'admin@sigirl.com', 'is_superuser': True, 'is_staff': True, 'first_name': 'Admin', 'last_name': 'Sistema'},
        {'username': 'jefe', 'password': 'jefe123', 'email': 'jefe@sigirl.com', 'is_superuser': False, 'is_staff': True, 'first_name': 'Jefe', 'last_name': 'Departamento'},
        {'username': 'usuario', 'password': 'usuario123', 'email': 'usuario@sigirl.com', 'is_superuser': False, 'is_staff': False, 'first_name': 'Usuario', 'last_name': 'Prueba'},
        {'username': 'instructor', 'password': 'instructor123', 'email': 'instructor@sigirl.com', 'is_superuser': False, 'is_staff': True, 'first_name': 'Instructor', 'last_name': 'Laboratorio'},
    ]
    
    for u in usuarios:
        user, created = User.objects.get_or_create(username=u['username'])
        if created:
            user.set_password(u['password'])
            user.email = u['email']
            user.first_name = u['first_name']
            user.last_name = u['last_name']
            user.is_superuser = u['is_superuser']
            user.is_staff = u['is_staff']
            user.save()
            print(f"  ✅ {u['username']} / {u['password']}")

def crear_ambientes():
    """Crear ambientes de laboratorio"""
    print("\n📌 Creando ambientes...")
    ambientes = [
        {'nombre': 'TOC 501', 'descripcion': 'Laboratorio de Química General', 'capacidad': 30},
        {'nombre': 'TOC 505', 'descripcion': 'Laboratorio de Química Analítica', 'capacidad': 25},
        {'nombre': 'TOC 507', 'descripcion': 'Laboratorio de Biotecnología', 'capacidad': 20},
        {'nombre': 'TOC 503', 'descripcion': 'Laboratorio de Instrumentación', 'capacidad': 15},
    ]
    
    for a in ambientes:
        Ambiente.objects.get_or_create(
            nombre=a['nombre'],
            defaults={'descripcion': a['descripcion'], 'capacidad': a['capacidad']}
        )
        print(f"  ✅ {a['nombre']}")

def crear_franjas():
    """Crear franjas horarias"""
    print("\n📌 Creando franjas horarias...")
    franjas = [
        {'nombre': 'Mañana', 'hora_inicio': '06:00', 'hora_fin': '12:00'},
        {'nombre': 'Tarde', 'hora_inicio': '12:00', 'hora_fin': '18:00'},
        {'nombre': 'Noche', 'hora_inicio': '18:00', 'hora_fin': '22:00'},
    ]
    
    for f in franjas:
        FranjaHoraria.objects.get_or_create(
            nombre=f['nombre'],
            defaults={'hora_inicio': f['hora_inicio'], 'hora_fin': f['hora_fin']}
        )
        print(f"  ✅ {f['nombre']}")

# ============================================================
# 2. IMPORTAR DATOS DESDE EXCEL
# ============================================================

def importar_desde_excel(ruta_archivo):
    """Importar datos desde un archivo Excel"""
    
    print(f"\n📂 Leyendo archivo: {ruta_archivo}")
    
    try:
        # Leer el Excel
        xls = pd.ExcelFile(ruta_archivo)
        df = pd.read_excel(ruta_archivo, sheet_name=xls.sheet_names[0])
        
        # Obtener el programa
        programa_nombre = str(df.iloc[0, 0]).strip()
        programa_codigo = str(df.iloc[0, 1]).strip() if not pd.isna(df.iloc[0, 1]) else "COD-001"
        
        # Crear o obtener programa
        programa, created = Programa.objects.get_or_create(
            nombre=programa_nombre,
            defaults={
                'codigo': programa_codigo,
                'version': '1.0',
                'activo': True
            }
        )
        print(f"  {'✅' if created else 'ℹ️'} Programa: {programa.nombre}")
        
        # Obtener instructor
        instructor = User.objects.filter(username='admin').first()
        if not instructor:
            instructor = User.objects.first()
        
        competencia_actual = None
        competencia_codigo = None
        practicas_creadas = 0
        
        for index, row in df.iterrows():
            # Saltar encabezados
            if index < 3:
                continue
            
            # Obtener valores
            codigo = str(row.iloc[1]).strip() if len(row) > 1 and not pd.isna(row.iloc[1]) else None
            competencia_texto = str(row.iloc[2]).strip() if len(row) > 2 and not pd.isna(row.iloc[2]) else None
            practica_texto = str(row.iloc[3]).strip() if len(row) > 3 and not pd.isna(row.iloc[3]) else None
            
            # Si hay código y competencia, crear competencia
            if codigo and codigo != 'nan' and competencia_texto and competencia_texto != 'nan':
                competencia_codigo = codigo
                competencia, created = Competencia.objects.get_or_create(
                    programa=programa,
                    codigo=competencia_codigo,
                    defaults={
                        'nombre': competencia_texto[:200],
                        'activo': True
                    }
                )
                competencia_actual = competencia
                if created:
                    print(f"\n  ✅ Competencia: {competencia_texto[:50]}...")
            
            # Si hay práctica y competencia actual, crear práctica
            elif practica_texto and practica_texto != 'nan' and competencia_actual:
                # Limpiar nombre
                practica_nombre = practica_texto.replace('Ã­', 'í').replace('Ã¡', 'á').replace('Ã©', 'é').replace('Ã³', 'ó').replace('Ãº', 'ú')
                
                practica, created = Practica.objects.get_or_create(
                    nombre=practica_nombre[:200],
                    competencia=competencia_actual,
                    defaults={
                        'ficha': f"{competencia_codigo}-{index}",
                        'fecha': date.today() + timedelta(days=practicas_creadas % 30),
                        'grupos_trabajo': 4,
                        'instructor': instructor,
                        'estado': 'pendiente',
                        'observaciones': f'Importada desde Excel - {competencia_actual.nombre[:30]}'
                    }
                )
                if created:
                    practicas_creadas += 1
                    print(f"    ✅ {practica_nombre[:60]}...")
        
        print(f"\n  📊 Total prácticas creadas: {practicas_creadas}")
        return True
        
    except Exception as e:
        print(f"❌ Error al importar: {e}")
        import traceback
        traceback.print_exc()
        return False

# ============================================================
# 3. ASIGNAR REACTIVOS/EQUIPOS/MATERIALES A PRÁCTICAS
# ============================================================

def asignar_productos_a_practicas():
    """Asignar reactivos, equipos y materiales a prácticas existentes"""
    print("\n" + "="*80)
    print("📋 ASIGNANDO REACTIVOS/EQUIPOS/MATERIALES A PRÁCTICAS")
    print("="*80)
    
    # Obtener unidades
    try:
        g = UnidadMedida.objects.get(simbolo='g')
        ml = UnidadMedida.objects.get(simbolo='ml')
        uds = UnidadMedida.objects.get(simbolo='uds')
        par = UnidadMedida.objects.get(simbolo='par')
        L = UnidadMedida.objects.get(simbolo='L')
    except UnidadMedida.DoesNotExist:
        print("❌ Unidades no encontradas")
        return 0
    
    # Obtener productos - CREARLOS SI NO EXISTEN
    productos = {}
    
    # Reactivos
    reactivos_data = [
        ('Ácido Clorhídrico (HCl)', 'reactivo', 'Ácidos', 5000, 500, 'Almacén B', 'ml'),
        ('Ácido Sulfúrico (H2SO4)', 'reactivo', 'Ácidos', 2500, 250, 'Almacén B', 'ml'),
        ('Ácido Nítrico (HNO3)', 'reactivo', 'Ácidos', 2500, 250, 'Almacén B', 'ml'),
        ('Ácido Acético (CH3COOH)', 'reactivo', 'Ácidos', 2000, 200, 'Almacén B', 'ml'),
        ('Hidróxido de Sodio (NaOH)', 'reactivo', 'Bases', 2000, 200, 'Almacén B', 'g'),
        ('Hidróxido de Potasio (KOH)', 'reactivo', 'Bases', 1000, 100, 'Almacén B', 'g'),
        ('Cloruro de Sodio (NaCl)', 'reactivo', 'Sales', 2000, 200, 'Almacén B', 'g'),
        ('Nitrato de Plata (AgNO3)', 'reactivo', 'Sales', 500, 50, 'Almacén B', 'g'),
        ('Tiosulfato de Sodio (Na2S2O3)', 'reactivo', 'Sales', 500, 50, 'Almacén B', 'g'),
        ('Cromato de Potasio (K2CrO4)', 'reactivo', 'Sales', 250, 25, 'Almacén B', 'g'),
        ('EDTA', 'reactivo', 'Sales', 500, 50, 'Almacén B', 'g'),
        ('Permanganato de Potasio (KMnO4)', 'reactivo', 'Oxidantes', 500, 50, 'Almacén B', 'g'),
        ('Etanol 96%', 'reactivo', 'Solventes', 5000, 500, 'Almacén A', 'ml'),
        ('Acetona', 'reactivo', 'Solventes', 5000, 500, 'Almacén A', 'ml'),
        ('Agua Destilada', 'reactivo', 'Solventes', 10000, 1000, 'Almacén A', 'ml'),
        ('Fenolftaleína', 'reactivo', 'Indicadores', 250, 25, 'Almacén B', 'ml'),
        ('Anaranjado de Metilo', 'reactivo', 'Indicadores', 250, 25, 'Almacén B', 'ml'),
        ('Azul de Metileno', 'reactivo', 'Indicadores', 250, 25, 'Almacén B', 'ml'),
        ('Agar Nutritivo', 'reactivo', 'Medios de cultivo', 1000, 100, 'Almacén E', 'g'),
        ('Peptona', 'reactivo', 'Medios de cultivo', 500, 50, 'Almacén E', 'g'),
        ('Extracto de Levadura', 'reactivo', 'Medios de cultivo', 500, 50, 'Almacén E', 'g'),
    ]
    
    for nombre, tipo, cat_nombre, cantidad, minimo, ubicacion, unidad in reactivos_data:
        try:
            cat = Categoria.objects.get(nombre=cat_nombre)
            prod, created = Producto.objects.get_or_create(
                nombre=nombre,
                defaults={
                    'tipo': tipo,
                    'categoria': cat,
                    'cantidad': cantidad,
                    'minimo': minimo,
                    'ubicacion': ubicacion,
                    'unidad': unidad
                }
            )
            productos[nombre] = prod
            if created:
                print(f"  ✅ Reactivo creado: {nombre}")
        except Categoria.DoesNotExist:
            print(f"  ⚠️ Categoría no encontrada: {cat_nombre}")
    
    # Equipos
    equipos_data = [
        ('Balanza Analítica', 'equipo', 'Instrumentos', 3, 1, 'Laboratorio 1', 'uds'),
        ('Balanza de Precisión', 'equipo', 'Instrumentos', 2, 1, 'Laboratorio 1', 'uds'),
        ('pHmetro (Potenciómetro)', 'equipo', 'Instrumentos', 3, 1, 'Laboratorio 1', 'uds'),
        ('Centrífuga', 'equipo', 'Instrumentos', 2, 1, 'Laboratorio 1', 'uds'),
        ('Refractómetro', 'equipo', 'Instrumentos', 2, 1, 'Laboratorio 1', 'uds'),
        ('Espectrofotómetro UV-VIS', 'equipo', 'Instrumentos', 2, 1, 'Laboratorio 1', 'uds'),
        ('Espectrómetro de Absorción Atómica (AAS)', 'equipo', 'Instrumentos', 1, 1, 'Laboratorio 2', 'uds'),
        ('Cromatógrafo de Gases (GCMS)', 'equipo', 'Instrumentos', 1, 1, 'Laboratorio 2', 'uds'),
        ('Polarímetro', 'equipo', 'Instrumentos', 1, 1, 'Laboratorio 1', 'uds'),
        ('Mufla', 'equipo', 'Equipos de Laboratorio', 2, 1, 'Laboratorio 1', 'uds'),
        ('Estufa de Secado', 'equipo', 'Equipos de Laboratorio', 2, 1, 'Laboratorio 1', 'uds'),
        ('Desecador', 'equipo', 'Equipos de Laboratorio', 4, 2, 'Laboratorio 1', 'uds'),
        ('Autoclave', 'equipo', 'Equipos de Laboratorio', 2, 1, 'Laboratorio de Biotecnología', 'uds'),
        ('Incubadora', 'equipo', 'Equipos de Laboratorio', 2, 1, 'Laboratorio de Biotecnología', 'uds'),
        ('Campana de Flujo Laminar', 'equipo', 'Equipos de Laboratorio', 1, 1, 'Laboratorio de Biotecnología', 'uds'),
        ('Campana de Extracción de Gases', 'equipo', 'Equipos de Laboratorio', 2, 1, 'Laboratorio 1', 'uds'),
        ('Destilador', 'equipo', 'Equipos de Laboratorio', 2, 1, 'Laboratorio 1', 'uds'),
        ('Termobalanza', 'equipo', 'Equipos de Laboratorio', 1, 1, 'Laboratorio 1', 'uds'),
    ]
    
    for nombre, tipo, cat_nombre, cantidad, minimo, ubicacion, unidad in equipos_data:
        try:
            cat = Categoria.objects.get(nombre=cat_nombre)
            prod, created = Producto.objects.get_or_create(
                nombre=nombre,
                defaults={
                    'tipo': tipo,
                    'categoria': cat,
                    'cantidad': cantidad,
                    'minimo': minimo,
                    'ubicacion': ubicacion,
                    'unidad': unidad
                }
            )
            productos[nombre] = prod
            if created:
                print(f"  ✅ Equipo creado: {nombre}")
        except Categoria.DoesNotExist:
            print(f"  ⚠️ Categoría no encontrada: {cat_nombre}")
    
    # Materiales
    materiales_data = [
        ('Probeta 50ml', 'insumo', 'Materiales de Vidrio', 10, 3, 'Almacén D', 'uds'),
        ('Probeta 100ml', 'insumo', 'Materiales de Vidrio', 10, 3, 'Almacén D', 'uds'),
        ('Probeta 250ml', 'insumo', 'Materiales de Vidrio', 5, 2, 'Almacén D', 'uds'),
        ('Probeta 500ml', 'insumo', 'Materiales de Vidrio', 5, 2, 'Almacén D', 'uds'),
        ('Matraz Erlenmeyer 125ml', 'insumo', 'Materiales de Vidrio', 10, 3, 'Almacén D', 'uds'),
        ('Matraz Erlenmeyer 250ml', 'insumo', 'Materiales de Vidrio', 10, 3, 'Almacén D', 'uds'),
        ('Matraz Erlenmeyer 500ml', 'insumo', 'Materiales de Vidrio', 5, 2, 'Almacén D', 'uds'),
        ('Matraz Aforado 50ml', 'insumo', 'Materiales de Vidrio', 6, 2, 'Almacén D', 'uds'),
        ('Matraz Aforado 100ml', 'insumo', 'Materiales de Vidrio', 6, 2, 'Almacén D', 'uds'),
        ('Matraz Aforado 250ml', 'insumo', 'Materiales de Vidrio', 4, 2, 'Almacén D', 'uds'),
        ('Matraz Aforado 500ml', 'insumo', 'Materiales de Vidrio', 4, 2, 'Almacén D', 'uds'),
        ('Vaso de Precipitados 50ml', 'insumo', 'Materiales de Vidrio', 10, 3, 'Almacén D', 'uds'),
        ('Vaso de Precipitados 100ml', 'insumo', 'Materiales de Vidrio', 10, 3, 'Almacén D', 'uds'),
        ('Vaso de Precipitados 250ml', 'insumo', 'Materiales de Vidrio', 5, 2, 'Almacén D', 'uds'),
        ('Vaso de Precipitados 500ml', 'insumo', 'Materiales de Vidrio', 5, 2, 'Almacén D', 'uds'),
        ('Pipeta Volumétrica 1ml', 'insumo', 'Materiales de Vidrio', 5, 2, 'Almacén D', 'uds'),
        ('Pipeta Volumétrica 5ml', 'insumo', 'Materiales de Vidrio', 5, 2, 'Almacén D', 'uds'),
        ('Pipeta Volumétrica 10ml', 'insumo', 'Materiales de Vidrio', 5, 2, 'Almacén D', 'uds'),
        ('Pipeta Volumétrica 25ml', 'insumo', 'Materiales de Vidrio', 3, 1, 'Almacén D', 'uds'),
        ('Bureta 25ml', 'insumo', 'Materiales de Vidrio', 5, 2, 'Almacén D', 'uds'),
        ('Bureta 50ml', 'insumo', 'Materiales de Vidrio', 5, 2, 'Almacén D', 'uds'),
        ('Crisol de Porcelana', 'insumo', 'Materiales de Vidrio', 20, 5, 'Almacén D', 'uds'),
        ('Varilla de Vidrio', 'insumo', 'Materiales de Vidrio', 20, 5, 'Almacén D', 'uds'),
        ('Tubos de Ensayo', 'insumo', 'Materiales de Vidrio', 200, 50, 'Almacén D', 'uds'),
        ('Placas de Petri', 'insumo', 'Materiales de Vidrio', 100, 20, 'Almacén D', 'uds'),
        ('Papel de Filtro', 'insumo', 'Materiales de Laboratorio', 500, 50, 'Almacén D', 'uds'),
        ('Papel pH', 'insumo', 'Materiales de Laboratorio', 500, 50, 'Almacén D', 'uds'),
        ('Gradilla para Tubos', 'insumo', 'Materiales de Laboratorio', 20, 5, 'Almacén D', 'uds'),
        ('Soporte Universal', 'insumo', 'Materiales de Laboratorio', 15, 5, 'Almacén D', 'uds'),
        ('Pinza para Crisol', 'insumo', 'Materiales de Laboratorio', 10, 3, 'Almacén D', 'uds'),
        ('Pinza para Bureta', 'insumo', 'Materiales de Laboratorio', 10, 3, 'Almacén D', 'uds'),
        ('Asa de Siembra', 'insumo', 'Materiales de Laboratorio', 10, 3, 'Almacén D', 'uds'),
        ('Mechero Bunsen', 'insumo', 'Materiales de Laboratorio', 5, 2, 'Almacén D', 'uds'),
        ('Espátula', 'insumo', 'Materiales de Laboratorio', 10, 3, 'Almacén D', 'uds'),
        ('Guantes de Nitrilo', 'insumo', 'EPP', 100, 20, 'Almacén C', 'par'),
        ('Guantes de Alta Temperatura', 'insumo', 'EPP', 10, 3, 'Almacén C', 'par'),
        ('Gafas de Seguridad', 'insumo', 'EPP', 30, 10, 'Almacén C', 'uds'),
        ('Bata de Laboratorio', 'insumo', 'EPP', 30, 10, 'Almacén C', 'uds'),
        ('Mascarillas N95', 'insumo', 'EPP', 50, 10, 'Almacén C', 'uds'),
    ]
    
    for nombre, tipo, cat_nombre, cantidad, minimo, ubicacion, unidad in materiales_data:
        try:
            cat = Categoria.objects.get(nombre=cat_nombre)
            prod, created = Producto.objects.get_or_create(
                nombre=nombre,
                defaults={
                    'tipo': tipo,
                    'categoria': cat,
                    'cantidad': cantidad,
                    'minimo': minimo,
                    'ubicacion': ubicacion,
                    'unidad': unidad
                }
            )
            productos[nombre] = prod
            if created:
                print(f"  ✅ Material creado: {nombre}")
        except Categoria.DoesNotExist:
            print(f"  ⚠️ Categoría no encontrada: {cat_nombre}")
    
    # ============================================================
    # ASIGNAR A PRÁCTICAS
    # ============================================================
    print("\n📌 Asignando productos a prácticas...")
    
    practicas = Practica.objects.all()
    asignaciones = 0
    
    for p in practicas:
        print(f"\n  📌 {p.nombre[:50]}...")
        
        # Asignar reactivos según el nombre de la práctica
        if 'ácido' in p.nombre.lower() or 'titulación' in p.nombre.lower() or 'neutralización' in p.nombre.lower():
            for nombre in ['Ácido Clorhídrico (HCl)', 'Hidróxido de Sodio (NaOH)', 'Fenolftaleína', 'Agua Destilada']:
                if nombre in productos:
                    pr, created = PracticaReactivo.objects.get_or_create(
                        practica=p,
                        reactivo=productos[nombre],
                        defaults={'cantidad': 50, 'unidad': ml, 'es_sensible': False}
                    )
                    if created:
                        asignaciones += 1
                        print(f"    ✅ Reactivo: {nombre}")
        
        if 'cloruros' in p.nombre.lower() or 'mohr' in p.nombre.lower():
            for nombre in ['Nitrato de Plata (AgNO3)', 'Cloruro de Sodio (NaCl)', 'Agua Destilada']:
                if nombre in productos:
                    pr, created = PracticaReactivo.objects.get_or_create(
                        practica=p,
                        reactivo=productos[nombre],
                        defaults={'cantidad': 50, 'unidad': ml if 'Agua' in nombre else g, 'es_sensible': False}
                    )
                    if created:
                        asignaciones += 1
                        print(f"    ✅ Reactivo: {nombre}")
        
        if 'permanganato' in p.nombre.lower() or 'kmno4' in p.nombre.lower():
            for nombre in ['Permanganato de Potasio (KMnO4)', 'Agua Destilada']:
                if nombre in productos:
                    pr, created = PracticaReactivo.objects.get_or_create(
                        practica=p,
                        reactivo=productos[nombre],
                        defaults={'cantidad': 50, 'unidad': ml if 'Agua' in nombre else g, 'es_sensible': False}
                    )
                    if created:
                        asignaciones += 1
                        print(f"    ✅ Reactivo: {nombre}")
        
        if 'soluciones' in p.nombre.lower():
            for nombre in ['Cloruro de Sodio (NaCl)', 'Agua Destilada', 'Etanol 96%']:
                if nombre in productos:
                    pr, created = PracticaReactivo.objects.get_or_create(
                        practica=p,
                        reactivo=productos[nombre],
                        defaults={'cantidad': 100, 'unidad': g if 'NaCl' in nombre else ml, 'es_sensible': False}
                    )
                    if created:
                        asignaciones += 1
                        print(f"    ✅ Reactivo: {nombre}")
        
        if 'balanza' in p.nombre.lower() or 'pesada' in p.nombre.lower():
            for nombre in ['Balanza Analítica']:
                if nombre in productos:
                    pe, created = PracticaEquipo.objects.get_or_create(
                        practica=p,
                        equipo=productos[nombre],
                        defaults={'tiempo_uso_min': 30, 'desgaste_estimado': 5, 'mantenimiento_requerido': False}
                    )
                    if created:
                        asignaciones += 1
                        print(f"    ✅ Equipo: {nombre}")
        
        # Asignar materiales a TODAS las prácticas
        materiales_base = [
            ('Guantes de Nitrilo', 1, 'par'),
            ('Gafas de Seguridad', 1, 'uds'),
            ('Bata de Laboratorio', 1, 'uds'),
            ('Probeta 100ml', 2, 'uds'),
            ('Matraz Erlenmeyer 250ml', 2, 'uds'),
            ('Vaso de Precipitados 100ml', 2, 'uds'),
        ]
        
        for nombre, cantidad, unidad in materiales_base:
            if nombre in productos:
                pm, created = PracticaMaterial.objects.get_or_create(
                    practica=p,
                    nombre=nombre,
                    defaults={
                        'cantidad_por_grupo': cantidad / 4,
                        'cantidad_total': cantidad,
                        'unidad': unidad
                    }
                )
                if created:
                    asignaciones += 1
                    print(f"    ✅ Material: {nombre}")
    
    print(f"\n📊 Total asignaciones: {asignaciones}")
    return asignaciones

# ============================================================
# 4. FUNCIÓN PRINCIPAL
# ============================================================

def main():
    print("\n" + "="*80)
    print("📦 IMPORTADOR COMPLETO DE EXCEL A SIGIRL")
    print("="*80)
    
    # 1. Crear datos base
    print("\n📌 CREANDO DATOS BASE...")
    crear_categorias()
    crear_unidades()
    crear_usuarios()
    crear_ambientes()
    crear_franjas()
    
    # 2. Importar desde Excel
    print("\n📌 BUSCANDO ARCHIVOS EXCEL...")
    
    archivos = []
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith(('.xlsx', '.xls')) and 'Prácticas' in file:
                archivos.append(os.path.join(root, file))
    
    if archivos:
        print(f"\n📂 Archivos encontrados:")
        for i, archivo in enumerate(archivos, 1):
            print(f"   {i}. {archivo}")
        
        for archivo in archivos:
            importar_desde_excel(archivo)
    else:
        print("\n⚠️ No se encontraron archivos Excel con 'Prácticas' en el nombre.")
        print("💡 Asegúrate de tener los archivos en la carpeta del proyecto.")
    
    # 3. Asignar productos a prácticas
    asignar_productos_a_practicas()
    
    # 4. Resumen final
    print("\n" + "="*80)
    print("📊 RESUMEN FINAL")
    print("="*80)
    print(f"   Usuarios: {User.objects.count()}")
    print(f"   Categorías: {Categoria.objects.count()}")
    print(f"   Unidades: {UnidadMedida.objects.count()}")
    print(f"   Productos: {Producto.objects.count()}")
    print(f"   Programas: {Programa.objects.count()}")
    print(f"   Competencias: {Competencia.objects.count()}")
    print(f"   Prácticas: {Practica.objects.count()}")
    print(f"   Reactivos en prácticas: {PracticaReactivo.objects.count()}")
    print(f"   Equipos en prácticas: {PracticaEquipo.objects.count()}")
    print(f"   Materiales en prácticas: {PracticaMaterial.objects.count()}")
    print(f"   Ambientes: {Ambiente.objects.count()}")
    print(f"   Franjas: {FranjaHoraria.objects.count()}")
    print("="*80)
    
    print("\n🎉 ¡IMPORTACIÓN COMPLETADA!")
    print("\n📝 USUARIOS DE PRUEBA:")
    print("   admin / admin123 (Administrador)")
    print("   jefe / jefe123 (Jefe)")
    print("   usuario / usuario123 (Usuario)")
    print("   instructor / instructor123 (Instructor)")

if __name__ == "__main__":
    main()