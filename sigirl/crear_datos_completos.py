# crear_datos_completos.py
import django
django.setup()
from sigirl.inventario.models import Practica, Pedido, Producto, ReactivoPractica, EquipoPractica
from django.contrib.auth.models import User
from datetime import date, timedelta

def ver_estructura():
    print("=== VERIFICANDO ESTRUCTURA ===")
    try:
        from sigirl.inventario.models import Practica, Pedido, Producto
        print("✅ Modelos principales cargados correctamente")
        
        print(f"\nPrácticas totales: {Practica.objects.count()}")
        print(f"Pedidos totales: {Pedido.objects.count()}")
        print(f"Productos totales: {Producto.objects.count()}")
        
        # Ver campos de Practica
        print("\n=== CAMPOS DE PRACTICA ===")
        for field in Practica._meta.get_fields():
            if not field.auto_created:
                print(f"  - {field.name}: {field.get_internal_type()}")
    except Exception as e:
        print(f"❌ Error: {e}")

def crear_practica_simple():
    print("\n=== CREANDO PRÁCTICA SIMPLE ===")
    try:
        jymi = User.objects.get(username='jymi')
        print(f"✅ Usuario: {jymi.username}")
        
        # Ver qué campos requiere Practica
        practica = Practica.objects.create(
            ficha=f"PR-{Practica.objects.count() + 1:04d}",
            nombre="Practica de Analisis Quimico",
            fecha=date(2026, 8, 15),
            grupos_trabajo=5,
            instructor=jymi,
            competencia_id=1,  # Ajusta según tu competencia
            estado='pendiente'
        )
        print(f"✅ Práctica creada: ID {practica.id} - {practica.nombre}")
        return practica
    except Exception as e:
        print(f"❌ Error al crear práctica: {e}")
        return None

def crear_pedidos():
    print("\n=== CREANDO PEDIDOS ===")
    try:
        jymi = User.objects.get(username='jymi')
        productos = Producto.objects.all()
        
        if not productos:
            print("⚠️ No hay productos disponibles")
            return
        
        pedidos_creados = 0
        for i, prod in enumerate(productos[:5], 1):
            try:
                pedido = Pedido.objects.create(
                    producto=prod,
                    cantidad=2 + i,
                    prioridad='media',
                    solicitante='jymi jymi',
                    usuario=jymi,
                    estado='pendiente'
                )
                pedidos_creados += 1
                print(f"✅ {pedido.codigo}: {prod.nombre} x {2+i}")
            except Exception as e:
                print(f"⚠️ Error con producto {prod.nombre}: {e}")
        
        print(f"\n📦 Total pedidos creados: {pedidos_creados}")
    except Exception as e:
        print(f"❌ Error: {e}")

def ver_resumen():
    print("\n=== RESUMEN FINAL ===")
    try:
        jymi = User.objects.get(username='jymi')
        
        practicas = Practica.objects.filter(instructor=jymi)
        pedidos = Pedido.objects.filter(usuario=jymi)
        
        print(f"📋 Prácticas de jymi: {practicas.count()}")
        for p in practicas:
            print(f"  - ID: {p.id} | {p.nombre} | {p.estado}")
        
        print(f"\n📦 Pedidos de jymi: {pedidos.count()}")
        for p in pedidos:
            print(f"  - {p.codigo} | {p.producto.nombre} x {p.cantidad} | {p.estado}")
        
        print(f"\n📊 Totales generales:")
        print(f"  - Prácticas: {Practica.objects.count()}")
        print(f"  - Pedidos: {Pedido.objects.count()}")
        print(f"  - Productos: {Producto.objects.count()}")
    except Exception as e:
        print(f"❌ Error en resumen: {e}")

if __name__ == "__main__":
    print("🚀 INICIANDO CREACIÓN DE DATOS\n")
    ver_estructura()
    crear_practica_simple()
    crear_pedidos()
    ver_resumen()
    print("\n✅ ¡Proceso completado!")