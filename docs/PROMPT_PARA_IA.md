# 🤖 PROMPT PARA IA - MEJORAR ESTILOS SIGIRL SIN ROMPER NADA

## CONTEXTO DEL PROYECTO

Project: SIGIRL - Sistema de Gestión de Inventarios y Reactivos de Laboratorio
Tech Stack: Django 6.0.4 Backend + React Frontend
Estado: 90% funcional, necesita mejoras visuales

**NUNCA MODIFICAR:**
- Backend (views.py, models.py, serializers.py, urls.py, settings.py)
- api.js (interceptor JWT)
- UserContext.jsx
- ProtectedRoute.jsx
- Sidebar.jsx (ya tiene estilos)
- Login.jsx, Register.jsx, Dashboard.jsx (ya tienen estilos)

---

## TAREA 1: MEJORAR INVENTARIO.JSX

### Archivo actual: `src/pages/Inventario.jsx`

### Estado actual:
```javascript
- Tabla HTML cruda (border="1")
- Solo muestra: nombre, cantidad
- Sin estilos coherentes
- Sin botones de acción
- Sin filtros
- Sin búsqueda
```

### Qué hacer (EXACTAMENTE):
1. **Importar al inicio:**
   ```javascript
   import { styles, colors, combineStyles } from "../styles/theme";
   ```

2. **Envolver output en container:**
   - Reemplazar `<div>` externo por: `<div style={styles.container}>`

3. **Título con estilos:**
   - Cambiar `<h2>📦 Inventario</h2>` a usar `styles.h2`

4. **Mejorar tabla:**
   - Aplicar `styles.table` al `<table>`
   - Aplicar `styles.th` a cada `<th>`
   - Aplicar `styles.td` a cada `<td>`
   - Agregar colores para bajo stock

5. **Agregar columnas faltantes:**
   ```javascript
   Mostrar: nombre | tipo | categoría | cantidad | mínimo | ubicación | bajo_stock (color)
   ```

6. **Color visual para bajo_stock:**
   ```javascript
   Si cantidad <= minimo:
   - backgroundColor: colors.danger (rojo)
   Si cantidad >= minimo:
   - backgroundColor: colors.accent2 (verde)
   ```

7. **Agregar botones de acción (sin funcionalidad por ahora):**
   - Botón "👁️ Ver" - style={...styles.button, ...styles.buttonPrimary}
   - Botón "✏️ Editar" - style={...styles.button, backgroundColor: colors.warning}
   - Botón "🗑️ Eliminar" - style={...styles.button, ...styles.buttonDanger}

8. **Agregar buscador ANTES de la tabla:**
   ```javascript
   <input 
     placeholder="🔍 Buscar producto..."
     onChange={(e) => setBusqueda(e.target.value)}
     style={{...styles.input, width: "100%", marginBottom: "15px"}}
   />
   ```

9. **Filtrar productos por búsqueda:**
   ```javascript
   const productosFiltrados = productos.filter(p =>
     p.nombre.toLowerCase().includes(busqueda.toLowerCase())
   );
   ```

10. **Punto importante:**
    - NO modificar el GET /api/productos/ (ya funciona)
    - NO cambiar estructura de datos
    - Solo DISPLAY y ESTILOS

---

## TAREA 2: MEJORAR PEDIDOS.JSX

### Archivo actual: `src/pages/pedidos.jsx`

### Estado actual:
```javascript
- Botones sin estilos
- Tabla HTML cruda
- Filtros sin estilos
- Sin mensajes de error visuales
- Sin crear nuevo pedido funcionalidad
```

### Qué hacer (EXACTAMENTE):

1. **Importar al inicio:**
   ```javascript
   import { styles, colors, combineStyles } from "../styles/theme";
   ```

2. **Envolver output en container:**
   - Reemplazar `<div>` externo por: `<div style={styles.container}>`

3. **Título y descripción:**
   - Usar `styles.h1` para título
   - Agregar descripción pequeña: "Gestiona pedidos de reactivos"

4. **Mejorar botones de filtro:**
   ```javascript
   <div style={{display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap"}}>
     <button 
       onClick={() => setFiltro("TODOS")}
       style={{
         ...styles.button,
         ...(filtro === "TODOS" ? styles.buttonPrimary : {backgroundColor: "#ccc"})
       }}
     >
       Todos ({pedidos.length})
     </button>
     // REPETIR PARA CADA ESTADO
   </div>
   ```

5. **Mejorar tabla:**
   - Aplicar `styles.table`
   - Aplicar `styles.th` y `styles.td`
   - Agregar columnas: ID | Producto | Usuario | Cantidad | Estado | Fecha | Acciones

6. **Color visual para estados:**
   ```javascript
   PENDIENTE:   backgroundColor: colors.warning (naranja)
   APROBADO:    backgroundColor: colors.accent2 (verde)
   RECHAZADO:   backgroundColor: colors.danger (rojo)
   
   const getEstadoColor = (estado) => {
     switch(estado) {
       case 'PENDIENTE': return colors.warning;
       case 'APROBADO': return colors.accent2;
       case 'RECHAZADO': return colors.danger;
       default: return '#ccc';
     }
   };
   ```

7. **Mejorar botones de acciones:**
   - En cada fila, agregar:
   ```javascript
   <td style={styles.td}>
     <button style={{...styles.button, ...styles.buttonSuccess, marginRight: "5px"}}>
       ✅ Aprobar
     </button>
     <button style={{...styles.button, ...styles.buttonDanger}}>
       ❌ Rechazar
     </button>
   </td>
   ```

8. **Punto importante:**
   - NO cambiar actualizarEstado() función (funciona)
   - Solo aplicar estilos a botones existentes
   - Con onclick={} ya funcionarán

---

## TAREA 3: CREAR COMPONENTE REUTILIZABLE (OPCIONAL PERO RECOMENDADO)

### Nuevo archivo: `src/components/DataTable.jsx`

Crear componente genérico que reciba:
- columns: array de columnas
- data: array de datos
- onEdit, onDelete: callbacks

Beneficio: Reutilizar en Inventario, Pedidos, Movimientos sin duplicar código

```javascript
// Estructura general:
export default function DataTable({ title, columns, data })
```

---

## TAREA 4: CREAR FORMULARIO PARA CREAR PEDIDO (OPCIONAL)

### Nuevo archivo: `src/components/FormCrearPedido.jsx`

- Modal o formulario inline
- Campos: producto (select), cantidad, descripción
- Botón submit: POST /api/pedidos/
- Mensajes de éxito/error

NO CAMBIAR backend - solo frontend form

---

## ⚙️ INSTRUCCIONES GENERALES PARA IA

### REGLAS DE ORO:
1. **Solo modificar archivos FRONTEND** en `src/pages/` y `src/components/`
2. **NUNCA tocar backend** (Django)
3. **NUNCA cambiar estructura de datos** que recibe del servidor
4. **Usar SIEMPRE** estilos de `src/styles/theme.js`
5. **Si necesitas nuevo color** → agregarlo a theme.js, no inline
6. **Mantener componentes DUMB** → no mover lógica de estado
7. **Probar que API calls sigan funcionando** (console.log para debug)

### FLUJO DE TRABAJO SEGURO:
```
1. Leer archivo actual completo
2. Identificar: imports, state, handlers, return JSX
3. Mantener: imports (agregar theme), state, handlers
4. Modificar: return JSX con estilos
5. Agregar: imports de estilos al inicio
6. Testing: Asegurar que GET requests funcionan
```

### VALIDACIÓN ANTES DE ENTREGAR:
- [ ] ¿Se importó theme.js?
- [ ] ¿Se usan colores de `colors` object?
- [ ] ¿Se usan estilos de `styles` object?
- [ ] ¿El GET /api/... sigue funcionando?
- [ ] ¿Los botones funcionan igual que antes?
- [ ] ¿Sin errores en console?
- [ ] ¿Se ve bien en desktop (1920x1080)?

---

## 📝 CHECKLIST FINAL

### Tarea 1: Inventario.jsx
- [ ] Importar styles y colors
- [ ] Aplicar styles.container
- [ ] Aplicar estilos tabla
- [ ] Agregar columnas: tipo, categoría, mínimo, ubicación
- [ ] Agregar color bajo_stock
- [ ] Agregar buscador
- [ ] Botones sin funcionalidad (solo para después)
- [ ] No romper GET /api/productos/

### Tarea 2: Pedidos.jsx
- [ ] Importar styles y colors
- [ ] Aplicar styles.container
- [ ] Mejorar filtros (con colores)
- [ ] Aplicar estilos tabla
- [ ] Agregar colores a estados
- [ ] Mejorar botones acciones
- [ ] Mostrar fecha del pedido
- [ ] No romper PATCH /api/pedidos/

### Tarea 3 (Opcional): DataTable.jsx
- [ ] Crear componente genérico
- [ ] Reciba columns, data, callbacks
- [ ] Usar en Inventario y Pedidos

### Tarea 4 (Opcional): FormCrearPedido.jsx
- [ ] Modal o form inline
- [ ] POST a /api/pedidos/
- [ ] Validaciones
- [ ] Mensajes éxito/error

---

## 🔍 DEBUGGING

Si algo falla:

1. **405 POST error** → No cambiar backend URLs
2. **401 Unauthorized** → Token no se envía (api.js está OK)
3. **Tabla vacía** → Ver console, GET request falló
4. **Botones no funcionan** → Se preservó onClick handler
5. **Estilos no aplican** → Falta import de theme.js

---

## 📞 REFERENCIAS DEL CÓDIGO

**Para copiar-pegar estilos:**

```javascript
// Contenedor general
<div style={styles.container}>

// Card para información
<div style={styles.card}>

// Tabla
<table style={styles.table}>
  <thead>
    <tr><th style={styles.th}>Header</th></tr>
  </thead>
  <tbody>
    <tr><td style={styles.td}>Data</td></tr>
  </tbody>
</table>

// Botones
<button style={{...styles.button, ...styles.buttonPrimary}}>Primario</button>
<button style={{...styles.button, ...styles.buttonSuccess}}>Éxito</button>
<button style={{...styles.button, ...styles.buttonDanger}}>Peligro</button>

// Inputs
<input style={{...styles.input, width: "100%"}} />

// Combinar estilos
<div style={combineStyles(styles.card, styles.cardSuccess)}>

// Colores
backgroundColor: colors.primary      // Azul oscuro
backgroundColor: colors.accent       // Azul
backgroundColor: colors.accent2      // Verde
backgroundColor: colors.danger       // Rojo
backgroundColor: colors.warning      // Naranja
```

---

## ✅ ÉXITO SE VE ASÍ

- Inventario: tabla profesional con búsqueda
- Pedidos: botones con colores, estados visuales
- Sin errores en console
- API calls funcionan igual
- Responsive en desktop
- Coherente con Dashboard y Login

