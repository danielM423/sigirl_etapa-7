import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Wrench, 
  Calendar, 
  DollarSign, 
  User, 
  FileText,
  Plus,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  Barcode,
  Tag,
  MapPin,
  Building,
  CalendarDays
} from 'lucide-react';

const COLORS = {
  BAJO: '#22c55e',
  MEDIO: '#f59e0b',
  ALTO: '#ef4444',
};

const NIVELES_USO = [
  { value: 'todos', label: 'Todos los equipos', color: '#64748b' },
  { value: 'bajo', label: '🟢 Bajo uso (< 3 mantenimientos)', color: COLORS.BAJO },
  { value: 'medio', label: '🟡 Medio uso (3-5 mantenimientos)', color: COLORS.MEDIO },
  { value: 'alto', label: '🔴 Alto uso (> 5 mantenimientos)', color: COLORS.ALTO },
];

const AMBIENTES = ['TOC 501', 'TOC 503', 'TOC 505', 'TOC 507'];
const ESTADOS_EQUIPO = [
  { value: 'operativo', label: '🟢 Operativo' },
  { value: 'mantenimiento', label: '🟡 En Mantenimiento' },
  { value: 'reparacion', label: '🟠 En Reparación' },
  { value: 'baja', label: '🔴 Dado de Baja' },
];

const HojaVidaEquipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMantModal, setShowMantModal] = useState(false);
  const [showEquipoModal, setShowEquipoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingMantenimiento, setEditingMantenimiento] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroUso, setFiltroUso] = useState('todos');
  const [ordenarPor, setOrdenarPor] = useState('nombre');
  const [isEditingEquipo, setIsEditingEquipo] = useState(false);
  
  const [formData, setFormData] = useState({
    tipo: 'preventivo',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    tecnico: '',
    costo: 0,
    observaciones: ''
  });

  const [equipoFormData, setEquipoFormData] = useState({
    nombre: '',
    marca: '',
    modelo: '',
    serial: '',
    ubicacion: 'TOC 501',
    cantidad: 1,
    minimo: 1,
    estado: 'operativo',
    fecha_compra: '',
    proveedor: '',
    descripcion: ''
  });

  useEffect(() => {
    cargarEquipos();
  }, []);

  const cargarEquipos = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('❌ No hay sesión activa');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://127.0.0.1:8000/api/reporte-equipos/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Equipos cargados:', data);
        setEquipos(data);
      } else {
        toast.error('❌ Error al cargar los equipos');
      }
    } catch (err) {
      console.error('Error cargando equipos:', err);
      toast.error('❌ Error al cargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  const cargarMantenimientos = async (equipoId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/mantenimientos-equipo/?equipo=${equipoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMantenimientos(data);
      } else {
        toast.error('❌ Error al cargar el historial');
      }
    } catch (err) {
      console.error('Error cargando mantenimientos:', err);
      toast.error('❌ Error al cargar el historial');
    }
  };

  // ====== CRUD - CREAR EQUIPO ======
const crearEquipo = async () => {
    if (!equipoFormData.nombre.trim()) {
        toast.warning('⚠️ El nombre del equipo es obligatorio');
        return;
    }

    try {
        const token = localStorage.getItem('access_token');
        
        // ✅ OBTENER EL ID DE LA CATEGORÍA "Equipos de Laboratorio"
        // Si no existe, crearla automáticamente
        const categoriasResponse = await fetch('http://127.0.0.1:8000/api/categorias/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const categorias = await categoriasResponse.json();
        
        // Buscar o crear categoría "Equipos de Laboratorio"
        let categoriaId = 1; // Valor por defecto
        const categoriaEquipos = categorias.find(c => c.nombre === 'Equipos de Laboratorio');
        
        if (categoriaEquipos) {
            categoriaId = categoriaEquipos.id;
        } else {
            // Crear categoría si no existe
            const createCatResponse = await fetch('http://127.0.0.1:8000/api/categorias/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nombre: 'Equipos de Laboratorio' })
            });
            const newCat = await createCatResponse.json();
            categoriaId = newCat.id;
        }
        
        const response = await fetch('http://127.0.0.1:8000/api/productos/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nombre: equipoFormData.nombre,
                tipo: 'equipo',
                cantidad: parseInt(equipoFormData.cantidad) || 1,
                minimo: parseInt(equipoFormData.minimo) || 1,
                ubicacion: equipoFormData.ubicacion,
                unidad: 'unidad',
                marca: equipoFormData.marca || '',
                modelo: equipoFormData.modelo || '',
                serial: equipoFormData.serial || '',
                estado: equipoFormData.estado || 'operativo',
                fecha_compra: equipoFormData.fecha_compra || null,
                proveedor: equipoFormData.proveedor || '',
                categoria: categoriaId  // ✅ AGREGAR CATEGORÍA
            })
        });

        if (response.ok) {
            toast.success('✅ Equipo creado correctamente');
            setShowEquipoModal(false);
            setEquipoFormData({
                nombre: '',
                marca: '',
                modelo: '',
                serial: '',
                ubicacion: 'TOC 501',
                cantidad: 1,
                minimo: 1,
                estado: 'operativo',
                fecha_compra: '',
                proveedor: '',
                descripcion: ''
            });
            cargarEquipos();
        } else {
            const error = await response.json();
            console.error('Error:', error);
            toast.error(error.detail || '❌ Error al crear el equipo');
        }
    } catch (err) {
        console.error('Error:', err);
        toast.error('❌ Error al crear el equipo');
    }
};

  // ====== CRUD - ELIMINAR EQUIPO ======
  const eliminarEquipo = async () => {
    if (!selectedEquipo) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/productos/${selectedEquipo.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('✅ Equipo eliminado correctamente');
        setShowDeleteModal(false);
        setSelectedEquipo(null);
        setShowModal(false);
        cargarEquipos();
      } else {
        toast.error('❌ Error al eliminar el equipo');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al eliminar el equipo');
    }
  };

  // ====== CRUD - EDITAR EQUIPO ======
  const editarEquipo = async () => {
    if (!equipoFormData.nombre.trim()) {
      toast.warning('⚠️ El nombre del equipo es obligatorio');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/productos/${selectedEquipo.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: equipoFormData.nombre,
          cantidad: parseInt(equipoFormData.cantidad) || 1,
          minimo: parseInt(equipoFormData.minimo) || 1,
          ubicacion: equipoFormData.ubicacion,
          marca: equipoFormData.marca || '',
          modelo: equipoFormData.modelo || '',
          serial: equipoFormData.serial || '',
          estado: equipoFormData.estado || 'operativo',
          fecha_compra: equipoFormData.fecha_compra || null,
          proveedor: equipoFormData.proveedor || ''
        })
      });

      if (response.ok) {
        toast.success('✅ Equipo actualizado correctamente');
        setShowEquipoModal(false);
        setIsEditingEquipo(false);
        cargarEquipos();
        if (selectedEquipo) {
          cargarMantenimientos(selectedEquipo.id);
        }
      } else {
        toast.error('❌ Error al actualizar el equipo');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al actualizar el equipo');
    }
  };

  // ====== CRUD - ELIMINAR MANTENIMIENTO ======
  const eliminarMantenimiento = async (mantenimientoId) => {
    if (!window.confirm('¿Estás seguro de eliminar este mantenimiento?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/mantenimientos-equipo/${mantenimientoId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('✅ Mantenimiento eliminado correctamente');
        await cargarMantenimientos(selectedEquipo.id);
        await cargarEquipos();
      } else {
        toast.error('❌ Error al eliminar el mantenimiento');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al eliminar el mantenimiento');
    }
  };

  // ====== CRUD - REGISTRAR MANTENIMIENTO ======
  const registrarMantenimiento = async () => {
    if (!formData.descripcion) {
      toast.warning('⚠️ La descripción es obligatoria');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const data = {
        equipo: selectedEquipo.id,
        tipo: formData.tipo,
        fecha: formData.fecha,
        descripcion: formData.descripcion,
        tecnico: formData.tecnico || '',
        costo: parseFloat(formData.costo) || 0,
        observaciones: formData.observaciones || ''
      };

      const url = editingMantenimiento 
        ? `http://127.0.0.1:8000/api/mantenimientos-equipo/${editingMantenimiento.id}/`
        : 'http://127.0.0.1:8000/api/mantenimientos-equipo/';
      
      const method = editingMantenimiento ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success(editingMantenimiento ? '✅ Mantenimiento actualizado' : '✅ Mantenimiento registrado');
        setShowMantModal(false);
        setEditingMantenimiento(null);
        setFormData({
          tipo: 'preventivo',
          fecha: new Date().toISOString().split('T')[0],
          descripcion: '',
          tecnico: '',
          costo: 0,
          observaciones: ''
        });
        await cargarMantenimientos(selectedEquipo.id);
        await cargarEquipos();
      } else {
        toast.error('❌ Error al guardar el mantenimiento');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al guardar el mantenimiento');
    }
  };

  // ====== FUNCIONES DE FILTRADO ======
  const getNivelUso = (mantenimientos) => {
    const total = mantenimientos || 0;
    if (total > 5) return 'alto';
    if (total >= 3) return 'medio';
    return 'bajo';
  };

  const getColorPorNivel = (nivel) => {
    switch(nivel) {
      case 'alto': return COLORS.ALTO;
      case 'medio': return COLORS.MEDIO;
      default: return COLORS.BAJO;
    }
  };

  const getLabelPorNivel = (nivel) => {
    switch(nivel) {
      case 'alto': return '🔴 Alto uso';
      case 'medio': return '🟡 Medio uso';
      default: return '🟢 Bajo uso';
    }
  };

  const getEstadoLabel = (estado) => {
    const estados = {
      'operativo': '🟢 Operativo',
      'mantenimiento': '🟡 En Mantenimiento',
      'reparacion': '🟠 En Reparación',
      'baja': '🔴 Dado de Baja',
    };
    return estados[estado] || estado;
  };

  const verDetalle = async (equipo) => {
    setSelectedEquipo(equipo);
    setEquipoFormData({
      nombre: equipo.nombre || '',
      marca: equipo.marca || '',
      modelo: equipo.modelo || '',
      serial: equipo.serial || '',
      ubicacion: equipo.ubicacion || 'TOC 501',
      cantidad: equipo.cantidad || 1,
      minimo: equipo.minimo || 1,
      estado: equipo.estado || 'operativo',
      fecha_compra: equipo.fecha_compra || '',
      proveedor: equipo.proveedor || '',
      descripcion: ''
    });
    await cargarMantenimientos(equipo.id);
    setShowModal(true);
  };

  const abrirModalEquipo = (equipo = null) => {
    if (equipo) {
      setIsEditingEquipo(true);
      setSelectedEquipo(equipo);
      setEquipoFormData({
        nombre: equipo.nombre || '',
        marca: equipo.marca || '',
        modelo: equipo.modelo || '',
        serial: equipo.serial || '',
        ubicacion: equipo.ubicacion || 'TOC 501',
        cantidad: equipo.cantidad || 1,
        minimo: equipo.minimo || 1,
        estado: equipo.estado || 'operativo',
        fecha_compra: equipo.fecha_compra || '',
        proveedor: equipo.proveedor || '',
        descripcion: ''
      });
    } else {
      setIsEditingEquipo(false);
      setSelectedEquipo(null);
      setEquipoFormData({
        nombre: '',
        marca: '',
        modelo: '',
        serial: '',
        ubicacion: 'TOC 501',
        cantidad: 1,
        minimo: 1,
        estado: 'operativo',
        fecha_compra: '',
        proveedor: '',
        descripcion: ''
      });
    }
    setShowEquipoModal(true);
  };

  const abrirModalMantenimiento = (mantenimiento = null) => {
    if (mantenimiento) {
      setEditingMantenimiento(mantenimiento);
      setFormData({
        tipo: mantenimiento.tipo || 'preventivo',
        fecha: mantenimiento.fecha || new Date().toISOString().split('T')[0],
        descripcion: mantenimiento.descripcion || '',
        tecnico: mantenimiento.tecnico || '',
        costo: mantenimiento.costo || 0,
        observaciones: mantenimiento.observaciones || ''
      });
    } else {
      setEditingMantenimiento(null);
      setFormData({
        tipo: 'preventivo',
        fecha: new Date().toISOString().split('T')[0],
        descripcion: '',
        tecnico: '',
        costo: 0,
        observaciones: ''
      });
    }
    setShowMantModal(true);
  };

  // ====== DATOS FILTRADOS ======
  const equiposFiltrados = useMemo(() => {
    let filtered = [...equipos];

    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.marca && e.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.serial && e.serial.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filtroUso !== 'todos') {
      filtered = filtered.filter(e => {
        const nivel = getNivelUso(e.total_mantenimientos);
        return nivel === filtroUso;
      });
    }

    if (ordenarPor === 'nombre') {
      filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (ordenarPor === 'mantenimientos') {
      filtered.sort((a, b) => (b.total_mantenimientos || 0) - (a.total_mantenimientos || 0));
    } else if (ordenarPor === 'uso') {
      const orden = { alto: 0, medio: 1, bajo: 2 };
      filtered.sort((a, b) => {
        const nivelA = getNivelUso(a.total_mantenimientos);
        const nivelB = getNivelUso(b.total_mantenimientos);
        return orden[nivelA] - orden[nivelB];
      });
    }

    return filtered;
  }, [equipos, searchTerm, filtroUso, ordenarPor]);

  // ====== DATOS PARA GRÁFICAS ======
  const datosGrafica = equiposFiltrados.map(e => ({
    nombre: e.nombre || 'Sin nombre',
    mantenimientos: e.total_mantenimientos || 0,
    nivel: getNivelUso(e.total_mantenimientos),
    color: getColorPorNivel(getNivelUso(e.total_mantenimientos))
  }));

  const totalEquipos = equipos.length;
  const equiposFiltradosCount = equiposFiltrados.length;
  const equiposConMantenimiento = equipos.filter(e => (e.total_mantenimientos || 0) > 0).length;
  const totalMantenimientos = equipos.reduce((sum, e) => sum + (e.total_mantenimientos || 0), 0);

  const datosPieNivel = [
    { name: '🟢 Bajo uso', value: equipos.filter(e => getNivelUso(e.total_mantenimientos) === 'bajo').length },
    { name: '🟡 Medio uso', value: equipos.filter(e => getNivelUso(e.total_mantenimientos) === 'medio').length },
    { name: '🔴 Alto uso', value: equipos.filter(e => getNivelUso(e.total_mantenimientos) === 'alto').length }
  ].filter(d => d.value > 0);

  const PIE_COLORS = [COLORS.BAJO, COLORS.MEDIO, COLORS.ALTO];

  // ====== OBTENER TIPO DE MANTENIMIENTO ======
  const getTipoInfo = (tipo) => {
    const tipos = {
      'preventivo': { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Preventivo' },
      'correctivo': { icon: <Wrench className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Correctivo' },
      'calibracion': { icon: <Clock className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Calibración' },
      'predictivo': { icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Predictivo' },
    };
    return tipos[tipo] || tipos['preventivo'];
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-stone-500">Cargando equipos...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ToastContainer />
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* ====== ENCABEZADO ====== */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <Wrench className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest">
                  SIGIRL · MANTENIMIENTO
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-mono text-stone-700">
                Hoja de Vida de Equipos
              </h1>
              <p className="text-sm text-stone-500 mt-1">
                Historial de mantenimientos y estado de equipos de laboratorio
              </p>
            </div>
            <button
              onClick={() => abrirModalEquipo()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              Nuevo Equipo
            </button>
          </div>
        </motion.div>

        {/* ====== FILTROS Y BÚSQUEDA ====== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, marca o serial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-stone-400" />
              <select
                value={filtroUso}
                onChange={(e) => setFiltroUso(e.target.value)}
                className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white min-w-[200px]"
              >
                {NIVELES_USO.map(n => (
                  <option key={n.value} value={n.value}>{n.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">Ordenar:</span>
              <select
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value)}
                className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white min-w-[150px]"
              >
                <option value="nombre">Nombre (A-Z)</option>
                <option value="mantenimientos">Más mantenimientos</option>
                <option value="uso">Nivel de uso</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-stone-100">
            <span className="text-xs text-stone-500">
              Mostrando <strong className="text-stone-700">{equiposFiltradosCount}</strong> de <strong className="text-stone-700">{totalEquipos}</strong> equipos
            </span>
            {filtroUso !== 'todos' && (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                {NIVELES_USO.find(n => n.value === filtroUso)?.label}
              </span>
            )}
            {searchTerm && (
              <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                🔍 "{searchTerm}"
              </span>
            )}
          </div>
        </motion.div>

        {/* ====== TARJETAS DE RESUMEN ====== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-emerald-600">{totalEquipos}</div>
            <div className="text-xs text-stone-500 font-medium uppercase tracking-wider">Total Equipos</div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-blue-500">{equiposConMantenimiento}</div>
            <div className="text-xs text-stone-500 font-medium uppercase tracking-wider">Con Mantenimiento</div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-amber-500">{totalMantenimientos}</div>
            <div className="text-xs text-stone-500 font-medium uppercase tracking-wider">Total Mantenimientos</div>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-stone-600">
              {totalEquipos > 0 ? Math.round((equiposConMantenimiento / totalEquipos) * 100) : 0}%
            </div>
            <div className="text-xs text-stone-500 font-medium uppercase tracking-wider">Cobertura</div>
          </div>
        </motion.div>

        {/* ====== GRÁFICAS ====== */}
        {equiposFiltrados.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
          >
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Mantenimientos por Equipo
                <span className="text-xs font-normal text-stone-400 ml-2">
                  ({equiposFiltrados.length} equipos)
                </span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datosGrafica} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="nombre" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70} 
                    interval={0}
                    tick={{ fontSize: 9, fill: '#64748b' }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip 
                    formatter={(value) => [`${value} mantenimientos`, 'Cantidad']}
                    labelFormatter={(label) => `Equipo: ${label}`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar 
                    dataKey="mantenimientos" 
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  >
                    {datosGrafica.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS.BAJO} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.BAJO }}></span>
                  Bajo uso (&lt;3)
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.MEDIO }}></span>
                  Medio uso (3-5)
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.ALTO }}></span>
                  Alto uso (&gt;5)
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
                <span className="text-xl">🧩</span>
                Distribución por Nivel de Uso
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={datosPieNivel}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => 
                      percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {datosPieNivel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} equipos`, 'Cantidad']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* ====== TABLA DE EQUIPOS ====== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Equipo</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Marca / Modelo</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Serial</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Total Mant.</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {equiposFiltrados.length > 0 ? (
                  equiposFiltrados.map((e, index) => {
                    const nivel = getNivelUso(e.total_mantenimientos);
                    const color = getColorPorNivel(nivel);
                    return (
                      <motion.tr 
                        key={e.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-emerald-50/40 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-stone-700">{e.nombre}</td>
                        <td className="px-4 py-3 text-sm text-stone-600">
                          {e.marca || '-'} / {e.modelo || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-stone-600">
                          {e.serial || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            e.estado === 'operativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            e.estado === 'mantenimiento' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            e.estado === 'reparacion' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              e.estado === 'operativo' ? 'bg-emerald-500' :
                              e.estado === 'mantenimiento' ? 'bg-amber-500' :
                              e.estado === 'reparacion' ? 'bg-orange-500' :
                              'bg-rose-500'
                            }`}></span>
                            {getEstadoLabel(e.estado)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            (e.total_mantenimientos || 0) > 0 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {(e.total_mantenimientos || 0)} mantenimientos
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => verDetalle(e)}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700 transition-all font-medium shadow-sm hover:shadow-md"
                              title="Ver detalle completo"
                            >
                              Ver Detalle
                            </button>
                            <button
                              onClick={() => abrirModalEquipo(e)}
                              className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar equipo"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedEquipo(e);
                                setShowDeleteModal(true);
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar equipo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-stone-400">
                      <Search className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                      <p className="text-sm">No se encontraron equipos con los filtros seleccionados</p>
                      <button 
                        onClick={() => { setSearchTerm(''); setFiltroUso('todos'); }}
                        className="mt-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      >
                        Limpiar filtros
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* ====== MODAL DE DETALLE ====== */}
      {showModal && selectedEquipo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-stone-200 p-4 sm:p-6 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-600" />
                  Hoja de Vida: {selectedEquipo.nombre}
                </h2>
                <p className="text-sm text-stone-500 mt-1">Información y historial de mantenimientos</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              {/* Información del equipo - Detallada */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Marca</p>
                  <p className="font-medium text-stone-700 text-sm">{selectedEquipo.marca || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Modelo</p>
                  <p className="font-medium text-stone-700 text-sm">{selectedEquipo.modelo || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Serial</p>
                  <p className="font-mono text-stone-700 text-sm">{selectedEquipo.serial || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Ubicación</p>
                  <p className="font-medium text-stone-700 text-sm">{selectedEquipo.ubicacion || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Stock</p>
                  <p className="font-medium text-stone-700 text-sm">{selectedEquipo.cantidad} unidades</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Proveedor</p>
                  <p className="font-medium text-stone-700 text-sm">{selectedEquipo.proveedor || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Fecha Compra</p>
                  <p className="font-medium text-stone-700 text-sm">{selectedEquipo.fecha_compra || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Estado</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    selectedEquipo.estado === 'operativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    selectedEquipo.estado === 'mantenimiento' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    selectedEquipo.estado === 'reparacion' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedEquipo.estado === 'operativo' ? 'bg-emerald-500' :
                      selectedEquipo.estado === 'mantenimiento' ? 'bg-amber-500' :
                      selectedEquipo.estado === 'reparacion' ? 'bg-orange-500' :
                      'bg-rose-500'
                    }`}></span>
                    {getEstadoLabel(selectedEquipo.estado)}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Total Mantenimientos</p>
                  <p className="font-medium text-stone-700 text-sm">{selectedEquipo.total_mantenimientos}</p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Historial de Mantenimientos
                </h3>
                <button
                  onClick={() => abrirModalMantenimiento()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 transition-all font-medium shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Registrar
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="min-w-full">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Descripción</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Técnico</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Costo</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {mantenimientos.length > 0 ? (
                      mantenimientos.map((m) => {
                        const tipoInfo = getTipoInfo(m.tipo);
                        return (
                          <tr key={m.id} className="hover:bg-stone-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-stone-600">{m.fecha}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${tipoInfo.color}`}>
                                {tipoInfo.icon}
                                {tipoInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-stone-600 max-w-[200px] truncate">{m.descripcion}</td>
                            <td className="px-4 py-3 text-sm text-stone-600">{m.tecnico || '-'}</td>
                            <td className="px-4 py-3 text-sm text-stone-600 font-medium">
                              {m.costo ? `$${new Intl.NumberFormat('es-CO').format(m.costo)}` : '-'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => abrirModalMantenimiento(m)}
                                  className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar mantenimiento"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => eliminarMantenimiento(m.id)}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Eliminar mantenimiento"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-stone-400">
                          <Calendar className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                          <p className="text-sm">No hay mantenimientos registrados</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ====== MODAL EQUIPO (CREAR/EDITAR) ====== */}
      {showEquipoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  {isEditingEquipo ? <Edit className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-emerald-600" />}
                  {isEditingEquipo ? 'Editar Equipo' : 'Nuevo Equipo'}
                </h3>
                <button 
                  onClick={() => setShowEquipoModal(false)} 
                  className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wider">Nombre *</label>
                    <input
                      type="text"
                      value={equipoFormData.nombre}
                      onChange={(e) => setEquipoFormData({...equipoFormData, nombre: e.target.value})}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                      placeholder="Nombre del equipo"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wider">Serial</label>
                    <input
                      type="text"
                      value={equipoFormData.serial}
                      onChange={(e) => setEquipoFormData({...equipoFormData, serial: e.target.value})}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                      placeholder="Número de serie"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wider">Marca</label>
                    <input
                      type="text"
                      value={equipoFormData.marca}
                      onChange={(e) => setEquipoFormData({...equipoFormData, marca: e.target.value})}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                      placeholder="Marca"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wider">Modelo</label>
                    <input
                      type="text"
                      value={equipoFormData.modelo}
                      onChange={(e) => setEquipoFormData({...equipoFormData, modelo: e.target.value})}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                      placeholder="Modelo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wider">Ubicación</label>
                    <select
                      value={equipoFormData.ubicacion}
                      onChange={(e) => setEquipoFormData({...equipoFormData, ubicacion: e.target.value})}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    >
                      {AMBIENTES.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wider">Estado</label>
                    <select
                      value={equipoFormData.estado}
                      onChange={(e) => setEquipoFormData({...equipoFormData, estado: e.target.value})}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    >
                      {ESTADOS_EQUIPO.map(e => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wider">Cantidad</label>
                    <input
                      type="number"
                      value={equipoFormData.cantidad}
                      onChange={(e) => setEquipoFormData({...equipoFormData, cantidad: parseInt(e.target.value) || 1})}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wider">Stock Mínimo</label>
                    <input
                      type="number"
                      value={equipoFormData.minimo}
                      onChange={(e) => setEquipoFormData({...equipoFormData, minimo: parseInt(e.target.value) || 1})}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wider">Fecha Compra</label>
                    <input
                      type="date"
                      value={equipoFormData.fecha_compra}
                      onChange={(e) => setEquipoFormData({...equipoFormData, fecha_compra: e.target.value})}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wider">Proveedor</label>
                    <input
                      type="text"
                      value={equipoFormData.proveedor}
                      onChange={(e) => setEquipoFormData({...equipoFormData, proveedor: e.target.value})}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                      placeholder="Nombre del proveedor"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEquipoModal(false)}
                  className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-all text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={isEditingEquipo ? editarEquipo : crearEquipo}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                >
                  {isEditingEquipo ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ====== MODAL MANTENIMIENTO (REGISTRAR/EDITAR) ====== */}
      {showMantModal && selectedEquipo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                  {editingMantenimiento ? <Edit className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-emerald-600" />}
                  {editingMantenimiento ? 'Editar Mantenimiento' : 'Registrar Mantenimiento'}
                </h3>
                <button 
                  onClick={() => { setShowMantModal(false); setEditingMantenimiento(null); }} 
                  className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>
              <p className="text-sm text-stone-500 mb-4">
                Equipo: <span className="font-semibold text-stone-700">{selectedEquipo.nombre}</span>
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wider">Tipo *</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  >
                    <option value="preventivo">Preventivo</option>
                    <option value="correctivo">Correctivo</option>
                    <option value="calibracion">Calibración</option>
                    <option value="predictivo">Predictivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wider">Fecha *</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wider">Descripción *</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    rows="3"
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="Describa el mantenimiento realizado..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wider">Técnico</label>
                  <input
                    type="text"
                    value={formData.tecnico}
                    onChange={(e) => setFormData({...formData, tecnico: e.target.value})}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="Nombre del técnico"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wider">Costo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costo}
                    onChange={(e) => setFormData({...formData, costo: parseFloat(e.target.value) || 0})}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1 uppercase tracking-wider">Observaciones</label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    rows="2"
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowMantModal(false); setEditingMantenimiento(null); }}
                  className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-all text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={registrarMantenimiento}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                >
                  {editingMantenimiento ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ====== MODAL ELIMINAR ====== */}
      {showDeleteModal && selectedEquipo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">¿Eliminar equipo?</h3>
              <p className="text-sm text-stone-500 mb-6">
                ¿Estás seguro de eliminar el equipo <strong className="text-stone-700">{selectedEquipo.nombre}</strong>?<br />
                Esta acción eliminará también todos sus mantenimientos.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-all text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarEquipo}
                  className="flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default HojaVidaEquipos;