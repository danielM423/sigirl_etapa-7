# CONEXIÓN BASE DE DATOS: FRONTEND (REACT)

Este archivo explica cómo el frontend (React) interactúa con la base de datos a través del backend.

---

## 1. Acceso a datos
- **El frontend NO se conecta directo a la base de datos.**
- Consume la API REST expuesta por el backend (Django).

---

## 2. Lógica de conexión
- **Archivos típicos:**
    - `frontend/src/services/api.js` (o similar)
    - Componentes que usan `fetch` o `axios` para hacer peticiones HTTP.

**Ejemplo:**
```js
export async function getProductos() {
  const res = await fetch('/api/productos/');
  return res.json();
}
```

---

## 3. Variables de entorno
- Si el backend está en otro dominio, se configura la URL base en `.env` o en el archivo de servicios.

---

## 4. Estado y consumo
- Los datos recibidos de la API se guardan en el estado de React (`useState`, `useEffect`).
- Se muestran en tablas, formularios, dashboards, etc.

---

**Resumen:**
- El frontend solo consume la API REST del backend.
- Nunca accede directo a la base de datos.
- Toda la lógica de conexión y seguridad está en el backend.