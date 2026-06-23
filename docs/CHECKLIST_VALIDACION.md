# ✅ Checklist de Validación - Sistema SIGIRL

## 🎯 Checklist de Funcionalidades

### **1. Registro de 3 Pasos**
- [ ] Accedo a `http://localhost:5173/register` 
- [ ] **Paso 1** se ve correctamente (Nombre, Apellido, Email)
- [ ] Botón "Siguiente →" activo
- [ ] Botón "Anterior" deshabilitado en paso 1
- [ ] Validación funciona (error si campo vacío)
- [ ] Progress bar muestra 33% completado

### **2. Paso 2 - Seguridad**
- [ ] Avanzo a paso 2 correctamente
- [ ] Veo campos: Usuario, Contraseña, Confirmar Contraseña
- [ ] Medidor de fuerza actualiza en tiempo real
- [ ] Icono de ojo toggle funciona (mostrar/ocultar)
- [ ] Validación: username mín 3 caracteres
- [ ] Validación: password mín 6 caracteres
- [ ] Validación: contraseñas deben coincidir
- [ ] Mensaje "✓ Las contraseñas coinciden" aparece
- [ ] Progress bar muestra 66% completado

### **3. Paso 3 - Institución y Rol**
- [ ] Avanzo a paso 3 correctamente
- [ ] Veo campos: Institución, Departamento, Rol
- [ ] Selector de Rol tiene 3 opciones:
  - [ ] 👤 Usuario (Solicitar reactivos)
  - [ ] 👨‍💼 Admin (Gestionar inventario)
  - [ ] 👔 Jefe Maestro (Supervisar sistema)
- [ ] Botón "Anterior" funciona (vuelve a paso 2)
- [ ] Datos del paso 2 se mantienen
- [ ] Botón "✓ Crear Cuenta" visible
- [ ] Progress bar muestra 100% completado

### **4. Redirección Automática - Usuario Regular**
- [ ] Complete registro con rol "Usuario"
- [ ] Pantalla de éxito muestra:
  - [ ] ✓ Checkmark animado
  - [ ] "¡Cuenta creada exitosamente!"
  - [ ] "Redirigiendo a tu panel de usuario..."
- [ ] Se redirije automáticamente a `/usuario`
- [ ] Veo **UsuarioDashboard** (Cyan/Azul)
- [ ] Botón "Mis Pedidos" visible
- [ ] Botón "Nuevo Pedido" funcional

### **5. Redirección Automática - Admin**
- [ ] Completo registro con rol "Admin"
- [ ] Pantalla de éxito muestra:
  - [ ] ✓ Checkmark animado
  - [ ] "¡Cuenta creada exitosamente!"
  - [ ] "Redirigiendo a tu panel de administrador..."
- [ ] Se redirije automáticamente a `/admin`
- [ ] Veo **AdminDashboard** (Púrpura/Indigo)
- [ ] Tab "Inventario" visible
- [ ] Tab "Pedidos" visible
- [ ] Estadísticas de admin visibles

### **6. Redirección Automática - Jefe Maestro**
- [ ] Completo registro con rol "Jefe Maestro"
- [ ] Pantalla de éxito muestra:
  - [ ] ✓ Checkmark animado
  - [ ] "¡Cuenta creada exitosamente!"
  - [ ] "Redirigiendo a tu panel de jefe maestro..."
- [ ] Se redirije automáticamente a `/jefe`
- [ ] Veo **JefeSuperiorDashboard** (Rojo/Naranja)
- [ ] Tab "Estadísticas" visible
- [ ] Tab "Todos los Pedidos" visible
- [ ] Tab "Usuarios Problemáticos" visible

### **7. Protección de Rutas**
- [ ] Intento acceder a `/usuario` sin login → Redirige a `/login`
- [ ] Intento acceder a `/admin` sin login → Redirige a `/login`
- [ ] Intento acceder a `/jefe` sin login → Redirige a `/login`
- [ ] Login como usuario, intento `/admin` → Redirige a `/no-autorizado`
- [ ] Login como admin, intento `/jefe` → Redirige a `/no-autorizado`

### **8. Sidebar y Navegación**
- [ ] Sidebar muestra nombre del usuario (ej: "juanperez")
- [ ] Sidebar muestra rol actual (ej: "Usuario")
- [ ] Sidebar tiene botón "Logout"
- [ ] Logout limpia localStorage y redirige a login
- [ ] Sidbar actualiza items según rol

### **9. localStorage Guardado**
- [ ] Abro DevTools (F12)
- [ ] Voy a "Application" → "Storage" → "Local Storage"
- [ ] Veo guardados: `username`, `role`, `token`
- [ ] Valores correctos según usuario registrado
- [ ] Los datos persisten después de recargar página

### **10. Estilos y Diseño**
- [ ] Todos los componentes tienen glassmorphism
- [ ] Colores consistentes por rol:
  - [ ] Usuario: Cyan/Azul
  - [ ] Admin: Púrpura/Indigo
  - [ ] Jefe: Rojo/Naranja
- [ ] Responsive en mobile (320px)
- [ ] Responsive en tablet (768px)
- [ ] Responsive en desktop (1024px+)
- [ ] Botones tienen efectos hover
- [ ] Transiciones suaves

### **11. Mensajes de Error**
- [ ] Email inválido → Muestra error
- [ ] Usuario existente → Muestra error
- [ ] Contraseña débil → Medidor lo indica
- [ ] Campos vacíos → Validación en cada paso

### **12. Datos Persistentes**
- [ ] Recargo página estando en dashboard → Se mantiene
- [ ] Cierro pestaña y abro nueva → Aún en dashboard (si token válido)
- [ ] Logout → localStorage limpio
- [ ] Al volver a login, acceso al mismo usuario

---

## 🧪 Escenarios de Prueba

### **Escenario A: Flujo Completo Usuario**
```
1. http://localhost:5173/register
2. Llenar Step 1 (Nombre: Test, Apellido: User, Email: test@test.com)
3. Llenar Step 2 (Usuario: testuser, Password: Test123!)  
4. Llenar Step 3 (Institución: Lab1, Depto: Análisis, Rol: Usuario)
5. Clic "Crear Cuenta"
6. Verificar redirección a /usuario
7. Ver UsuarioDashboard
```

### **Escenario B: Navegar entre pasos**
```
1. Registro Step 1
2. "Siguiente" → Step 2
3. "Anterior" → Step 1 (datos se mantienen)
4. "Siguiente" → Step 2 (datos aún están)
5. "Siguiente" → Step 3
6. "Anterior" → Step 2 (datos se mantienen)
```

### **Escenario C: Validaciones**
```
1. Step 1: Email sin @
   → Error: "Por favor ingresa un email válido"
2. Step 2: Usuario con 1 carácter
   → Error: "El usuario debe tener al menos 3 caracteres"
3. Step 2: Contraseñas no coinciden
   → Error: "Las contraseñas no coinciden"
4. Step 3: Institución vacía
   → Error: "La institución es requerida"
```

### **Escenario D: Cambio de Rol**
```
1. Registro como Usuario
2. Redirección a /usuario
3. Logout
4. Registro como Admin (diferente username)
5. Redirección a /admin
6. Redirección a /jefe (debería dar error 401)
```

---

## 🐛 Problemas Conocidos y Soluciones

### **Problema: Página en blanco después de registro**
**Solución:** Verificar que localStorage tenga `role` guardado y que la ruta exista

### **Problema: Redirección incorrecto**
**Solución:** Verificar que el rol guardado coincida con las rutas (usuario, admin, jefe)

### **Problema: ProtectedRoute bloqueando acceso**
**Solución:** Verificar que localStorage tenga `role` con valor correcto

---

## 📊 Métricas de Validación

- **Pasos del Registro:** 3 ✅
- **Mejoras por Rol:** 3 ✅
- **Validaciones:** 8+ ✅
- **Rutas Protegidas:** 3 ✅
- **Dashboards Disponibles:** 3 ✅
- **Redirecciones Automáticas:** 3 ✅

---

## ✨ Resultado Esperado

✅ Usuario completa registro en 3 pasos  
✅ Los datos se guardan automáticamente  
✅ Se redirige automáticamente a su dashboard  
✅ El dashboard tiene el contenido y estilos correctos  
✅ El logout funciona y limpia datos  
✅ Las rutas están protegidas por rol  
✅ Todo tiene estilos glassmorphism consistentes  

---

**¡Ejecuta estas validaciones para asegurarte que todo funciona correctamente!** 🚀
