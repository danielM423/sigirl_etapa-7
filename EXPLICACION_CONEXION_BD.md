# CONEXIÓN BASE DE DATOS: EXPLICACIÓN GENERAL

Este archivo explica cómo funciona la conexión a la base de datos en el proyecto SIGIRL, detallando tanto el backend (Django) como el frontend (React), y cómo interactúan entre sí.

---

## 1. Backend (Django)

- **Archivo principal de configuración:** `sigirl/settings.py`
- **Motor por defecto:** SQLite (`db.sqlite3`), pero puede cambiar a PostgreSQL usando la variable de entorno `DATABASE_URL`.
- **Definición de modelos:** En `sigirl/inventario/models.py`.
- **Migraciones:** Se crean y aplican con `python manage.py makemigrations` y `python manage.py migrate`.
- **Acceso a datos:**
    - El backend expone una API REST usando Django REST Framework.
    - Los datos se consultan y manipulan usando el ORM de Django en los ViewSets.
    - Los serializers convierten los modelos a JSON para el frontend.
- **Variables de entorno relevantes:**
    - `DATABASE_URL` (para producción/PostgreSQL)
    - `db.sqlite3` (por defecto en desarrollo)

---

## 2. Frontend (React)

- **No accede directo a la base de datos.**
- Consume la API REST expuesta por el backend.
- Utiliza `fetch` o `axios` para hacer peticiones HTTP a endpoints como `/api/productos/`, `/api/pedidos/`, etc.
- Los datos recibidos se guardan en el estado de React y se muestran en la UI.
- Si el backend está en otro dominio, se configura la URL base en `.env` o en el archivo de servicios.

---

## 3. Interacción Backend-Frontend

- El frontend solicita datos al backend vía HTTP (API REST).
- El backend responde con datos en formato JSON, obtenidos de la base de datos.
- Toda la lógica de conexión, autenticación y permisos se maneja en el backend.
- El frontend solo muestra y envía datos, nunca accede directo a la base de datos.

---

**Resumen:**
- El backend (Django) es el único que se conecta a la base de datos.
- El frontend (React) solo consume la API REST del backend.
- La seguridad y la lógica de negocio están centralizadas en el backend.