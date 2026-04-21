# 🚀 INSTRUCCIONES PRÁCTICAS - MODIFICACIONES PARA SIGIRL

## 1️⃣ CÓMO PERSONALIZAR COLORES GLOBALES

**Archivo:** `frontend/src/styles/theme.js`

```javascript
// OPCIÓN A: Cambiar paleta completa
export const colors = {
  primary: '#7c3aed',      // ← CAMBIA ESTE (violeta actual)
  secondary: '#06b6d4',    // ← O ESTE (cyan)
  accent: '#10b981',       // Verde
  // ... resto igual
};

// Resultado: 🎨 TODOS los botones, botones, links cambiarán automáticamente
```

**Colores sugeridos:**
- Azul profesional: `#2563eb`
- Verde farmacéutico: `#059669`
- Rojo alerta: `#dc2626`
- Ámbar laboratorio: `#d97706`

---

## 2️⃣ CÓMO AGREGAR CAMPOS A UN FORMULARIO

**Ejemplo: Agregar campo "Proveedor" a Inventario**

### Paso 1: Backend (DJ)

**Archivo:** `inventario/models.py`

```python
class Producto(models.Model):
    nombre = models.CharField(max_length=150)
    # ... campos existentes ...
    
    # ✅ AGREGÁ ESTA LÍNEA:
    proveedor = models.CharField(max_length=100, blank=True, null=True)
    # ☝️ proveedor es OPCIONAL (blank=True, null=True)
    
    def __str__(self):
        return self.nombre
```

### Paso 2: Crear migración

```bash
# En terminal en carpeta del proyecto:
python manage.py makemigrations
python manage.py migrate

# ✅ Se crea la columna en la BD automáticamente
```

### Paso 3: Frontend - Actualizar tabla

**Archivo:** `frontend/src/pages/Inventario.jsx`

En la tabla, dentro del `<thead>`:

```jsx
<tr>
  <th className="text-left py-4 px-5 font-bold">Producto</th>
  <th className="text-left py-4 px-5 font-bold">Categoría</th>
  <th className="text-left py-4 px-5 font-bold">Cantidad</th>
  {/* ✅ AGREGÁ ESTAS LÍNEAS: */}
  <th className="text-left py-4 px-5 font-bold">Proveedor</th>
  <th className="text-left py-4 px-5 font-bold">Ubicación</th>
</tr>
```

En los datos `<tbody>`:

```jsx
{filteredProducts.map(producto => (
  <tr key={producto.id}>
    <td className="py-4 px-5">{producto.nombre}</td>
    <td className="py-4 px-5">{producto.categoria}</td>
    <td className="py-4 px-5">{producto.cantidad}</td>
    {/* ✅ AGREGÁ ESTAS LÍNEAS: */}
    <td className="py-4 px-5">{producto.proveedor || 'N/A'}</td>
    <td className="py-4 px-5">{producto.ubicacion}</td>
  </tr>
))}
```

### Paso 4: Modal - Agregar input

**En el mismo archivo, modal de crear producto:**

```jsx
<div>
  <label className="block text-sm font-bold text-slate-700 mb-2">Proveedor</label>
  <input 
    type="text" 
    placeholder="Ej: Sigma-Aldrich"
    className="w-full border border-slate-200 rounded-lg px-4 py-3..."
  />
</div>
```

✅ **¡LISTO! El campo funciona en toda la app**

---

## 3️⃣ CÓMO CAMBIAR LAYOUTS/DISTRIBUCIÓN

### Cambiar de 4 columnas a 3 en Stats Cards

**Archivo:** `frontend/src/pages/Dashboard.jsx`

**ANTES:**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
  {/* 4 cards */}
</div>
```

**DESPUÉS:**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
  {/* Ahora 3 cards por pantalla */}
</div>
```

**Valores disponibles:**
- `lg:grid-cols-2` → 2 columnas
- `lg:grid-cols-3` → 3 columnas (recomendado)
- `lg:grid-cols-4` → 4 columnas (actual)
- `lg:grid-cols-5` → 5 columnas

---

## 4️⃣ CÓMO CAMBIAR TEXTOS/ETIQUETAS

**Archivo:** `frontend/src/pages/Inventario.jsx`

```jsx
// ANTES:
<h1 className="text-3xl font-bold">Gestión de Inventario</h1>

// DESPUÉS:
<h1 className="text-3xl font-bold">Mi Almacén de Reactivos</h1>
```

**Otros textos fáciles de cambiar:**

```jsx
// Placeholder del search:
placeholder="Buscar producto..."  →  placeholder="¿Qué necesitas?"

// Botones:
"Nuevo"  →  "Agregar Producto"
"Editar"  →  "Modificar"
"Eliminar"  →  "Quitar"

// Labels:
"Estado"  →  "Disponibilidad"
"Categoria"  →  "Tipo"
```

---

## 5️⃣ CÓMO AGREGAR VALIDACIONES FRONTALES

**Archivo:** `frontend/src/pages/Inventario.jsx`

En el modal de crear producto:

```jsx
const [formData, setFormData] = useState({
  nombre: '',
  cantidad: '',
  categoria: ''
});

const handleSubmit = () => {
  // ✅ AGREGÁ VALIDACIONES:
  if (!formData.nombre.trim()) {
    alert('⚠️ El nombre es requerido');
    return;
  }
  
  if (formData.cantidad < 0) {
    alert('⚠️ La cantidad no puede ser negativa');
    return;
  }
  
  if (!formData.categoria) {
    alert('⚠️ Debe seleccionar una categoría');
    return;
  }
  
  // Si pasó todas validaciones:
  console.log('✅ Datos válidos, guardar...');
};
```

---

## 6️⃣ CÓMO MEJORAR TABLA CON ORDENAMIENTO

**Archivo:** `frontend/src/pages/Inventario.jsx`

```jsx
const [sortBy, setSortBy] = useState('nombre');
const [sortOrder, setSortOrder] = useState('asc');

const sortedProducts = [...filteredProducts].sort((a, b) => {
  let compare = 0;
  
  switch(sortBy) {
    case 'nombre':
      compare = a.nombre.localeCompare(b.nombre);
      break;
    case 'cantidad':
      compare = a.cantidad - b.cantidad;
      break;
    case 'categoria':
      compare = (a.categoria || '').localeCompare(b.categoria || '');
      break;
    default:
      return 0;
  }
  
  return sortOrder === 'asc' ? compare : -compare;
});

// En el header de tabla:
<th 
  onClick={() => setSortBy('nombre')}
  className="cursor-pointer hover:bg-slate-100"
>
  Producto ↕️
</th>
```

---

## 7️⃣ CÓMO AGREGAR PAGINACIÓN

**Archivo:** `frontend/src/pages/Inventario.jsx` (al final)

```jsx
const ITEMS_PER_PAGE = 10;
const [currentPage, setCurrentPage] = useState(1);

const paginatedProducts = useMemo(() => {
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  return filteredProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);
}, [filteredProducts, currentPage]);

const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

// Mostrar en tabla:
{paginatedProducts.map(...)}

// Botones paginación (al pie):
<div className="flex gap-2 mt-4">
  <button 
    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
    disabled={currentPage === 1}
  >
    Anterior
  </button>
  
  <span>
    Página {currentPage} de {totalPages}
  </span>
  
  <button 
    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
    disabled={currentPage === totalPages}
  >
    Siguiente
  </button>
</div>
```

---

## ⚙️ CLASE RÁPIDA: ESTRUCTURA DE TAILWIND CSS

```jsx
className="
  /* DISPLAY */
  flex items-center justify-between
  
  /* ESPACIOS */
  p-4           /* padding interno */
  m-2           /* margin externo */
  gap-3         /* espacio entre items */
  
  /* TAMAÑO */
  w-full        /* ancho 100% */
  h-12          /* alto */
  
  /* COLOR */
  bg-white      /* fondo blanco */
  text-slate-700  /* texto gris */
  border border-slate-200  /* borde */
  
  /* TIPOGRAFÍA */
  text-lg font-bold  /* tamaño + peso */
  
  /* INTERACCIÓN */
  hover:bg-slate-100  /* al pasar mouse */
  cursor-pointer      /* mano */
  transition-all      /* animación suave */
"
```

**Tamaños:** `p-0, p-1, p-2, ..., p-12`  
**Breakpoints:** `sm:`, `md:`, `lg:`, `xl:`, `2xl:`  
**Colores:** `slate, violet, emerald, amber, rose, etc.`

---

## 🎯 CHECKLIST: ANTES DE MODIFICAR

- [ ] ¿El cambio es en frontend/estilos? → ✅ SEGURO
- [ ] ¿Solo cambio UI sin lógica de API? → ✅ SEGURO  
- [ ] ¿Agrego archivo nuevo? → ✅ SEGURO
- [ ] ¿Toco Backend o models.py? → ❌ HAGO BACK UP PRIMERO
- [ ] ¿Cambio ProtectedRoute o App.jsx? → ❌ MUCHO CUIDADO
- [ ] ¿Modifco theme.js solo colores? → ✅ SEGURO

---

## 📞 SI ALGO ROMPE

**Paso 1:** Ctrl+Z (deshacer)  
**Paso 2:** Si no funciona, volvé a la versión anterior del archivo  
**Paso 3:** Preguntame, que te ayudo

**NUNCA dejes cambios sin probar en desarrollo primero** ⚠️

