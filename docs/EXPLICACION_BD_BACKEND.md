# CONEXIÓN BASE DE DATOS: BACKEND (DJANGO)

Este archivo explica en detalle cómo el backend (Django) se conecta y gestiona la base de datos.

---

## 1. Configuración
- **Archivo:** `sigirl/settings.py`
- **Motor por defecto:** SQLite (`db.sqlite3`).
- **Producción:** Puede usar PostgreSQL si se define `DATABASE_URL` en variables de entorno.

**Ejemplo de configuración:**
```python
import dj_database_url
DATABASES = {
    'default': dj_database_url.config(default='sqlite:///db.sqlite3')
}
```

---

## 2. Modelos
- **Archivo:** `sigirl/inventario/models.py`
- **Función:** Define las tablas y relaciones de la base de datos usando clases Python.

---

## 3. Migraciones
- **Comandos:**
    - `python manage.py makemigrations`
    - `python manage.py migrate`
- **Función:** Crear y aplicar cambios en la estructura de la base de datos.

---

## 4. Acceso y lógica de datos
- **Views:** Usan el ORM de Django para consultar y modificar datos.
- **Serializers:** Transforman los modelos a JSON para la API REST.
- **Permisos:** Toda la lógica de autenticación y autorización se maneja aquí.

---

## 5. Variables de entorno
- `DATABASE_URL` (para producción/PostgreSQL)
- `db.sqlite3` (por defecto en desarrollo)

---

**Resumen:**
- Toda la lógica de conexión, migración y acceso a datos está centralizada en el backend.
- El frontend nunca accede directo a la base de datos.