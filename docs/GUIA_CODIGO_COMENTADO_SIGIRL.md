# Guía rápida del código comentado - SIGIRL

## Frontend

### main.jsx
Inicializa React y monta toda la aplicación en el navegador.

### App.jsx
Define las rutas del sistema, separa vistas públicas y privadas, y redirige según el rol.

### context/AuthContext.js
Declara el contexto global compartido para usuario, rol y cierre de sesión.

### context/UserContext.jsx
Administra la sesión real del usuario, sincroniza localStorage y consulta el perfil del backend.

### components/ProtectedRoute.jsx
Evita que un usuario sin sesión acceda a rutas privadas.

### components/ProtectedRouteByRole.jsx
Restringe vistas según si el usuario es admin, jefe o usuario.

### components/Layout.jsx
Construye la plantilla general de la interfaz: menú, encabezado, banner y modal de ayuda.

### components/Sidebar.jsx
Genera el menú lateral dinámico según el rol y la ruta activa.

### services/api.js
Centraliza las peticiones HTTP hacia Django y añade el token automáticamente.

### pages/Login.jsx
Gestiona el inicio de sesión y la redirección al panel correspondiente.

---

## Backend

### inventario/models.py
Contiene la estructura principal de datos:
- Categoria
- Producto
- Movimiento

### inventario/serializers.py
Transforma los modelos en JSON para la API REST.

### inventario/views.py
Expone operaciones CRUD automáticas sobre categorías, productos y movimientos.

### inventario/urls.py
Registra las rutas REST de la aplicación inventario.

### sigirl/settings.py
Configura apps instaladas, base de datos, seguridad básica y archivos estáticos.

### sigirl/urls.py
Une todas las rutas del proyecto y define la respuesta base de prueba.

---

## Base de datos

### database/estructura.sql
Archivo reservado para documentar o exportar la estructura SQL.

### database/datos_prueba.sql
Archivo reservado para inserts o datos de ejemplo.

---

## Nota
Se comentaron los archivos principales de funcionamiento del sistema. No se tocaron archivos autogenerados como migraciones para evitar ruido innecesario.
