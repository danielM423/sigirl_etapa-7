
from django.contrib.auth.models import User
from inventario.models import Categoria, Producto, Movimiento, Pedido, HistorialCambio, Alerta, UserProfile
from django.utils import timezone
from datetime import date, timedelta
import random

# Crear usuarios
usuarios = []
for i in range(1, 6):
    user, _ = User.objects.get_or_create(
        username=f'usuario{i}', defaults={'email': f'usuario{i}@email.com'}
    )
    UserProfile.objects.get_or_create(user=user, defaults={
        'institution': f'Institución {i}',
        'department': f'Departamento {i}',
        'cargo': 'Técnico',
    })
    usuarios.append(user)

admin, _ = User.objects.get_or_create(username='admin', defaults={'email': 'admin@email.com'})
UserProfile.objects.get_or_create(user=admin, defaults={'institution': 'Instituto Central', 'department': 'TI'})

# Categorías
cat_reactivos, _ = Categoria.objects.get_or_create(nombre='Reactivos')
cat_equipos, _ = Categoria.objects.get_or_create(nombre='Equipos')

# Crear 50 reactivos
reactivos = []
for i in range(1, 51):
    reactivo, _ = Producto.objects.get_or_create(
        nombre=f'Reactivo {i}', tipo='reactivo', categoria=cat_reactivos,
        cantidad=random.randint(0, 30), minimo=random.randint(2, 10),
        ubicacion=f'Estante {random.randint(1,5)}',
        fecha_vencimiento=date.today() + timedelta(days=random.randint(1, 60))
    )
    reactivos.append(reactivo)

# Crear 5 equipos
equipos = []
for i in range(1, 6):
    equipo, _ = Producto.objects.get_or_create(
        nombre=f'Equipo {i}', tipo='equipo', categoria=cat_equipos,
        cantidad=random.randint(1, 5), minimo=1, ubicacion=f'Mesa {i}'
    )
    equipos.append(equipo)

# Movimientos para reactivos y equipos
for r in reactivos:
    Movimiento.objects.get_or_create(producto=r, tipo='entrada', cantidad=r.cantidad, observacion='Carga inicial')
for e in equipos:
    Movimiento.objects.get_or_create(producto=e, tipo='entrada', cantidad=e.cantidad, observacion='Carga inicial')

# Pedidos para los primeros 10 reactivos
for i in range(10):
    Pedido.objects.get_or_create(
        usuario=random.choice(usuarios), producto=reactivos[i], cantidad=random.randint(1, 5),
        prioridad=random.choice(['alta', 'media', 'baja']), estado='pendiente',
        solicitante=f'Solicitante {i+1}', departamento='Química', fecha_solicitud=date.today()
    )

# Historial de cambios para algunos productos
for i in range(5):
    HistorialCambio.objects.get_or_create(
        usuario=admin, modelo='Producto', campo='cantidad',
        valor_anterior=str(random.randint(5, 20)), valor_nuevo=str(random.randint(1, 30))
    )

# Alertas de bajo stock y vencimiento para algunos reactivos
for i in range(5):
    Alerta.objects.get_or_create(
        tipo='bajo_stock', producto=reactivos[i], titulo=f'Stock bajo de {reactivos[i].nombre}',
        mensaje='Quedan pocas unidades', prioridad='alta', remitente='Sistema'
    )
    Alerta.objects.get_or_create(
        tipo='vencimiento', producto=reactivos[i], titulo=f'{reactivos[i].nombre} por vencer',
        mensaje='El producto vence pronto', prioridad='alta', remitente='Sistema'
    )

print('Datos de prueba masivos cargados correctamente.')
