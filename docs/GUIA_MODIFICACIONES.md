# 🔧 GUÍA: QUÉ MODIFICAR Y CÓMO (SIN DAÑAR NADA)

---

## ✅ ESTADO DEL BACKEND - FUNCIONA CORRECTAMENTE

| Componente | Estado | Detalle |
|-----------|--------|--------|
| **Models.py** | ✅ PERFECTO | Categoría, Producto, Movimiento bien estructurados |
| **Views.py** | ✅ PERFECTO | ViewSets CRUD funcionan correctamente |
| **Serializers.py** | ✅ PERFECTO | Convertidores de datos OK |
| **URLs.py** | ✅ PERFECTO | Rutas registradas automáticamente |
| **Settings.py** | ✅ PERFECTO | CORS, JWT, DB configurados |
| **Base de Datos** | ✅ PERFECTO | SQLite con migraciones aplicadas |

### 🎯 Resumen Backend:
**EL BACKEND YA FUNCIONA 100% CORRECTAMENTE - NO NECESITA CAMBIOS**

---

## 📝 PARTES SEGURAS PARA MODIFICAR SIN RIESGO

### 1️⃣ **FRONTEND - COMPONENTES DE DISPLAY (100% SEGURO)**

#### ✅ Puedes modificar estos archivos SIN PROBLEMA:

**Ubicación:** `frontend/src/pages/`

```
✅ pedidos.jsx
   - Cambiar colores de badges
   - Modificar textos y etiquetas
   - Ajustar espaciados (padding, margin)
   - Agregar/remover columnas en tabla
   - Cambiar emojis/iconos
   
✅ Inventario.jsx
   - Idem anterior
   - Personalizar orden de columnas
   - Cambiar tamaño de fuentes
   
✅ Dashboard.jsx
   - Cambiar gráficos/estadísticas
   - Modificar títulos y descripciones
   - Alterar distribución de cards

✅ Login.jsx / Register.jsx
   - Cambiar colores
   - Modificar validaciones visuales
   - Agregar/remover campos (sin tocar la lógica)
```

### 2️⃣ **FRONTEND - ARCHIVOS DE CONFIGURACIÓN (SEGURO CON CUIDADO)**

```
⚠️ frontend/src/styles/theme.js
   - SAFE: Cambiar colores de la paleta
   - SAFE: Modificar tamaños de fuentes
   - ❌ NO TOQUES: Estructura del objeto (names de keys)
   
⚠️ frontend/src/services/api.js
   - SAFE: Cambiar URL base si cambias servidor
   - SAFE: Agregar logs/debug
   - ❌ NO TOQUES: Interceptor de JWT

⚠️ frontend/src/context/UserContext.jsx
   - SAFE: Agregar más datos de usuario
   - ❌ NO TOQUES: Las funciones de login/logout
```

### 3️⃣ **FRONTEND - NUEVOS ARCHIVOS (COMPLETAMENTE SEGURO)**

**Puedes crear nuevos componentes sin límite:**

```
✅ frontend/src/components/FormProducto.jsx (nuevo)
✅ frontend/src/components/FormPedido.jsx (nuevo)
✅ frontend/src/components/Toast.jsx (nuevo)
✅ frontend/src/components/ModalConfirm.jsx (nuevo)
✅ frontend/src/pages/ProductoDetalle.jsx (nuevo)
```

---

## ❌ PARTES CRÍTICAS - NO TOQUES

### Backend (NUNCA MODIFICAR SIN BACKUP)

```
❌ inventario/models.py
   - Si cambias... DB necesita migración
   - Riesgo: Perder datos existentes
   
❌ inventario/views.py (la lógica base)
   - Si cambias la estructura... APIs rompen
   - Riesgo: Frontend no funciona
   
❌ sigirl/settings.py
   - Si cambias JWT, CORS, DB... todo explota
   - Riesgo: Autenticación rota
```

### Frontend (ESTRUCTURA CRÍTICA)

```
❌ App.jsx (mucho cuidado)
   - Las rutas deben existir
   - Los imports deben ser válidos
   
❌ ProtectedRoute.jsx
   - Lógica de autenticación sensible
```

---

## 🎨 EJEMPLO: CÓMO MODIFICAR CON SEGURIDAD

### Caso 1: Cambiar colores de todo

**Ubicación:** `frontend/src/styles/theme.js`

```javascript
// ANTES:
const colors = {
  primary: '#7c3aed',    // Violeta
  accent: '#06b6d4',     // Cyan
};

// DESPUÉS (sin riesgo):
const colors = {
  primary: '#2563eb',    // Azul
  accent: '#f59e0b',     // Ámbar
};
// ✅ Automáticamente se actualiza TODA la UI
```

### Caso 2: Cambiar estado de badge en tabla

**Ubicación:** `frontend/src/pages/pedidos.jsx`

```javascript
// BUSCA ESTA FUNCIÓN:
const getPrioridadBadge = (prioridad) => {
  const styles = {
    alta: 'bg-rose-100 text-rose-700 border border-rose-300',
    media: 'bg-amber-100 text-amber-700 border border-amber-300',
    baja: 'bg-slate-100 text-slate-700 border border-slate-300'
  };
  // ✅ Modifica CUALQUIER COLOR AQUÍ sin riesgo
};
```

### Caso 3: Agregar nueva columna a tabla

**Ubicación:** `frontend/src/pages/Inventario.jsx`

```javascript
// EN LA TABLA, BUSCA:
<tr>
  <th>Producto</th>
  <th>Categoría</th>
  <th>Cantidad</th>
  {/* ✅ AGREGA AQUÍ -> */}
  <th>Proveedor</th>
</tr>

// LUEGO EN LOS <td>:
<td className="py-4 px-5">
  {producto.proveedor}
</td>
```

### Caso 4: Cambiar mensaje de validación

**Ubicación:** `frontend/src/pages/Login.jsx`

```javascript
// BUSCA ESTE TEXTO:
setError("Credenciales incorrectas");

// ✅ CAMBIA A (sin riesgo):
setError("Usuario o contraseña inválidos");
```

---

## 🔄 SI QUIERES AGREGAR FUNCIONALIDADES NUEVAS

### Pasos seguros:

1. **Crear archivo nuevo** en lugar de modificar existentes
   ```bash
   frontend/src/components/MiNuevoComponente.jsx ✅
   ```

2. **Importarlo en donde lo necesites**
   ```javascript
   import MiNuevoComponente from '../components/MiNuevoComponente';
   ```

3. **Usarlo en el componente**
   ```jsx
   <MiNuevoComponente data={datos} />
   ```

### Ejemplos seguros de nuevas funcionalidades:

```
✅ Agregar filtro de fecha
✅ Agregar botón de exportar
✅ Agregar gráficos/charts
✅ Agregar búsqueda avanzada
✅ Agregar notificaciones toast
✅ Agregar dark mode
❌ Cambiar estructura de API
❌ Eliminar funciones críticas
```

---

## 📊 RESUMEN RÁPIDO

```
SEGURIDAD:  
✅ Modificar estilos/colores     - 100% SEGURO
✅ Cambiar textos/etiquetas      - 100% SEGURO
✅ Agregar nuevos componentes    - 100% SEGURO
✅ Ajustar espaciados/layouts    - 100% SEGURO
⚠️  Modificar theme.js           - SEGURO si solo cambias valores
❌ Tocar Backend                 - NO (Necesita backup + migraciones)
❌ Cambiar estructura de API     - NO
❌ Modificar ProtectedRoute      - NO
```

---

## 📞 SI NECESITAS AYUDA

**Para cualquier modificación, siempre:**

1. Identifica el archivo
2. Revisa si está en la lista de "SEGURO"
3. Haz backup antes de cambios grandes
4. Prueba en desarrollo primero
5. NO cambies estructuras de datos/API

**El backend está perfecto, enfócate en UI/UX del frontend** 🎨

