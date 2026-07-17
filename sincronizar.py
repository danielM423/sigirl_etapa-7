from datetime import date, timedelta
from django.contrib.auth.models import User

try:
    from inventario.models import Pedido, Practica, ProgramacionLaboratorio, Ambiente, FranjaHoraria
    print("✅ Importado desde inventario.models")
except ModuleNotFoundError:
    try:
        from sigirl.inventario.models import Pedido, Practica, ProgramacionLaboratorio, Ambiente, FranjaHoraria
        print("✅ Importado desde sigirl.inventario.models")
    except ModuleNotFoundError:
        print("❌ No se encontraron los modelos")
        exit()

instructor = User.objects.first()
print(f"👨‍🏫 Instructor: {instructor.username if instructor else 'No hay usuario'}")

ambiente, _ = Ambiente.objects.get_or_create(nombre="TOC 501")
print(f"🏢 Ambiente: {ambiente.nombre}")

franja_manana, _ = FranjaHoraria.objects.get_or_create(
    nombre="Mañana",
    defaults={"hora_inicio": "06:00", "hora_fin": "12:00"}
)
print(f"🌅 Franja Mañana: {franja_manana.nombre}")

franja_tarde, _ = FranjaHoraria.objects.get_or_create(
    nombre="Tarde",
    defaults={"hora_inicio": "12:00", "hora_fin": "18:00"}
)
print(f"☀️ Franja Tarde: {franja_tarde.nombre}")

pedidos_aprobados = Pedido.objects.filter(estado='aprobado')
print(f"📋 Pedidos aprobados: {pedidos_aprobados.count()}")

practicas_count = Practica.objects.count()
print(f"📚 Prácticas disponibles: {practicas_count}")

if practicas_count == 0:
    print("❌ No hay prácticas en el sistema. Crea una práctica primero.")
else:
    creados = 0
    errores = 0

    for pedido in pedidos_aprobados:
        try:
            practica = None
            if pedido.observaciones:
                import re
                match = re.search(r'Práctica:\s*(.+?)(?:\n|$)', pedido.observaciones)
                if match:
                    nombre_practica = match.group(1).strip()
                    practica = Practica.objects.filter(nombre__icontains=nombre_practica).first()
                    if practica:
                        print(f"🔍 Práctica encontrada: {practica.nombre}")
            
            if not practica:
                practica = Practica.objects.first()
                if practica:
                    print(f"📌 Usando práctica por defecto: {practica.nombre}")
                else:
                    print("❌ No hay prácticas disponibles")
                    continue
            
            fecha = pedido.fecha_solicitud or date.today()
            franja = franja_manana if pedido.id % 2 == 0 else franja_tarde
            
            programacion, created = ProgramacionLaboratorio.objects.get_or_create(
                practica=practica,
                fecha=fecha,
                ambiente=ambiente,
                franja=franja,
                defaults={
                    'instructor': instructor,
                    'grupo': f"GRUPO-{pedido.id}",
                    'observaciones': f"Programación automática para pedido {pedido.codigo}",
                    'estado': 'programado'
                }
            )
            
            if created:
                creados += 1
                print(f"✅ Creado: {pedido.codigo} - {practica.nombre} - {fecha} - {franja.nombre}")
            else:
                print(f"⚠️ Ya existe: {pedido.codigo}")
                
        except Exception as e:
            errores += 1
            print(f"❌ Error con pedido {pedido.id}: {e}")

    print(f"\n📊 RESUMEN:")
    print(f"  ✅ Programaciones creadas: {creados}")
    print(f"  ❌ Errores: {errores}")
    print(f"  📋 Total pedidos aprobados: {pedidos_aprobados.count()}")

    programaciones = ProgramacionLaboratorio.objects.all()
    print(f"\n📅 Total programaciones en BD: {programaciones.count()}")
    for p in programaciones:
        print(f"  📅 {p.fecha} - {p.practica.nombre} - {p.ambiente.nombre} - {p.franja.nombre} - {p.estado}")