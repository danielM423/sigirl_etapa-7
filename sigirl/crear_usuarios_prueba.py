from django.contrib.auth.models import User

# Crear superusuario
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@email.com', 'admin2026')
    print('Superusuario admin creado')
else:
    print('El superusuario admin ya existe')

# Crear usuario staff (admin sin superuser)
if not User.objects.filter(username='staff').exists():
    staff = User.objects.create_user('staff', 'staff@email.com', 'staff2026')
    staff.is_staff = True
    staff.save()
    print('Usuario staff creado')
else:
    print('El usuario staff ya existe')

# Crear usuario normal
if not User.objects.filter(username='usuario_prueba').exists():
    User.objects.create_user('usuario_prueba', 'prueba@email.com', 'prueba2026')
    print('Usuario normal creado')
else:
    print('El usuario normal ya existe')
