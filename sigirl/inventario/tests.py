from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Categoria, Movimiento, Pedido, Producto


class InventarioApiTests(APITestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(nombre='Ácidos')
        self.producto = Producto.objects.create(
            nombre='Ácido clorhídrico',
            tipo='reactivo',
            categoria=self.categoria,
            cantidad=10,
            minimo=2,
            ubicacion='Almacén A',
        )

        self.usuario = User.objects.create_user(username='usuario_test', password='demo123')
        self.admin = User.objects.create_user(username='admin_test', password='demo123', is_staff=True)

        self.pedido = Pedido.objects.create(
            usuario=self.usuario,
            producto=self.producto,
            cantidad=2,
            estado='pendiente',
            prioridad='alta',
            solicitante='usuario_test',
            departamento='Laboratorio',
        )

    def autenticar(self, username, password):
        response = self.client.post('/api/token/', {'username': username, 'password': password}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_login_jwt_funciona(self):
        response = self.client.post('/api/token/', {'username': 'usuario_test', 'password': 'demo123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_usuario_solo_ve_sus_pedidos(self):
        self.autenticar('usuario_test', 'demo123')
        response = self.client.get('/api/pedidos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_admin_aprueba_pedido_y_descuenta_stock(self):
        self.autenticar('admin_test', 'demo123')
        response = self.client.patch(f'/api/pedidos/{self.pedido.id}/', {'estado': 'aprobado'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.producto.refresh_from_db()
        self.assertEqual(self.producto.cantidad, 8)
        self.assertEqual(Movimiento.objects.count(), 1)

    def test_usuario_puede_ver_y_actualizar_su_perfil(self):
        self.autenticar('usuario_test', 'demo123')

        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'usuario_test')

        update_response = self.client.patch(
            '/api/auth/profile/',
            {
                'first_name': 'Laura',
                'last_name': 'Química',
                'department': 'Laboratorio Central',
                'phone': '3001234567',
                'avatar': 'data:image/png;base64,abc123',
            },
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data['first_name'], 'Laura')
        self.assertEqual(update_response.data['profile']['department'], 'Laboratorio Central')
        self.assertEqual(update_response.data['profile']['phone'], '3001234567')

    def test_usuario_puede_eliminar_su_cuenta(self):
        self.autenticar('usuario_test', 'demo123')
        response = self.client.delete('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(username='usuario_test').exists())

