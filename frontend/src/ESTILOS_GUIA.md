# Guía actual de estilos visuales - SIGIRL

## Objetivo
Este archivo resume la estética real que está usando hoy el sistema para que puedas cambiar colores, tarjetas, fondos, botones y estructura general sin perder coherencia visual.

---

## Identidad visual actual
El sistema maneja una estética institucional, limpia y moderna, con estas características:

- Base clara y profesional
- Predominio de verdes, esmeralda y tonos suaves
- Tarjetas blancas con sombras ligeras
- Bordes redondeados amplios
- Encabezados con efecto glass y degradados
- Panel lateral con look suave y corporativo

---

## Paleta de color actual

### Colores globales más usados
- Verde principal: #43bb52
- Verde secundario: #78d64b
- Esmeralda intenso: #059669
- Teal de apoyo: #0d9488
- Cian de apoyo: #0891b2
- Fondo general claro: #f8fafc
- Texto principal: #0f172a
- Texto secundario: #475569
- Bordes suaves: tonos emerald-100 y slate-200

### Estados visuales
- OK: verdes suaves
- Bajo stock o advertencia: ámbar y naranja
- Error o agotado: rojo o rosa
- Pendiente: azul

---

## Variables globales activas
Fuente principal de control: src/index.css

Actualmente el sistema define estas variables globales:

- Fondo general con degradado suave verde, teal y cyan
- Texto principal oscuro
- Texto secundario gris azulado
- Borde translúcido para paneles glass
- Sombra suave institucional
- Selección de texto con tono aqua claro
- Scrollbar personalizada en verde y teal

También incluye:
- animación flotante suave
- paneles glass reutilizables
- títulos con degradado
- suavizado tipográfico general

---

## Archivos donde vive la estética actual

### 1. src/index.css
Controla:
- fondo global
- tipografías
- scroll
- variables CSS
- utilidades visuales globales

### 2. src/components/Layout.jsx
Controla:
- estructura general del panel
- header superior
- banner de bienvenida
- botones de ayuda
- espaciado principal del contenido

### 3. src/components/Sidebar.jsx
Controla:
- menú lateral
- ancho expandido o colapsado
- colores activos del menú
- iconografía
- bloque del usuario
- botón de cerrar sesión

### 4. src/pages/Dashboard.jsx
Controla:
- tarjetas de métricas
- gráficos
- tabla principal
- bloques visuales del dashboard general

### 5. src/pages/AdminDashboard.jsx
### 6. src/pages/JefeSuperiorDashboard.jsx
### 7. src/pages/UsuarioDashboard.jsx
Controlan:
- variación visual por rol
- tarjetas de estadísticas
- tablas y filtros
- paneles de alertas, usuarios y reportes

### 8. src/components/ReportPanel.jsx
Controla:
- panel visual de reportes
- gráficas
- tarjetas de actividad
- exportaciones

### 9. src/styles/theme.js
Contiene una paleta auxiliar y estilos reutilizables en formato JavaScript.

---

## Patrones visuales que se están usando hoy

### Fondo del sistema
- Base clara con apariencia limpia
- Mezcla de blanco, verde muy suave y gris claro

### Tarjetas
Clases frecuentes:
- rounded-2xl
- rounded-[20px]
- rounded-[24px]
- rounded-[28px]
- bg-white
- border border-emerald-100
- shadow-lg o shadow-md

Aspecto esperado:
- tarjeta blanca
- borde sutil verde
- sombra suave
- contenido aireado

### Botones primarios
Patrón más repetido:
- degradado entre #78d64b y #43bb52
- texto blanco
- bordes redondeados
- sombra verde suave

### Botones secundarios
Patrón más repetido:
- fondo blanco
- borde claro
- hover en verde suave o gris claro

### Encabezados y banners
- degradados verdes
- tipografía grande y negrita
- bloques con padding amplio
- apariencia ejecutiva y profesional

### Tablas
- encabezado con fondo muy claro
- bordes suaves
- filas con hover leve
- badges de estado por color

---

## Estilo del layout principal

### Sidebar
El panel lateral tiene:
- fondo degradado claro
- icono institucional al inicio
- bloque con avatar o iniciales
- navegación con resaltado verde cuando está activa
- opción de colapsar

### Header superior
Incluye:
- barra de búsqueda
- indicador de estado activo
- botón de notificaciones
- avatar del usuario
- botón de ayuda

### Banner de bienvenida
Usa:
- degradado verde fuerte
- texto blanco
- efecto de brillos suaves y profundidad

---

## Cómo cambiar toda la estética rápido
Si quieres rediseñar todo el sistema, este es el orden recomendado:

### Cambio global rápido
1. Modifica src/index.css para cambiar fondo, colores base, scroll y tipografía.
2. Modifica src/components/Layout.jsx para cambiar header, banner y estructura central.
3. Modifica src/components/Sidebar.jsx para cambiar menú, estados activos y navegación visual.
4. Ajusta src/components/ReportPanel.jsx para mantener consistencia en reportes y gráficas.
5. Repite detalles por rol en las páginas de dashboard.

### Si quieres un cambio de color total
Cambia principalmente:
- #78d64b
- #43bb52
- emerald-100
- emerald-50
- slate-800
- slate-600

Con eso puedes transformar el sistema a azul, morado, rojo institucional o un estilo oscuro.

---

## Guía rápida de equivalencias visuales

### Verde institucional actual
- Primario: #43bb52
- Secundario: #78d64b
- Sensación: laboratorio moderno, limpio y amigable

### Si lo quieres más corporativo azul
Reemplazar por:
- #2563eb
- #3b82f6
- blue-50 y blue-100

### Si lo quieres más elegante oscuro
Reemplazar por:
- #0f172a
- #1e293b
- #334155
- acentos verde o cyan

---

## Recomendación práctica
Si después quieres, se puede preparar una segunda versión del sistema con uno de estos estilos:

- minimalista institucional
- moderno tipo dashboard premium
- estilo laboratorio clínico
- oscuro profesional
- estilo universitario o gubernamental

---

## Resumen final
La estética actual de SIGIRL está centralizada sobre todo en:

- src/index.css
- src/components/Layout.jsx
- src/components/Sidebar.jsx
- src/components/ReportPanel.jsx
- dashboards por rol

Este archivo ya queda como mapa base para que cualquier cambio futuro sea más fácil, rápido y ordenado.
