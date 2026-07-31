# INFORME TÉCNICO COMPLETO DEL SISTEMA SIGIRL

**Proyecto:** Sistema de Gestión de Inventarios y Reactivos de Laboratorio  
**Fecha:** 20 de abril de 2026  
**Estado actual:** Funcional en entorno de desarrollo, con mejoras recientes de roles, formularios y reportes

---

## 1. Resumen general del proyecto

SIGIRL es un sistema web orientado a la administración de inventario, pedidos internos, control de reactivos críticos y seguimiento de alertas dentro de un entorno de laboratorio. El proyecto está construido con una arquitectura separada en frontend, backend y base de datos local.

Actualmente el sistema ya cuenta con:

- autenticación real con JWT
- paneles por roles
- flujo de pedidos por usuario
- aprobación y rechazo por administración y jefatura
- módulo de inventario
- sistema de alertas y ayuda
- evaluación de seguridad para reactivos restringidos
- persistencia real en base de datos
- sincronización entre React y Django

En términos prácticos, el sistema ya puede ser mostrado, probado y ampliado sobre una base estable.

---

## 2. Arquitectura general

### 2.1 Frontend

El frontend está desarrollado en **React** con **Vite** y organiza la navegación por componentes, páginas y contexto de usuario.

**Tecnologías usadas:**

- React
- React Router
- Axios
- Tailwind / estilos utilitarios
- Lucide React para iconografía

### 2.2 Backend

El backend está desarrollado en **Django** con **Django REST Framework**, usando autenticación JWT y endpoints REST para exponer los datos del sistema.

**Tecnologías usadas:**

- Django
- Django REST Framework
- Simple JWT
- CORS Headers

### 2.3 Base de datos

La base de datos actual es **SQLite**, ideal para desarrollo, demostración y fase académica del proyecto.

---

## 3. Estructura funcional del sistema

### 3.1 Módulos principales implementados

| Módulo | Estado | Descripción |
|---|---|---|
| Login | Implementado | Ingreso con usuario, contraseña y rol |
| Registro | Implementado | Creación de cuentas con clasificación por perfil |
| Usuario | Implementado | Solicitud de pedidos y consulta del historial propio |
| Administrador | Implementado | Gestión de inventario, pedidos y alertas |
| Jefe superior | Implementado | Supervisión general, usuarios, alertas y decisiones sensibles |
| Inventario | Implementado | Productos, cantidades, umbrales y estados |
| Pedidos | Implementado | Creación, aprobación, rechazo y trazabilidad |
| Alertas | Implementado | Reportes de ayuda, problemas y riesgo con reactivos |
| Reactivos críticos | Implementado | Evaluación previa y autorización especial |

---

## 4. Roles del sistema

El sistema distingue tres perfiles operativos:

### 4.1 Usuario
Puede:
- iniciar sesión
- crear pedidos
- consultar sus solicitudes
- responder cuestionario para reactivos restringidos
- enviar reportes de ayuda o alerta

### 4.2 Administrador
Puede:
- revisar inventario
- agregar, editar y eliminar productos
- aprobar o rechazar pedidos
- gestionar alertas del sistema
- autorizar solicitudes con reactivos críticos

### 4.3 Jefe superior
Puede:
- ver estadísticas globales
- revisar todos los pedidos
- consultar usuarios y rechazos
- revisar alertas sensibles
- intervenir en autorizaciones especiales

---

## 5. Cómo funciona el sistema de punta a punta

### Flujo general del pedido

1. El usuario inicia sesión.
2. En su panel selecciona el producto o reactivo.
3. Ingresa cantidad, prioridad y observaciones.
4. Si el reactivo es crítico, responde el cuestionario de seguridad.
5. El sistema calcula un puntaje de acceso.
6. El pedido queda registrado como pendiente.
7. El administrador o el jefe revisan la solicitud.
8. Si aprueban, el estado cambia y el inventario puede descontarse.
9. Si rechazan, se registra el motivo.
10. Todo queda visible en las interfaces correspondientes.

---

## 6. Dónde se ve la información

### Información visible por pantalla

- **Login:** acceso al sistema y redirección según rol
- **Registro:** creación de nuevas cuentas
- **Panel usuario:** pedidos propios, formulario de solicitud, reactivos críticos
- **Panel admin:** inventario, pedidos pendientes y alertas
- **Panel jefe:** estadísticas, usuarios, pedidos globales y alertas
- **Botón global de ayuda:** reportes rápidos para soporte y eventos críticos

---

## 7. Estado actual del frontend

La interfaz ya tiene un nivel visual alto y una estructura limpia. Se usan componentes compartidos para mantener consistencia entre paneles.

### Componentes relevantes

- Layout general con botón flotante de alerta/ayuda
- menú lateral por rol
- protección de rutas
- contexto de sesión
- tablas y estadísticas con diseño responsive

### Ejemplo real de rutas por rol en React

```jsx
<Route
  path="/admin"
  element={
    <ProtectedRouteByRole requiredRoles={['admin']}>
      <AdminDashboard />
    </ProtectedRouteByRole>
  }
/>

<Route
  path="/jefe"
  element={
    <ProtectedRouteByRole requiredRoles={['jefe']}>
      <JefeSuperiorDashboard />
    </ProtectedRouteByRole>
  }
/>
```

### Observación técnica

El frontend quedó trabajando en modo **híbrido sincronizado**:

- mantiene colecciones locales para experiencia rápida
- pero sincroniza productos, pedidos y alertas con la API real

Esto permitió integrar el sistema sin romper la interfaz ya construida.

---

## 8. Estado actual del backend

El backend ya está configurado y operativo bajo Django.

### Endpoints principales disponibles

- autenticación JWT
- refresh token
- registro de usuario
- usuario actual
- productos
- categorías
- movimientos
- pedidos
- alertas

### Ejemplo de lógica real del backend

```python
class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.select_related('producto', 'usuario').all()
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return queryset

        return queryset.filter(usuario=user)
```

### Qué hace esta lógica

- si el usuario es admin o jefe, puede ver todos los pedidos
- si es usuario normal, solo puede ver los suyos

---

## 9. Base de datos y modelos

Actualmente la base de datos ya soporta la estructura real del negocio.

### Modelos principales

#### Categoria
Guarda la clasificación de los productos.

#### Producto
Guarda:
- nombre
- tipo
- categoría
- cantidad
- mínimo
- ubicación
- fecha de vencimiento
- estado derivado

#### Movimiento
Registra entradas y salidas del inventario.

#### Pedido
Guarda:
- usuario
- producto
- código
- cantidad
- estado
- prioridad
- solicitante
- departamento
- fecha de solicitud
- fecha de respuesta
- observaciones
- motivo de rechazo
- evaluación de seguridad

#### Alerta
Guarda:
- tipo
- título
- descripción
- prioridad
- fecha
- estado
- remitente
- destinatario

### Ejemplo real del modelo de alerta

```python
class Alerta(models.Model):
    tipo = models.CharField(max_length=50, default='ayuda')
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    prioridad = models.CharField(max_length=10, default='media')
    fecha = models.DateField(default=date.today)
    estado = models.CharField(max_length=20, default='nueva')
    remitente = models.CharField(max_length=150, blank=True, default='Sistema')
    destinatario = models.CharField(max_length=150, blank=True, default='Admin y Jefe')
```

---

## 10. Reactivos críticos y evaluación de seguridad

Esta es una de las funcionalidades más valiosas del sistema.

Ya existe un catálogo de reactivos restringidos con:

- nivel de riesgo
- cupo máximo
- puntaje mínimo requerido
- autorización especial

### Ejemplo real de reactivo crítico

```javascript
{
  nombre: 'Ácido sulfúrico concentrado',
  nivel: 'crítico',
  categoria: 'Ácidos',
  descripcion: 'Solo personal entrenado y con supervisión directa.',
  puntajeMinimo: 80,
  cupoMaximo: 2,
  requiereAutorizacion: true,
}
```

### Lógica del cuestionario

El sistema evalúa si el usuario cuenta con:

- capacitación
- uso correcto de EPP
- conocimiento de protocolos
- supervisión adecuada

Si no cumple el puntaje mínimo:
- se registra el pedido
- se genera una alerta automática
- admin y jefe quedan notificados

---

## 11. Sistema de alertas y ayuda

Desde el layout principal existe un botón flotante de alerta/ayuda que puede usarse desde distintos paneles.

### Casos contemplados

- solicitud de ayuda
- reporte de error o problema
- riesgo o incidente con reactivo

### Ejemplo real de envío de alerta desde interfaz

```jsx
appendSystemAlert({
  tipo: 'problema',
  prioridad: 'alta',
  titulo: 'Reporte de problema en el sistema',
  descripcion: helpForm.descripcion.trim(),
  remitente: user?.username || 'Usuario',
  destinatario: 'Admin y Jefe',
});
```

---

## 12. Estado técnico verificado

Durante la validación técnica más reciente del sistema se comprobó lo siguiente:

### Frontend
- compilación correcta con Vite
- sin errores críticos de build en las vistas modificadas
- interfaz levantada y navegable en entorno local
- gráficas estabilizadas sin el problema previo de tamaño negativo

### Backend
- servidor Django funcional para autenticación y consumo de datos
- persistencia activa con SQLite
- lógica de permisos ya presente para operaciones sensibles

### Autenticación y flujos
Se verificó el acceso real con cuentas demo:

- admin / demo
- jefe / demo
- user / demo

### Validaciones recientes confirmadas
- ingreso exitoso a los paneles de administrador y jefatura
- visualización restringida para usuario estándar en inventario y pedidos
- exportaciones activas desde reportes, inventario, pedidos y paneles ejecutivos
- formularios unificados visualmente con el nuevo estilo compartido

---

## 13. Mejoras realizadas recientemente

En la actualización más reciente del sistema se dejó integrado lo siguiente:

1. restricción visual y funcional por rol en inventario
2. restricción de pedidos para que el usuario normal solo vea y gestione los suyos
3. mejora de búsquedas en inventario, pedidos, usuarios y alertas
4. nuevos filtros por categoría, prioridad y estado
5. exportación a Excel y PDF desde paneles administrativos y reportes
6. mejora del dashboard general con navegación por rol y reportes exportables
7. actualización estética unificada para login, registro, perfil y formularios modales
8. validación de usuarios duplicados en registro
9. control más claro de los roles que puede crear admin o jefatura
10. mejor presentación del centro de alertas en administración y jefatura

### Resultado práctico de esta fase

- el sistema está más ordenado visualmente
- los permisos están más claros para cada perfil
- los reportes ya ofrecen un valor más útil para supervisión
- la experiencia general es más estable para demostración y pruebas

---

## 14. Diagnóstico técnico honesto

### Fortalezas del sistema

- arquitectura clara y separada
- backend real ya funcional
- frontend muy avanzado visualmente
- manejo de roles bien planteado
- flujo de reactivos críticos muy pertinente para el contexto académico
- buena base para demostrar funcionalidad institucional

### Aspectos que aún se pueden mejorar

- reforzar todavía más la capa backend para que todos los permisos dependan menos del modo híbrido
- ampliar auditoría y trazabilidad histórica de acciones sensibles
- enriquecer reportes institucionales con más indicadores comparativos
- documentar instalación y despliegue final para entrega o migración a otro equipo
- consolidar progresivamente una sincronización 100% API cuando se cierre la etapa visual

---

## 15. Conclusión general

SIGIRL ya se encuentra en una **fase funcional avanzada y bastante presentable**. El sistema no solo existe como maqueta: actualmente tiene navegación real, persistencia, flujos por rol, reportes y controles específicos para el contexto de laboratorio.

La combinación entre inventario, pedidos, alertas, exportaciones y control de reactivos críticos le da al proyecto un valor académico, técnico y operativo claramente visible.

### Estado final resumido

- **Frontend:** funcional, moderno, consistente y listo para demostración
- **Backend:** activo, estructurado y con lógica real de permisos
- **Base de datos:** actualizada y persistente
- **Flujos por rol:** implementados y reforzados visualmente
- **Reactivos restringidos:** controlados con evaluación y autorización
- **Alertas:** activas, filtrables y visibles para administración y jefatura
- **Reportes:** exportables y más útiles para seguimiento

---

## 16. Recomendación de siguiente fase

La siguiente etapa recomendada del proyecto es:

1. terminar el endurecimiento de permisos del backend
2. completar trazabilidad y auditoría de acciones
3. cerrar detalles de presentación final y documentación institucional
4. preparar versión de entrega académica o demostración formal

---

## 17. Archivos técnicos más importantes del proyecto

### Frontend
- frontend/src/App.jsx
- frontend/src/pages/Login.jsx
- frontend/src/pages/Register.jsx
- frontend/src/pages/UsuarioDashboard.jsx
- frontend/src/pages/AdminDashboard.jsx
- frontend/src/pages/JefeSuperiorDashboard.jsx
- frontend/src/pages/Inventario.jsx
- frontend/src/pages/pedidos.jsx
- frontend/src/pages/Dashboard.jsx
- frontend/src/pages/ProfileSettings.jsx
- frontend/src/components/Layout.jsx
- frontend/src/components/Sidebar.jsx
- frontend/src/components/ReportPanel.jsx
- frontend/src/context/UserContext.jsx
- frontend/src/services/api.js
- frontend/src/utils/sigirlStorage.js
- frontend/src/utils/reportExport.js

### Backend
- sigirl/inventario/models.py
- sigirl/inventario/views.py
- sigirl/inventario/serializers.py
- sigirl/inventario/urls.py
- sigirl/sigirl/settings.py
- sigirl/sigirl/urls.py

---

**Documento actualizado al 20 de abril de 2026 para seguimiento técnico integral del sistema SIGIRL.**
