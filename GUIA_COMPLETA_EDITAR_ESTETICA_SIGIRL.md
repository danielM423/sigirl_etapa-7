# Guía completa para editar la estética de SIGIRL

## Objetivo
Este documento te muestra:
- Qué carpetas puedes modificar para cambiar la apariencia
- Qué archivos controlan la estética
- Qué partes sí se pueden tocar sin dañar el sistema
- Qué partes no conviene modificar si solo quieres cambiar el diseño
- Qué líneas del código concentran los estilos visuales principales

---

## 1. Carpetas que sí puedes modificar para cambiar la estética

### Zona principal de diseño
- frontend/src/pages/
- frontend/src/components/
- frontend/src/styles/
- frontend/src/App.css
- frontend/src/index.css
- frontend/public/

### Qué puedes cambiar aquí
- colores
- fondos
- sombras
- bordes
- iconos
- tamaños de letra
- márgenes y espaciados
- tarjetas
- tablas
- botones
- formularios
- imágenes y logos
- distribución y alineación de cada pantalla

---

## 2. Carpetas que puedes tocar con cuidado

### Modificar con mucho cuidado
- frontend/src/App.jsx
- frontend/src/context/
- frontend/src/services/
- frontend/src/utils/

### Motivo
Estas zonas mezclan estética con comportamiento del sistema. Si cambias rutas, nombres de variables o funciones, puedes romper el login, la navegación o la persistencia de datos.

---

## 3. Carpetas que NO deberías modificar si solo quieres cambiar la estética

- backend/
- inventario/
- sigirl/
- database/
- cualquier carpeta migrations/
- db.sqlite3
- manage.py
- package.json si solo quieres diseño

### Motivo
Estas partes pertenecen al backend, base de datos y lógica principal. Cambiarlas no mejora la apariencia y sí puede dañar el funcionamiento.

---

## 4. Mapa completo de archivos visuales y líneas recomendadas

## A. Estructura general del panel

### Archivo
frontend/src/components/Layout.jsx

### Líneas importantes
- 47 a 57: fondo general del panel y contenedor principal centrado
- 56 a 100: barra superior, saludo, buscador, botones y espaciado principal
- 102 a 162: modal de ayuda y estética del popup

### Aquí puedes cambiar
- ancho máximo del contenido
- centrado de la interfaz
- espaciado entre bloques
- color de fondo general
- estilo del buscador
- diseño del botón de ayuda

### No cambies aquí
- appendSystemAlert
- roleLabel
- displayName
- handleHelpSubmit

---

## B. Menú hamburguesa y navegación lateral

### Archivo
frontend/src/components/Sidebar.jsx

### Líneas importantes
- 29 a 62: estructura del menú por rol
- 108 a 146: caja lateral, borde, sombra y fondo del menú
- 149 a 178: botones del menú y estados activos
- 196 a 204: botón hamburguesa

### Aquí puedes cambiar
- ancho del menú
- colores del menú activo
- espaciado entre botones
- forma redondeada de los botones
- avatar del usuario
- sombras y transiciones

### No cambies aquí
- path de navegación
- handleNavigation
- logout
- lógica de roles

---

## C. Estilos globales de toda la app

### Archivo
frontend/src/index.css

### Líneas importantes
- 3 a 15: variables globales de color y fondo
- 23 a 30: fondo del body y tipografía general
- 53 a 61: estilo glass-panel
- 77 a 92: scrollbar personalizada

### Aquí puedes cambiar
- paleta completa del sistema
- fondo principal de toda la aplicación
- tipografía base
- selección de texto
- scroll visual

### No cambies aquí
- estructura base del import de Tailwind

---

## D. Clases visuales reutilizables

### Archivo
frontend/src/App.css

### Líneas importantes
- 7 a 18: glass-card
- 20 a 26: panel-title
- 33 a 40: status-pill
- 43 a 48: hover-lift

### Aquí puedes cambiar
- efecto glassmorphism
- títulos con degradado
- pills de estado
- animación hover

---

## E. Panel de reportes y gráficas

### Archivo
frontend/src/components/ReportPanel.jsx

### Líneas importantes
- 18 a 20: estructura general del panel
- 21 a 35: encabezado y botones de exportación
- 38 a 66: cajas de gráficas
- 68 a 84: actividad reciente

### Aquí puedes cambiar
- colores de gráficas
- bordes y sombras
- altura de los paneles
- estilo de exportación Excel y PDF

### No cambies aquí
- onExportExcel
- onExportPdf
- estructura de datos primaryData, secondaryData y activity

---

## F. Dashboard del administrador

### Archivo
frontend/src/pages/AdminDashboard.jsx

### Líneas importantes para estética
- 347 a 384: título principal y botones de pestañas
- 385 a 394: panel de reportes
- 396 a 455: tarjetas de métricas
- 456 a 770: filtros, tablas y colores de estados
- 771 a 860: modal del inventario

### Aquí puedes cambiar
- colores del panel admin
- separación entre tabs
- tarjetas estadísticas
- apariencia de la tabla
- estilos del modal

### No cambies aquí si solo es diseño
- hydrate
- handleGuardarProducto
- handleEliminarProducto
- handleAprobarPedido
- handleRechazarPedido
- exportaciones

---

## G. Dashboard de jefatura

### Archivo
frontend/src/pages/JefeSuperiorDashboard.jsx

### Líneas importantes para estética
- 463 a 511: título principal y navegación por pestañas
- 513 a 896: reportes, tarjetas, filtros, tablas, alertas y usuarios
- 897 a 1048: modal de pedidos
- 1049 a 1118: modal de usuarios

### Aquí puedes cambiar
- tamaño del encabezado
- alineación central
- espaciado entre botones y secciones
- color de badges
- diseño de tablas
- estilo de modales

### No cambies aquí si solo es visual
- handleGuardarPedido
- handleCambiarEstadoPedido
- handleGuardarUsuario
- handleResolverAlerta
- syncUsuariosConPedidos
- saveSigirlCollections
- loadSigirlCollections

---

## H. Dashboard del usuario

### Archivo
frontend/src/pages/UsuarioDashboard.jsx

### Líneas importantes
- 186 a 244: título y tarjetas de resumen
- 245 a 407: bloque de reactivos restringidos y panel principal
- 408 a 531: modal de solicitud

### Aquí puedes cambiar
- colores de tarjetas
- presentación de reactivos críticos
- bordes y espaciado
- diseño del modal de pedido

### No cambies aquí
- evaluateReactivoAccess
- appendSystemAlert
- handleGuardarPedido

---

## I. Inventario general

### Archivo
frontend/src/pages/Inventario.jsx

### Líneas importantes
- 154 a 205: cabecera y tarjetas resumen
- 206 a 379: filtros, buscador y tabla
- 380 a 460: modal de producto

### Aquí puedes cambiar
- estilo del buscador
- badges de estado
- colores de tabla
- separaciones y tarjetas

### No cambies aquí
- handleGuardarProducto
- handleEliminarProducto
- loadSigirlCollections
- saveSigirlCollections

---

## J. Pedidos generales

### Archivo
frontend/src/pages/pedidos.jsx

### Líneas importantes
- 175 a 226: cabecera y tarjetas superiores
- 227 a 392: filtros, botón nuevo y tabla
- 393 a 458: modal de creación

### Aquí puedes cambiar
- diseño del listado de pedidos
- colores por prioridad y estado
- botones de acción
- modal

### No cambies aquí
- handleGuardarPedido
- handleAprobarPedido
- handleRechazarPedido

---

## K. Pantalla de login

### Archivo
frontend/src/pages/Login.jsx

### Líneas importantes
- 74 a 89: fondo completo y decoración visual
- 92 a 156: tarjeta de login, inputs, botón y enlace

### Aquí puedes cambiar
- fondo del acceso
- degradados
- logo
- forma del formulario
- botón ingresar
- sombras

### No cambies aquí
- handleLogin
- setUser
- setRole
- api.post con token

---

## L. Pantalla de registro

### Archivo
frontend/src/pages/Register.jsx

### Líneas importantes
- 215 a 228: fondo general y cabecera
- 231 a 246: barra de progreso
- 251 a 502: formulario visual, botones y pasos

### Aquí puedes cambiar
- colores del wizard
- tamaño de inputs
- barra de progreso
- botones siguiente, anterior y crear cuenta

### No cambies aquí
- validateStep
- handleSubmit
- navigate por rol
- guardado de usuario y token

---

## M. Perfil del usuario

### Archivo
frontend/src/pages/ProfileSettings.jsx

### Líneas importantes
- 343 a 355: contenedor general y carga inicial
- 372 a 390: bloque de estadísticas visuales
- 393 a 569: tarjeta de datos del perfil, foto, inputs y botones
- 571 a 636: preferencias y eliminación de cuenta

### Aquí puedes cambiar
- diseño del perfil
- estilos de la foto/avatar
- colores de botones
- inputs y tarjetas
- espaciado interno

### No cambies aquí
- handleAvatarChange
- handleSave
- handleDeleteAccount
- applyProfileData
- llamadas al backend

---

## N. Tema central reutilizable

### Archivo
frontend/src/styles/theme.js

### Líneas importantes
- 2 a 15: colores globales reutilizables
- 17 a 133: estilos JS reutilizables para tarjetas, botones, inputs y tablas

### Aquí puedes cambiar
- colores base
- estilo reutilizable en componentes JS

### No cambies aquí
- la estructura de exportación si otros archivos la usan

---

## 5. Qué sí puedes modificar sin miedo en casi todos los archivos visuales

Puedes cambiar con seguridad estas clases o conceptos:
- bg-
- text-
- border-
- shadow-
- rounded-
- px py mx my gap
- w h max-w
- flex grid justify-center items-center
- hover:
- transición y duración

Esto cambia la estética sin tocar la lógica.

---

## 6. Qué NO deberías tocar si solo quieres diseño

No edites estas funciones o conceptos salvo que realmente quieras cambiar el comportamiento:
- useEffect de carga de datos
- navigate
- rutas
- api.get, api.post, api.patch
- saveSigirlCollections
- loadSigirlCollections
- appendSystemAlert
- validateStep
- handleLogin
- handleSubmit
- handleGuardar
- tokens o autorización

---

## 7. Recomendación práctica para editar sin romper nada

### Orden ideal
1. Empieza por index.css para cambiar fondo, colores y tipografía general
2. Luego edita Layout.jsx para el centrado y la barra superior
3. Después Sidebar.jsx para el menú
4. Luego cada dashboard de pages para tarjetas, tablas y modales
5. Por último Login.jsx y Register.jsx si quieres uniformidad total

### Consejo importante
Si solo vas a cambiar apariencia, trabaja casi siempre dentro de className y evita cambiar nombres de funciones, estados o rutas.

---

## 8. Resumen rápido

### Más seguros para estética
- frontend/src/index.css
- frontend/src/App.css
- frontend/src/components/Layout.jsx
- frontend/src/components/Sidebar.jsx
- frontend/src/components/ReportPanel.jsx
- frontend/src/pages/Login.jsx
- frontend/src/pages/Register.jsx
- frontend/src/pages/AdminDashboard.jsx
- frontend/src/pages/JefeSuperiorDashboard.jsx
- frontend/src/pages/UsuarioDashboard.jsx
- frontend/src/pages/Inventario.jsx
- frontend/src/pages/pedidos.jsx
- frontend/src/pages/ProfileSettings.jsx

### No tocar si solo quieres diseño
- backend/
- sigirl/
- inventario/
- database/
- db.sqlite3
- services/api.js
- utils/sigirlStorage.js

---

Documento creado para ayudarte a modificar la estética de SIGIRL sin romper el funcionamiento del sistema.
