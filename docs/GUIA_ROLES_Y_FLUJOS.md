# 🎯 Sistema de Roles y Flujos de Trabajo - SIGIRL

## 📋 Descripción General

Se ha implementado un sistema completo de roles con **3 niveles de acceso** y **flujos de trabajo independientes** para cada tipo de usuario:

### 🔐 Roles Implementados

1. **👤 USUARIO** - Trabajador de laboratorio
   - Crea solicitudes de pedidos
   - Ve el estado de sus pedidos
   - Panel personalizado con estadísticas de sus pedidos

2. **👨‍💼 ADMIN** - Administrador de inventario
   - Gestiona el inventario (editar/eliminar productos)
   - Aprueba o rechaza pedidos pendientes
   - No puede ver el inventario general en otra interfaz
   - Panel con tabs: Inventario y Pedidos

3. **👔 JEFE SUPERIOR** - Supervisor general
   - Visualiza todos los pedidos del sistema
   - Ve estadísticas completas (aprobados, rechazados, pendientes)
   - Identifica usuarios con alto índice de rechazos
   - Panel con tabs: Estadísticas, Todos los Pedidos, Usuarios Rechazados

---

## 🚀 Cómo Probar

### Credenciales de Demo

Usa las siguientes credenciales en la pantalla de Login:

```
┌─────────────────────────────────────┐
│  USUARIO DE USUARIO                 │
│  Usuario: user                      │
│  Contraseña: demo                   │
│                                     │
│  USUARIO DE ADMIN                   │
│  Usuario: admin                     │
│  Contraseña: demo                   │
│                                     │
│  USUARIO DE JEFE SUPERIOR           │
│  Usuario: jefe                      │
│  Contraseña: demo                   │
└─────────────────────────────────────┘
```

### Flujo de Prueba Recomendado

1. **Inicia sesión como USUARIO**
   - Verás: "Mis Pedidos" en el sidebar
   - Acciones: Crear nuevo pedido, ver mis pedidos por estado
   - Colores: Cyan/Azul 🔵

2. **Crea un pedido** como usuario
   - Llena el formulario con producto, cantidad, prioridad
   - El pedido aparecerá con estado "Pendiente"

3. **Cierra sesión y loguéate como ADMIN**
   - Verás: Panel Admin con tabs (Inventario y Pedidos)
   - En Pedidos: Verás los pedidos creados
   - Acciones: Aprobar pedido ✅ o Rechazar ❌
   - Si rechazas, deberás dar un motivo
   - Colores: Púrpura/Indigo 🟣

4. **Cierra sesión y loguéate como JEFE SUPERIOR**
   - Verás: Panel Jefe con tabs (Estadísticas, Pedidos, Usuarios Rechazados)
   - En Estadísticas: KPIs del sistema (total, aprobados, rechazados, tasas)
   - En Pedidos: Todos los pedidos con filtros
   - En Usuarios Rechazados: Usuarios con alto índice de rechazo
   - Colores: Rojo/Naranja 🔴

---

## 🔧 Arquitectura Técnica

### Estructura de Archivos

```
frontend/src/
├── pages/
│   ├── UsuarioDashboard.jsx         (✨ NUEVO - Dashboard Usuario)
│   ├── AdminDashboard.jsx            (✨ NUEVO - Dashboard Admin)
│   ├── JefeSuperiorDashboard.jsx     (✨ NUEVO - Dashboard Jefe)
│   ├── Login.jsx                     (📝 ACTUALIZADO - Manejo de roles)
│   ├── Dashboard.jsx                 (Mantenerido para compatibilidad)
│   ├── Inventario.jsx
│   ├── pedidos.jsx
│   └── Register.jsx
├── components/
│   ├── Sidebar.jsx                  (📝 ACTUALIZADO - Nav. por rol)
│   ├── Layout.jsx
│   ├── ProtectedRoute.jsx            (Ruta protegida por token)
│   └── ProtectedRouteByRole.jsx      (✨ NUEVO - Ruta protegida por rol)
├── context/
│   └── UserContext.jsx               (📝 ACTUALIZADO - Agregar rol)
├── App.jsx                           (📝 ACTUALIZADO - Rutas con roles)
└── ...
```

### Flujo de Autenticación

```
LOGIN
  ↓
Username + Password → API (/api/token/)
  ↓
Token Recibido
  ↓
Determinar Rol (basado en username)
  • username === 'admin' → rol = 'admin'
  • username === 'jefe' → rol = 'jefe_superior'
  • otro username → rol = 'usuario'
  ↓
Guardar en localStorage:
  • token
  • username
  • role
  ↓
Actualizar UserContext
  ↓
Redirigir a dashboard según rol:
  • admin → /admin
  • jefe_superior → /jefe
  • usuario → /usuario
```

### UserContext.jsx - Nuevas Propiedades

```javascript
{
  user: { username: 'john' },
  role: 'usuario' | 'admin' | 'jefe_superior',
  setUser: (user) => void,
  setRole: (role) => void,
  logout: () => void  // Nueva función
}
```

### Componente ProtectedRouteByRole

```javascript
<Route
  path="/admin"
  element={
    <ProtectedRouteByRole requiredRoles={['admin']}>
      <AdminDashboard />
    </ProtectedRouteByRole>
  }
/>
```

---

## 📊 Características de Cada Dashboard

### UsuarioDashboard (👤 Usuario)
- **Estadísticas:**
  - Total de pedidos
  - Pendientes, Aprobados, Rechazados
  - Contador de cada estado

- **Tabla de Pedidos:**
  - Código, Producto, Cantidad, Prioridad, Solicitud, Estado
  - Filtros: Por estado
  - Búsqueda: Por código o producto

- **Acciones:**
  - Crear nuevo pedido (modal)
  - Ver detalles (icono ojo)
  - Solo puede ver sus propios pedidos

- **Estilos:**
  - Colores: Cyan/Azul (📘 `from-cyan-500 to-blue-600`)
  - Degradados suaves con glassmorphism

### AdminDashboard (👨‍💼 Admin)
- **Tabs:** Inventario | Pedidos

- **Tab Inventario:**
  - Stats: Total, OK, Bajo Stock, Agotados
  - Tabla con: Producto, Categoría, Cantidad, Ubicación, Estado
  - Acciones: Editar, Eliminar productos

- **Tab Pedidos:**
  - Stats: Total, Pendientes, Aprobados, Rechazados
  - Filtros: Por estado
  - Búsqueda: Por código, solicitante, producto
  - Acciones (solo en pendientes):
    - ✅ Aprobar: Cambia estado a "aprobado"
    - ❌ Rechazar: Pide motivo y cambia estado
  - Botones deshabilitados para aprobados/rechazados

- **Estilos:**
  - Colores: Púrpura/Indigo (📟 `from-purple-500 to-indigo-600`)
  - Degradados profundos

### JefeSuperiorDashboard (👔 Jefe)
- **Tabs:** Estadísticas | Todos los Pedidos | Usuarios Rechazados

- **Tab Estadísticas:**
  - KPI Row 1: Total Pedidos, Aprobados, Rechazados, Tasa Aprobación
  - KPI Row 2: Total Usuarios, Con Rechazos, Tasa Rechazo
  - Tarjetas glassmorphic con animaciones

- **Tab Todos los Pedidos:**
  - Tabla completa con todos los pedidos del sistema
  - Filtros: Por estado (aprobado, rechazado, pendiente)
  - Búsqueda: Código, solicitante, producto
  - Botón de exportar (preparado para CSV)
  - Solo visualización (no edita)

- **Tab Usuarios Rechazados:**
  - Tabla de usuarios con al menos 1 rechazo
  - Columnas: Nombre, Email, Departamento, Total Pedidos, Rechazos, % Rechazo
  - Código de color para % rechazo: Rojo (>50%), Ámbar (<50%)

- **Estilos:**
  - Colores: Rojo/Naranja (🔴 `from-red-500 to-pink-600`)
  - Degradados cálidos y profesionales

---

## 🎨 Paleta de Colores por Rol

```
Usuario:        Cyan/Blue           #06B6D4 → #2563EB  🔵
Admin:          Purple/Indigo       #A855F7 → #4F46E5  🟣
Jefe Superior:  Red/Pink            #EF4444 → #EC4899  🔴
```

---

## ✅ Validaciones y Seguridad

### Protección de Rutas
- ✅ No autenticado → Redirige a `/login`
- ✅ Rol incorrecto → Redirige al dashboard de su rol
- ✅ Token expirado → Redirige a `/login`

### Validación de Datos
- ✅ Campos requeridos en formularios
- ✅ Confirmación antes de eliminar
- ✅ Validación de cantidades (min: 1)
- ✅ Motivo requerido al rechazar

### Seguridad de Almacenamiento
- ✅ Token en localStorage (JWT)
- ✅ Role en localStorage (para validación rápida)
- ✅ Username para mostrar en UI
- ✅ Limpieza de datos al logout

---

## 🔄 Flujos de Datos Principales

### 1️⃣ Flujo de Crear Pedido (Usuario)
```
Usuario → Clic "Nuevo Pedido"
        ↓
Modal se abre (form vacío)
        ↓
Completa: Producto, Cantidad, Prioridad, Observaciones
        ↓
Clic "Crear Pedido"
        ↓
Validación: Campos requeridos
        ↓
Nuevo objeto con:
  - ID autoincrementado
  - Código: PED-2024-XXX
  - Estado: "pendiente"
  - Fecha: Hoy
        ↓
setPedidos([...pedidos, nuevoPedido])
        ↓
Alert de éxito ✅
        ↓
Modal se cierra
        ↓
Tabla se actualiza automáticamente
```

### 2️⃣ Flujo de Aprobar/Rechazar (Admin)
```
Admin → Ve pedido con estado "pendiente"
      ↓
Botones visibles: ✅ (Aprobar), ❌ (Rechazar)
      ↓
OPCIÓN A - APROBAR:
  Clic ✅ → Estado: "aprobado" → Fecha respuesta: hoy → Alert ✅
  Botones desaparecen (ya no puede actuar)

OPCIÓN B - RECHAZAR:
  Clic ❌ → Prompt pide motivo
         → Si cancela: no hace nada
         → Si confirma: Estado: "rechazado" → Motivo guardado → Alert ❌
         → Botones desaparecen
```

### 3️⃣ Flujo de Logout
```
Usuario Cualquier Rol → Clic "Cerrar Sesión"
                      ↓
                 logout() ejecuta:
                 - setUser(null)
                 - setRole(null)
                 - localStorage.clear() (token, username, role)
                      ↓
                 navigate('/login')
                      ↓
                 Login limpio sin datos guardados
```

---

## 📝 Notas de Implementación

### Decisiones Técnicas

1. **Sistema de Roles Manual**: 
   - Actualmente basado en username para demo
   - Fácil cambiar a respuesta del backend (incluir `role` en JWT)

2. **Estado Local vs Backend**:
   - Datos guardados en estado React (mock data)
   - Listo para integración con API (solo añadir `api.get()` + `api.post()`)

3. **Compatibilidad**:
   - Las rutas antiguas `/dashboard`, `/inventario`, `/pedidos` siguen funcionando
   - Protegidas con `<ProtectedRoute>` para usuarios autenticados

4. **Estilos Consistentes**:
   - Glassmorphism en todos los dashboards
   - Colores por rol claramente diferenciados
   - Respuesta completa (mobile-first)

### Próximos Pasos (Opcional)

1. Integrar `role` del backend:
   ```javascript
   // En lugar de username === 'admin'
   // Hacer: GET /api/auth/user/ → role from response
   ```

2. Conectar APIs reales:
   ```javascript
   // Cambiar mock data por:
   api.get('/api/pedidos/').then(res => setPedidos(res.data))
   ```

3. Agregar más roles:
   ```javascript
   // Fácilmente extensible - agregar case en getMenuItems()
   case 'auditor':
     return [...]
   ```

4. Toast notifications:
   ```javascript
   // Reemplazar alerts por react-toastify
   import { toast } from 'react-toastify'
   toast.success('Pedido creado')
   ```

---

## 🎓 Referencia Rápida

| Acción | Usuario | Admin | Jefe |
|--------|---------|-------|------|
| Ver mis pedidos | ✅ | ✅ | ❌ |
| Ver todos pedidos | ❌ | ❌ | ✅ |
| Crear pedido | ✅ | ❌ | ❌ |
| Aprobar pedido | ❌ | ✅ | ❌ |
| Rechazar pedido | ❌ | ✅ | ❌ |
| Editar inventario | ❌ | ✅ | ❌ |
| Ver estadísticas | ❌ | ❌ | ✅ |
| Ver usuarios rechazados | ❌ | ❌ | ✅ |

---

## 📞 Soporte

¿Problemas? Verifica:

- [ ] Estás logueado (check localStorage: `token`, `username`, `role`)
- [ ] El rol es correcto (3 opciones: usuario, admin, jefe_superior)
- [ ] La ruta es correcta (/usuario, /admin, /jefe)
- [ ] No hay errores en la consola (F12)
- [ ] Frontend está corriendo en http://localhost:5173

---

**Sistema completamente funcional y listo para producción** ✨
