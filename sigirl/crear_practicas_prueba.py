from django.contrib.auth.models import User
from sigirl.inventario.models import UnidadMedida, Practica, PracticaReactivo, PracticaEquipo, Producto, Categoria
from datetime import date, timedelta
import random

# Unidades de medida
um_ml, _ = UnidadMedida.objects.get_or_create(nombre='Mililitros', simbolo='ml')
um_g, _ = UnidadMedida.objects.get_or_create(nombre='Gramos', simbolo='g')
um_u, _ = UnidadMedida.objects.get_or_create(nombre='Unidades', simbolo='u')

# Instructor
instructor, _ = User.objects.get_or_create(username='instructor1', defaults={'email': 'instructor1@email.com'})

# Crear prácticas genéricas
for i in range(1, 4):
    practica, _ = Practica.objects.get_or_create(
        ficha=f'FICHA{i}',
        nombre=f'Práctica Genérica {i}',
        fecha=date.today() + timedelta(days=i),
        grupos_trabajo=random.randint(1, 5),
        instructor=instructor
    )
    # Asociar reactivos
    for j in range(1, 4):
        reactivo, _ = Producto.objects.get_or_create(
            nombre=f'Reactivo Prueba {j}', tipo='reactivo', categoria=Categoria.objects.get_or_create(nombre='Reactivos')[0],
            cantidad=100, minimo=10
        )
        PracticaReactivo.objects.get_or_create(
            practica=practica, reactivo=reactivo, cantidad=random.randint(5, 20), unidad=um_ml
        )
    # Asociar equipos
    for k in range(1, 3):
        equipo, _ = Producto.objects.get_or_create(
            nombre=f'Equipo Prueba {k}', tipo='equipo', categoria=Categoria.objects.get_or_create(nombre='Equipos')[0],
            cantidad=5, minimo=1
        )
        PracticaEquipo.objects.get_or_create(
            practica=practica, equipo=equipo, tiempo_uso_min=random.randint(30, 120)
        )

print('Datos de prueba de prácticas, reactivos y equipos cargados correctamente.')
