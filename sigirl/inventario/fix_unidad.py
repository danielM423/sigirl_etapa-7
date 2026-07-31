# fix_unidad.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigirl.settings')
django.setup()

from django.db import connection

def agregar_campo_unidad():
    print("=== AGREGANDO CAMPO UNIDAD A PRODUCTO ===\n")
    
    with connection.cursor() as cursor:
        # Verificar columnas
        cursor.execute("PRAGMA table_info(inventario_producto)")
        columnas = [col[1] for col in cursor.fetchall()]
        
        print("Columnas existentes:", columnas)
        
        if 'unidad' not in columnas:
            print("\nAgregando campo 'unidad'...")
            cursor.execute("ALTER TABLE inventario_producto ADD COLUMN unidad varchar(30) DEFAULT 'unidades'")
            print("✅ Campo 'unidad' agregado correctamente!")
        else:
            print("\n✅ El campo 'unidad' ya existe")
        
        # Verificar resultado
        cursor.execute("PRAGMA table_info(inventario_producto)")
        print("\nColumnas finales:")
        for col in cursor.fetchall():
            print(f"  {col[1]}")
    
    # Probar crear un producto
    print("\n=== PROBANDO CREACIÓN DE PRODUCTO ===")
    from inventario.models import Categoria, Producto
    
    # Recargar models
    from django.apps import apps
    apps.clear_cache()
    from inventario.models import Producto
    
    try:
        cat, _ = Categoria.objects.get_or_create(nombre='Prueba Unidad')
        p = Producto(
            nombre='Producto de Prueba',
            tipo='reactivo',
            categoria=cat,
            unidad='ml',
            cantidad=100,
            minimo=10,
            ubicacion='Test'
        )
        p.save()
        print(f"✅ Producto creado: {p.nombre} - {p.cantidad} {p.unidad}")
        # Limpiar producto de prueba
        p.delete()
        print("✅ Prueba exitosa!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    agregar_campo_unidad()