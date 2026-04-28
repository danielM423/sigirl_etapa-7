# Resumen de Correcciones - 28 abril 2026

## ✅ YA REPARADO Y SUBIDO A MAIN

### 1. **Permisos 403 (admin/usuarios/productos)**
- **Migración 0014**: Garantiza que el usuario `admin` siempre tenga `is_staff=True` y `is_superuser=True`
- **Settings**: Email verificación por defecto en `False` para acceso inmediato sin verificar correo
- **Commit**: 462a711

**Qué hacer en Render**:
1. Manual Deploy del último commit
2. Verifica logs que diga: "Applying inventario.0014_ensure_admin_is_staff... OK"
3. Login como `admin` con tu `DJANGO_SUPERUSER_PASSWORD`
4. Intenta agregar producto en admin → debería funcionar ahora (201 en lugar de 403)

### 2. **Login mejorado**
- Frontend actualizado con mensajes claros para 401 y 500
- Aviso visible sobre credenciales dinámicas desde variables
- Build nuevo publicado
- **Commit**: 879b9de

---

## 🔄 PARCIALMENTE INVESTIGADO

### 3. **Caracteres especiales en Excel/PDF**
- **Ubicación**: `download_inventory_excel()` y `download_inventory_pdf()` en views.py
- **Problema**: openpyxl/reportlab no están forzando UTF-8
- **Solución propuesta**: Agregar encoding explícito en headers y usar fonte compatible con tildes

### 4. **Redirección automática en perfil**
- **Ubicación**: ProfileSettings.jsx (después de guardar)
- **Problema**: Usuario se redirige a /usuario sin su consentimiento
- **Investigación**: No hay redirección explícita en handleSave(); podría ser efecto colateral

### 5. **Chart width warnings**
- **Problema**: ResizeObserver reporta tamaños negativos
- **Ubicación**: ProfileSettings.jsx línea 187-195
- **Causa**: El contenedor no tiene altura inicial cuando el chart intenta renderizar

---

## ❌ NO INICIADO AÚN

### 6. **Hojas de vida en perfil**
- Requiere: Nuevo endpoint POST para upload de archivos
- Campo en UserProfile model
- UI file-input en ProfileSettings

### 7. **Registro con correos reales**
- La validación de dominios ya existe en `_validate_registration_email()`
- Necesita probar que funcione con email real

### 8. **Sacar lista en administrados**
- No está claro qué lista específica se refiere
- ¿InventarioList? ¿Usuarios? Necesita aclaración

---

## 🚀 PASOS INMEDIATOS

1. **Haz Manual Deploy en Render** del commit 462a711
2. **Carga fuerte en navegador**: Ctrl+F5 para limpiar caché
3. **Intenta**:
   - Login como `admin` → debe permitir ahora
   - Agregar producto en admin → no debería dar 403
   - Agregar usuario → debería funcionar

4. **Reporta JSON si aún hay 403**:
   ```javascript
   // En consola del navegador, antes de intentar crear
   const token = localStorage.getItem('token');
   console.log('Token:', token ? 'EXISTE' : 'NO EXISTE');
   // Al fallar, copia el JSON de la respuesta
   ```

---

## 📋 Commits relevantes

- **462a711**: Email verification OFF by default + ensure admin is staff
- **879b9de**: Frontend login copy + build assets
- **81b6f4d**: Seed default access users via migration
- **c43ee30**: Enforce default for email_verification_attempts
- **4053f11**: Harden register/login for email verification

