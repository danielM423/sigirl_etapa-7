# 🚀 Guía Rápida - Sistema de Roles SIGIRL

## ⚡ Paso 1: Prueba el Sistema en 5 Minutos

### ✅ Paso 1: Ir a Login
- Abre: `http://localhost:5173/login`
- Ves las 3 opciones de demo en el cuadro azul

### ✅ Paso 2: Prueba como USUARIO
```
Username: user
Password: demo
Clic: Ingresar
```
- **Qué ves:** "Mis Pedidos" en el sidebar
- **Qué puedes hacer:**
  - Clic "Nuevo Pedido" → Llena formulario → Crea pedido
  - Los pedidos aparecen en la tabla
  - Filtras por estado (Pendiente, Aprobado, Rechazado)

### ✅ Paso 3: Prueba como ADMIN
```
Username: admin
Password: demo
Clic: Ingresar
```
- **Qué ves:** "Panel Admin" en sidebar, 2 tabs
  - Tab 1: INVENTARIO (productos, stocks)
  - Tab 2: PEDIDOS (los que creó el usuario)
- **Qué puedes hacer:**
  - En Pedidos: Clic ✅ para aprobar o ❌ para rechazar
  - Si rechazas, pide motivo
  - El estado del pedido cambia automáticamente

### ✅ Paso 4: Prueba como JEFE SUPERIOR
```
Username: jefe
Password: demo
Clic: Ingresar
```
- **Qué ves:** "Panel Jefe" en sidebar, 3 tabs
  - Tab 1: ESTADÍSTICAS (KPIs del sistema)
  - Tab 2: TODOS LOS PEDIDOS (lectura completa)
  - Tab 3: USUARIOS RECHAZADOS (problema users)
- **Qué puedes hacer:**
  - Ver gráficos de estadísticas
  - Filtrar todos los pedidos
  - Identificar usuarios problemáticos

---

## 🎨 Colores por Rol

```
Usuario      → 🔵 Azul/Cyan
Admin        → 🟣 Púrpura/Indigo
Jefe         → 🔴 Rojo/Naranja
```

---

## 🔄 Flujo Completo de Prueba

**1️⃣ Login como Usuario**
```
user / demo → Mis Pedidos
```

**2️⃣ Crear un Pedido**
```
Clic "Nuevo Pedido"
Producto: Alcohol etílico
Cantidad: 5
Prioridad: Alta
Observaciones: Urgente
Clic "Crear Pedido" ✅
```

**3️⃣ Ver Pedido Creado**
```
Aparece en tabla con estado "Pendiente"
Colores en la tabla cambiarán
```

**4️⃣ Logout**
```
Clic "Cerrar Sesión" en sidebar
```

**5️⃣ Login como Admin**
```
admin / demo → Panel Admin
Tab: Pedidos
```

**6️⃣ Aprobar Pedido**
```
Ves el pedido en la tabla
Clic ✅ (CheckCircle) en Acciones
Estado cambia a "Aprobado" ✅
```

**7️⃣ Logout y Login como Jefe**
```
jefe / demo → Panel Jefe
Tab: Estadísticas
```

**8️⃣ Ver Estadísticas**
```
Total Pedidos: 1 ✅
Aprobados: 1 ✅
Rechazados: 0
Tasa Aprobación: 100%
```

---

## 🔍 Qué Cambió vs Antes

### ANTES
- Una sola vista "Dashboard" para todos
- Sin diferenciación de permisos
- Confuso para usuarios finales

### AHORA
- 3 dashboards independientes por rol
- Cada usuario ve solo lo que necesita
- Interfaz clara y profesional
- Flujos de trabajo específicos

---

## 📱 Funciona en Mobile

- Hamburger menu automático
- Tablas con scroll horizontal
- Modales responsivos
- Botones grandes tocables

---

## ❌ Si Algo no Funciona

1. **No se guardan los datos:**
   - ✓ Están guardados en memoria (React state)
   - ✓ Si recarga página, se pierden (es demo)
   - ✓ En producción se guardarían en DB

2. **Viejo dashboard todavía existe:**
   - ✓ `/dashboard`, `/inventario`, `/pedidos` siguen activos
   - ✓ Disponibles como rutas opcionales

3. **Errores en consola:**
   - Abre: F12 (Developer Tools)
   - Busca errores rojos
   - Contacta si hay problemas

---

## 🎯 Resumen del Sistema

| Rol | Ver Pedidos | Crear Pedidos | Aprobar | Rechazar | Ve Inventario | Ve Usuarios |
|-----|:-:|:-:|:-:|:-:|:-:|:-:|
| Usuario | ✅ (Propios) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Admin | ✅ (Todos) | ❌ | ✅ | ✅ | ✅ | ❌ |
| Jefe | ✅ (Todos) | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 📞 Punto de Entrada

**Todos los usuarios comienzan en:**
```
http://localhost:5173/login
```

**Se redirigen automáticamente a:**
- Usuario → http://localhost:5173/usuario
- Admin → http://localhost:5173/admin
- Jefe → http://localhost:5173/jefe

---

## ✨ Próximas Pruebas

Después de esto, puedes:

1. **Crear múltiples pedidos** como usuario
2. **Rechazar algunos** como admin (pide motivo)
3. **Ver estadísticas** como jefe
4. **Identificar patrones** en la dashboard del jefe

---

**¡Sistema listo para demostración! 🎉**

Todas las vistas están completamente funcionales con datos de prueba incluidos.
