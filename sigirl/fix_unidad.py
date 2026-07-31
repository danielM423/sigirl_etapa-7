import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigirl.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("PRAGMA table_info(inventario_producto)")
    columnas = [col[1] for col in cursor.fetchall()]
    
    print("Columnas actuales:", columnas)
    
    if 'unidad' not in columnas:
        print("Agregando campo unidad...")
        cursor.execute("ALTER TABLE inventario_producto ADD COLUMN unidad varchar(30) DEFAULT 'unidades'")
        print("✅ Campo unidad agregado exitosamente!")
    else:
        print("✅ El campo unidad ya existe")
    
    cursor.execute("PRAGMA table_info(inventario_producto)")
    print("\nColumnas finales de la tabla:")
    for col in cursor.fetchall():
        print(f"  - {col[1]}")
