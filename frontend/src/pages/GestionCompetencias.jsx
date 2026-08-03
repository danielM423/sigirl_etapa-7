import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  Plus, Pencil, Trash2, Search, X, Check, 
  BookOpen, Target, FlaskConical, 
  Clock, Package, Eye
} from 'lucide-react';

const GestionAcademica = () => {
  // ============================================================
  // ESTADOS GENERALES
  // ============================================================
  const [activeTab, setActiveTab] = useState('programas');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ============================================================
  // PROGRAMAS
  // ============================================================
  const [programas, setProgramas] = useState([]);
  const [showModalPrograma, setShowModalPrograma] = useState(false);
  const [editingPrograma, setEditingPrograma] = useState(null);
  const [formPrograma, setFormPrograma] = useState({
    codigo: '',
    nombre: '',
    version: '1',
    descripcion: '',
    activo: true
  });

  // ============================================================
  // COMPETENCIAS
  // ============================================================
  const [competencias, setCompetencias] = useState([]);
  const [showModalCompetencia, setShowModalCompetencia] = useState(false);
  const [editingCompetencia, setEditingCompetencia] = useState(null);
  const [formCompetencia, setFormCompetencia] = useState({
    programa: '',
    codigo: '',
    nombre: '',
    horas_estimadas: 0,
    descripcion: '',
    activo: true
  });

  // ============================================================
  // PRÁCTICAS
  // ============================================================
  const [practicas, setPracticas] = useState([]);
  const [inventarioReactivos, setInventarioReactivos] = useState([]);
  const [inventarioEquipos, setInventarioEquipos] = useState([]);
  const [cargandoInventario, setCargandoInventario] = useState(false);
  const [filtroReactivo, setFiltroReactivo] = useState('');
  const [filtroEquipo, setFiltroEquipo] = useState('');
  
  // Estado para el modal de detalle
  const [showDetallePractica, setShowDetallePractica] = useState(false);
  const [practicaSeleccionada, setPracticaSeleccionada] = useState(null);
  
  const [unidades] = useState([
    { id: 1, nombre: 'Mililitro', simbolo: 'ml' },
    { id: 2, nombre: 'Gramo', simbolo: 'g' },
    { id: 3, nombre: 'Unidad', simbolo: 'u' },
    { id: 4, nombre: 'Litro', simbolo: 'L' }
  ]);
  
  const [showModalPractica, setShowModalPractica] = useState(false);
  const [editingPractica, setEditingPractica] = useState(null);
  const [formPractica, setFormPractica] = useState({
    competencia: '',
    nombre: '',
    ficha: '',
    fecha: new Date().toISOString().split('T')[0],
    grupos_trabajo: 1,
    instructor: '',
    estado: 'pendiente',
    requiere_doble_aprobacion: false,
    observaciones: '',
    reactivos: [],
    equipos: []
  });

  const [nuevoReactivo, setNuevoReactivo] = useState({
    id: '',
    nombre: '',
    cantidad: 1,
    unidad: '',
    es_sensible: false
  });

  const [nuevoEquipo, setNuevoEquipo] = useState({
    id: '',
    nombre: '',
    cantidad: 1,
    tiempo_uso: 30
  });

  // ============================================================
  // CARGAR DATOS
  // ============================================================
  useEffect(() => {
    cargarDatosBasicos();
  }, []);

  const cargarDatosBasicos = async () => {
    setLoading(true);
    setCargandoInventario(true);
    try {
      const [progRes, compRes, pracRes] = await Promise.all([
        api.get('programas/'),
        api.get('competencias/'),
        api.get('practicas/')
      ]);
      setProgramas(progRes.data || []);
      setCompetencias(compRes.data || []);
      setPracticas(pracRes.data || []);
      
      // Cargar inventario
      try {
        const [reactRes, equipRes] = await Promise.all([
          api.get('reactivos/'),
          api.get('equipos/')
        ]);
        setInventarioReactivos(reactRes.data || []);
        setInventarioEquipos(equipRes.data || []);
      } catch (e) {
        console.warn('Error cargando inventario:', e);
        setInventarioReactivos([]);
        setInventarioEquipos([]);
      }
      
    } catch (e) {
      console.warn('Error cargando datos:', e);
    } finally {
      setLoading(false);
      setCargandoInventario(false);
    }
  };

  // ============================================================
  // CRUD PROGRAMAS
  // ============================================================
  const guardarPrograma = async () => {
    if (!formPrograma.codigo || !formPrograma.nombre) {
      alert('Código y nombre son obligatorios');
      return;
    }
    try {
      if (editingPrograma) {
        await api.patch(`programas/${editingPrograma}/`, formPrograma);
        alert('Programa actualizado');
      } else {
        await api.post('programas/', formPrograma);
        alert('Programa creado');
      }
      setShowModalPrograma(false);
      setEditingPrograma(null);
      setFormPrograma({ codigo: '', nombre: '', version: '1', descripcion: '', activo: true });
      cargarDatosBasicos();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al guardar el programa');
    }
  };

  const eliminarPrograma = async (id) => {
    if (window.confirm('¿Eliminar este programa?')) {
      try {
        await api.delete(`programas/${id}/`);
        alert('Programa eliminado');
        cargarDatosBasicos();
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  // ============================================================
  // CRUD COMPETENCIAS
  // ============================================================
  const guardarCompetencia = async () => {
    if (!formCompetencia.programa || !formCompetencia.codigo || !formCompetencia.nombre) {
      alert('Programa, código y nombre son obligatorios');
      return;
    }
    try {
      const data = { ...formCompetencia, programa: parseInt(formCompetencia.programa) };
      if (editingCompetencia) {
        await api.patch(`competencias/${editingCompetencia}/`, data);
        alert('Competencia actualizada');
      } else {
        await api.post('competencias/', data);
        alert('Competencia creada');
      }
      setShowModalCompetencia(false);
      setEditingCompetencia(null);
      setFormCompetencia({ programa: '', codigo: '', nombre: '', horas_estimadas: 0, descripcion: '', activo: true });
      cargarDatosBasicos();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al guardar la competencia');
    }
  };

  const eliminarCompetencia = async (id) => {
    if (window.confirm('¿Eliminar esta competencia?')) {
      try {
        await api.delete(`competencias/${id}/`);
        alert('Competencia eliminada');
        cargarDatosBasicos();
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  // ============================================================
  // CRUD PRÁCTICAS - REACTIVOS
  // ============================================================
  const agregarReactivo = () => {
    if (!nuevoReactivo.id && !nuevoReactivo.nombre) {
      alert('Selecciona un reactivo del inventario o escribe el nombre');
      return;
    }
    if (!nuevoReactivo.cantidad || nuevoReactivo.cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }
    
    const reactivoInventario = inventarioReactivos.find(r => r.id === parseInt(nuevoReactivo.id));
    
    setFormPractica({
      ...formPractica,
      reactivos: [
        ...formPractica.reactivos,
        {
          id: reactivoInventario?.id || null,
          nombre: reactivoInventario?.nombre || nuevoReactivo.nombre,
          cantidad: parseFloat(nuevoReactivo.cantidad),
          unidad: parseInt(nuevoReactivo.unidad) || 1,
          es_sensible: reactivoInventario?.es_sensible || nuevoReactivo.es_sensible,
          stock_actual: reactivoInventario?.cantidad || 0,
          es_del_inventario: !!reactivoInventario
        }
      ]
    });
    setNuevoReactivo({ id: '', nombre: '', cantidad: 1, unidad: '', es_sensible: false });
    setFiltroReactivo('');
  };

  const eliminarReactivo = (index) => {
    const nuevos = [...formPractica.reactivos];
    nuevos.splice(index, 1);
    setFormPractica({ ...formPractica, reactivos: nuevos });
  };

  // ============================================================
  // CRUD PRÁCTICAS - EQUIPOS
  // ============================================================
  const agregarEquipo = () => {
    if (!nuevoEquipo.id && !nuevoEquipo.nombre) {
      alert('Selecciona un equipo del inventario o escribe el nombre');
      return;
    }
    if (!nuevoEquipo.cantidad || nuevoEquipo.cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }
    
    const equipoInventario = inventarioEquipos.find(e => e.id === parseInt(nuevoEquipo.id));
    
    setFormPractica({
      ...formPractica,
      equipos: [
        ...(formPractica.equipos || []),
        {
          id: equipoInventario?.id || null,
          nombre: equipoInventario?.nombre || nuevoEquipo.nombre,
          cantidad: parseInt(nuevoEquipo.cantidad),
          tiempo_uso: parseInt(nuevoEquipo.tiempo_uso) || 30,
          stock_actual: equipoInventario?.cantidad || 0,
          es_del_inventario: !!equipoInventario
        }
      ]
    });
    setNuevoEquipo({ id: '', nombre: '', cantidad: 1, tiempo_uso: 30 });
    setFiltroEquipo('');
  };

  const eliminarEquipo = (index) => {
    const nuevos = [...(formPractica.equipos || [])];
    nuevos.splice(index, 1);
    setFormPractica({ ...formPractica, equipos: nuevos });
  };

  // ============================================================
  // CRUD PRÁCTICAS - GUARDAR
  // ============================================================
  const guardarPractica = async () => {
    if (!formPractica.competencia || !formPractica.nombre) {
      alert('Competencia y nombre son obligatorios');
      return;
    }
    try {
      let ambienteId = 1;
      let franjaId = 1;
      try {
        const ambientesRes = await api.get('ambientes/');
        if (ambientesRes.data && ambientesRes.data.length > 0) {
          ambienteId = ambientesRes.data[0].id;
        }
        const franjasRes = await api.get('franjas-horarias/');
        if (franjasRes.data && franjasRes.data.length > 0) {
          franjaId = franjasRes.data[0].id;
        }
      } catch (e) { console.warn('Error obteniendo ambiente/franja:', e); }

      // ✅ PREPARAR DATOS DE REACTIVOS PARA ENVIAR
      const reactivosData = formPractica.reactivos.map(r => ({
        reactivo: r.id ? parseInt(r.id) : null,
        cantidad: parseFloat(r.cantidad),
        unidad: parseInt(r.unidad) || 1,
        es_sensible: r.es_sensible || false
      })).filter(r => r.reactivo !== null); // Filtrar los que no tienen ID

      // ✅ PREPARAR DATOS DE EQUIPOS PARA ENVIAR
      const equiposData = (formPractica.equipos || []).map(e => ({
        equipo: e.id ? parseInt(e.id) : null,
        tiempo_uso_min: parseInt(e.tiempo_uso) || 30,
        desgaste_estimado: 0,
        mantenimiento_requerido: false
      })).filter(e => e.equipo !== null); // Filtrar los que no tienen ID

      const data = {
        competencia: parseInt(formPractica.competencia),
        nombre: formPractica.nombre,
        ficha: formPractica.ficha || 'FICHA-' + Date.now(),
        fecha: formPractica.fecha || new Date().toISOString().split('T')[0],
        grupos_trabajo: parseInt(formPractica.grupos_trabajo) || 1,
        estado: formPractica.estado || 'pendiente',
        observaciones: formPractica.observaciones || '',
        instructor: 1,
        ambiente: ambienteId,
        franja: franjaId,
        hora_inicio: '06:00:00',
        hora_fin: '12:00:00',
        creado_por: 'admin',
        reactivos: reactivosData,
        equipos: equiposData
      };

      console.log('📤 Enviando datos al backend:', JSON.stringify(data, null, 2));

      let response;
      if (editingPractica) {
        response = await api.patch(`practicas/${editingPractica}/`, data);
        alert('Práctica actualizada');
      } else {
        response = await api.post('practicas/', data);
        alert('Práctica creada');
      }
      console.log('✅ Respuesta del backend:', response.data);
      
      setShowModalPractica(false);
      setEditingPractica(null);
      setFormPractica({
        competencia: '',
        nombre: '',
        ficha: '',
        fecha: new Date().toISOString().split('T')[0],
        grupos_trabajo: 1,
        instructor: '',
        estado: 'pendiente',
        requiere_doble_aprobacion: false,
        observaciones: '',
        reactivos: [],
        equipos: []
      });
      cargarDatosBasicos();
    } catch (err) {
      console.error('❌ Error guardando práctica:', err);
      if (err.response?.data) {
        alert(`Error: ${JSON.stringify(err.response.data)}`);
      } else {
        alert('Error al guardar la práctica');
      }
    }
  };

  const eliminarPractica = async (id) => {
    if (window.confirm('¿Eliminar esta práctica?')) {
      try {
        await api.delete(`practicas/${id}/`);
        alert('Práctica eliminada');
        cargarDatosBasicos();
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  // ============================================================
  // FILTRADO
  // ============================================================
  const getEstadoColor = (estado) => {
    const colores = {
      'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'aprobacion': 'bg-blue-100 text-blue-800 border-blue-200',
      'aprobada': 'bg-green-100 text-green-800 border-green-200',
      'rechazada': 'bg-red-100 text-red-800 border-red-200',
      'cancelada': 'bg-gray-100 text-gray-800 border-gray-200',
      'finalizada': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      'pendiente': 'Pendiente',
      'aprobacion': 'En aprobación',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada',
      'cancelada': 'Cancelada',
      'finalizada': 'Finalizada'
    };
    return labels[estado] || estado;
  };

  const filteredProgramas = programas.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompetencias = competencias.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPracticas = practicas.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ficha.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============================================================
  // RENDER
  // ============================================================
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Gestión Académica
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Administra programas, competencias y prácticas de formación
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('programas')}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium transition-all duration-200 ${
              activeTab === 'programas'
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BookOpen size={18} />
            Programas
            <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              {programas.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('competencias')}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium transition-all duration-200 ${
              activeTab === 'competencias'
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Target size={18} />
            Competencias
            <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              {competencias.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('practicas')}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-lg font-medium transition-all duration-200 ${
              activeTab === 'practicas'
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FlaskConical size={18} />
            Prácticas
            <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              {practicas.length}
            </span>
          </button>
        </div>

        {/* ============================================================
            TAB: PROGRAMAS
            ============================================================ */}
        {activeTab === 'programas' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar programa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={() => {
                  setEditingPrograma(null);
                  setFormPrograma({ codigo: '', nombre: '', version: '1', descripcion: '', activo: true });
                  setShowModalPrograma(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                <Plus size={18} />
                Nuevo Programa
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Código</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Versión</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProgramas.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                          <div className="flex flex-col items-center">
                            <BookOpen size={40} className="text-gray-300 mb-2" />
                            <p>No hay programas registrados</p>
                            <button
                              onClick={() => {
                                setEditingPrograma(null);
                                setFormPrograma({ codigo: '', nombre: '', version: '1', descripcion: '', activo: true });
                                setShowModalPrograma(true);
                              }}
                              className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              Crear el primero
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProgramas.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded text-sm">
                              {p.codigo}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-800">{p.nombre}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">v{p.version}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              p.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${p.activo ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                              {p.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => { setEditingPrograma(p.id); setFormPrograma(p); setShowModalPrograma(true); }}
                              className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors mr-1"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => eliminarPrograma(p.id)}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB: COMPETENCIAS
            ============================================================ */}
        {activeTab === 'competencias' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar competencia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={() => {
                  setEditingCompetencia(null);
                  setFormCompetencia({ programa: '', codigo: '', nombre: '', horas_estimadas: 0, descripcion: '', activo: true });
                  setShowModalCompetencia(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                <Plus size={18} />
                Nueva Competencia
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Código</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Programa</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Horas</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCompetencias.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                          <div className="flex flex-col items-center">
                            <Target size={40} className="text-gray-300 mb-2" />
                            <p>No hay competencias registradas</p>
                            <button
                              onClick={() => {
                                setEditingCompetencia(null);
                                setFormCompetencia({ programa: '', codigo: '', nombre: '', horas_estimadas: 0, descripcion: '', activo: true });
                                setShowModalCompetencia(true);
                              }}
                              className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              Crear la primera
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCompetencias.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded text-sm">
                              {c.codigo}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-800">{c.nombre}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs">
                              {c.programa_nombre || 'Sin programa'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <Clock size={14} />
                              {c.horas_estimadas}h
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              c.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${c.activo ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                              {c.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => { setEditingCompetencia(c.id); setFormCompetencia(c); setShowModalCompetencia(true); }}
                              className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors mr-1"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => eliminarCompetencia(c.id)}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB: PRÁCTICAS
            ============================================================ */}
        {activeTab === 'practicas' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar práctica..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={() => {
                  setEditingPractica(null);
                  setFormPractica({
                    competencia: '',
                    nombre: '',
                    ficha: '',
                    fecha: new Date().toISOString().split('T')[0],
                    grupos_trabajo: 1,
                    instructor: '',
                    estado: 'pendiente',
                    requiere_doble_aprobacion: false,
                    observaciones: '',
                    reactivos: [],
                    equipos: []
                  });
                  setShowModalPractica(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                <Plus size={18} />
                Nueva Práctica
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ficha</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Competencia</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPracticas.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                          <div className="flex flex-col items-center">
                            <FlaskConical size={40} className="text-gray-300 mb-2" />
                            <p>No hay prácticas registradas</p>
                            <button
                              onClick={() => {
                                setEditingPractica(null);
                                setFormPractica({
                                  competencia: '',
                                  nombre: '',
                                  ficha: '',
                                  fecha: new Date().toISOString().split('T')[0],
                                  grupos_trabajo: 1,
                                  instructor: '',
                                  estado: 'pendiente',
                                  requiere_doble_aprobacion: false,
                                  observaciones: '',
                                  reactivos: [],
                                  equipos: []
                                });
                                setShowModalPractica(true);
                              }}
                              className="mt-2 text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              Crear la primera
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPracticas.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                              {p.ficha}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-800">{p.nombre}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-lg text-xs">
                              {p.competencia_nombre || 'Sin competencia'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(p.estado)}`}>
                              {getEstadoLabel(p.estado)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {/* ✅ BOTÓN VER DETALLE */}
                            <button
                              onClick={() => {
                                setPracticaSeleccionada(p);
                                setShowDetallePractica(true);
                              }}
                              className="text-emerald-600 hover:text-emerald-800 p-1.5 hover:bg-emerald-50 rounded-lg transition-colors mr-1"
                              title="Ver detalle"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => { setEditingPractica(p.id); setFormPractica({ ...p, competencia: p.competencia || '', instructor: p.instructor || '', reactivos: p.reactivos || [], equipos: p.equipos || [] }); setShowModalPractica(true); }}
                              className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition-colors mr-1"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => eliminarPractica(p.id)}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            MODAL: PROGRAMA
            ============================================================ */}
        {showModalPrograma && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingPrograma ? 'Editar Programa' : 'Nuevo Programa'}
                </h2>
                <button onClick={() => setShowModalPrograma(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                  <input
                    type="text"
                    placeholder="Ej: ADSO"
                    value={formPrograma.codigo}
                    onChange={(e) => setFormPrograma({ ...formPrograma, codigo: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    placeholder="Nombre del programa"
                    value={formPrograma.nombre}
                    onChange={(e) => setFormPrograma({ ...formPrograma, nombre: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Versión</label>
                  <input
                    type="text"
                    placeholder="1"
                    value={formPrograma.version}
                    onChange={(e) => setFormPrograma({ ...formPrograma, version: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    placeholder="Descripción del programa..."
                    value={formPrograma.descripcion}
                    onChange={(e) => setFormPrograma({ ...formPrograma, descripcion: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formPrograma.activo}
                    onChange={(e) => setFormPrograma({ ...formPrograma, activo: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Activo</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowModalPrograma(false)}
                  className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarPrograma}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md shadow-emerald-500/25"
                >
                  <Check size={18} />
                  {editingPrograma ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            MODAL: COMPETENCIA
            ============================================================ */}
        {showModalCompetencia && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingCompetencia ? 'Editar Competencia' : 'Nueva Competencia'}
                </h2>
                <button onClick={() => setShowModalCompetencia(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Programa *</label>
                  <select
                    value={formCompetencia.programa}
                    onChange={(e) => setFormCompetencia({ ...formCompetencia, programa: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="">Seleccionar programa...</option>
                    {programas.filter(p => p.activo).map(p => (
                      <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                  <input
                    type="text"
                    placeholder="Ej: BD-001"
                    value={formCompetencia.codigo}
                    onChange={(e) => setFormCompetencia({ ...formCompetencia, codigo: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    placeholder="Nombre de la competencia"
                    value={formCompetencia.nombre}
                    onChange={(e) => setFormCompetencia({ ...formCompetencia, nombre: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horas Estimadas</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="48"
                    value={formCompetencia.horas_estimadas}
                    onChange={(e) => setFormCompetencia({ ...formCompetencia, horas_estimadas: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    placeholder="Descripción de la competencia..."
                    value={formCompetencia.descripcion}
                    onChange={(e) => setFormCompetencia({ ...formCompetencia, descripcion: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formCompetencia.activo}
                    onChange={(e) => setFormCompetencia({ ...formCompetencia, activo: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Activo</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowModalCompetencia(false)}
                  className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarCompetencia}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md shadow-emerald-500/25"
                >
                  <Check size={18} />
                  {editingCompetencia ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            MODAL: PRÁCTICA (CREAR/EDITAR)
            ============================================================ */}
        {showModalPractica && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingPractica ? 'Editar Práctica' : 'Nueva Práctica'}
                </h2>
                <button onClick={() => setShowModalPractica(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Competencia *</label>
                  <select
                    value={formPractica.competencia}
                    onChange={(e) => setFormPractica({ ...formPractica, competencia: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="">Seleccionar competencia...</option>
                    {competencias.filter(c => c.activo).map(c => (
                      <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    placeholder="Nombre de la práctica"
                    value={formPractica.nombre}
                    onChange={(e) => setFormPractica({ ...formPractica, nombre: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ficha</label>
                    <input
                      type="text"
                      placeholder="Número de ficha"
                      value={formPractica.ficha}
                      onChange={(e) => setFormPractica({ ...formPractica, ficha: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={formPractica.fecha}
                      onChange={(e) => setFormPractica({ ...formPractica, fecha: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grupos</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Número de grupos"
                      value={formPractica.grupos_trabajo}
                      onChange={(e) => setFormPractica({ ...formPractica, grupos_trabajo: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      value={formPractica.estado}
                      onChange={(e) => setFormPractica({ ...formPractica, estado: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="aprobacion">En aprobación</option>
                      <option value="aprobada">Aprobada</option>
                      <option value="rechazada">Rechazada</option>
                      <option value="cancelada">Cancelada</option>
                      <option value="finalizada">Finalizada</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructor (opcional)</label>
                  <input
                    type="text"
                    placeholder="Nombre del instructor"
                    value={formPractica.instructor}
                    onChange={(e) => setFormPractica({ ...formPractica, instructor: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    placeholder="Observaciones de la práctica..."
                    value={formPractica.observaciones}
                    onChange={(e) => setFormPractica({ ...formPractica, observaciones: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formPractica.requiere_doble_aprobacion}
                    onChange={(e) => setFormPractica({ ...formPractica, requiere_doble_aprobacion: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Requiere doble aprobación</span>
                </label>

                {/* ============================================================
                    SECCIÓN REACTIVOS
                    ============================================================ */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FlaskConical size={18} className="text-emerald-600" />
                    Reactivos de la práctica
                    <span className="text-xs text-gray-400 font-normal ml-2">
                      ({formPractica.reactivos?.length || 0} agregados)
                    </span>
                  </h3>
                  
                  {formPractica.reactivos && formPractica.reactivos.length > 0 && (
                    <div className="mb-3 space-y-1 max-h-32 overflow-y-auto">
                      {formPractica.reactivos.map((r, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{r.nombre}</span>
                            <span className="text-sm text-gray-500">× {r.cantidad}</span>
                            <span className="text-xs text-gray-400">
                              {unidades.find(u => u.id === r.unidad)?.simbolo || ''}
                            </span>
                            {r.es_sensible && (
                              <span className="text-xs text-red-500 font-medium">🔴 Sensible</span>
                            )}
                            {r.es_del_inventario && (
                              <span className="text-xs text-emerald-500 font-medium">
                                Stock: {r.stock_actual}
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => eliminarReactivo(index)} 
                            className="text-red-500 hover:text-red-700 text-sm p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Buscar reactivo del inventario</label>
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar reactivo..."
                          value={filtroReactivo}
                          onChange={(e) => {
                            setFiltroReactivo(e.target.value);
                            const encontrado = inventarioReactivos.find(r => 
                              r.nombre.toLowerCase().includes(e.target.value.toLowerCase())
                            );
                            if (encontrado) {
                              setNuevoReactivo({
                                ...nuevoReactivo,
                                id: encontrado.id,
                                nombre: encontrado.nombre,
                                es_sensible: encontrado.es_sensible || false
                              });
                            }
                          }}
                          className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          list="reactivos-list"
                        />
                        <datalist id="reactivos-list">
                          {inventarioReactivos.map(r => (
                            <option key={r.id} value={r.nombre} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
                      <input
                        type="number"
                        placeholder="Cantidad"
                        value={nuevoReactivo.cantidad}
                        onChange={(e) => setNuevoReactivo({ ...nuevoReactivo, cantidad: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        min="0.1"
                        step="0.1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Unidad</label>
                      <select
                        value={nuevoReactivo.unidad}
                        onChange={(e) => setNuevoReactivo({ ...nuevoReactivo, unidad: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      >
                        <option value="">Unidad</option>
                        {unidades.map(u => (
                          <option key={u.id} value={u.id}>{u.simbolo}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={nuevoReactivo.es_sensible}
                        onChange={(e) => setNuevoReactivo({ ...nuevoReactivo, es_sensible: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="text-gray-600">Sensible</span>
                    </label>
                    
                    {nuevoReactivo.id && (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        ✅ Del inventario
                      </span>
                    )}
                    
                    <button
                      onClick={agregarReactivo}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-sm transition-colors ml-auto"
                    >
                      Agregar Reactivo
                    </button>
                  </div>
                  
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        const nombreManual = prompt('Escribe el nombre del reactivo (no está en el inventario):');
                        if (nombreManual && nombreManual.trim()) {
                          setNuevoReactivo({
                            ...nuevoReactivo,
                            id: '',
                            nombre: nombreManual.trim(),
                            es_sensible: false
                          });
                          setTimeout(() => {
                            if (nuevoReactivo.cantidad > 0) {
                              agregarReactivo();
                            }
                          }, 100);
                        }
                      }}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      + Agregar reactivo manual (no inventariado)
                    </button>
                  </div>
                </div>

                {/* ============================================================
                    SECCIÓN EQUIPOS
                    ============================================================ */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Package size={18} className="text-blue-600" />
                    Equipos de la práctica
                    <span className="text-xs text-gray-400 font-normal ml-2">
                      ({formPractica.equipos?.length || 0} agregados)
                    </span>
                  </h3>
                  
                  {formPractica.equipos && formPractica.equipos.length > 0 && (
                    <div className="mb-3 space-y-1 max-h-32 overflow-y-auto">
                      {formPractica.equipos.map((e, index) => (
                        <div key={index} className="flex justify-between items-center bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{e.nombre}</span>
                            <span className="text-sm text-gray-500">× {e.cantidad}</span>
                            {e.tiempo_uso && (
                              <span className="text-xs text-gray-400">{e.tiempo_uso} min</span>
                            )}
                            {e.es_del_inventario && (
                              <span className="text-xs text-blue-500 font-medium">
                                Stock: {e.stock_actual}
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => eliminarEquipo(index)} 
                            className="text-red-500 hover:text-red-700 text-sm p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Buscar equipo del inventario</label>
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar equipo..."
                          value={filtroEquipo}
                          onChange={(e) => {
                            setFiltroEquipo(e.target.value);
                            const encontrado = inventarioEquipos.find(eq => 
                              eq.nombre.toLowerCase().includes(e.target.value.toLowerCase())
                            );
                            if (encontrado) {
                              setNuevoEquipo({
                                ...nuevoEquipo,
                                id: encontrado.id,
                                nombre: encontrado.nombre
                              });
                            }
                          }}
                          className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          list="equipos-list"
                        />
                        <datalist id="equipos-list">
                          {inventarioEquipos.map(e => (
                            <option key={e.id} value={e.nombre} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
                      <input
                        type="number"
                        placeholder="Cantidad"
                        value={nuevoEquipo.cantidad}
                        onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, cantidad: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        min="1"
                        step="1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tiempo uso (min)</label>
                      <input
                        type="number"
                        placeholder="Minutos"
                        value={nuevoEquipo.tiempo_uso}
                        onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, tiempo_uso: parseInt(e.target.value) || 30 })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        min="1"
                        step="5"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    {nuevoEquipo.id && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        ✅ Del inventario
                      </span>
                    )}
                    <button
                      onClick={agregarEquipo}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm transition-colors ml-auto"
                    >
                      Agregar Equipo
                    </button>
                  </div>
                  
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        const nombreManual = prompt('Escribe el nombre del equipo (no está en el inventario):');
                        if (nombreManual && nombreManual.trim()) {
                          setNuevoEquipo({
                            ...nuevoEquipo,
                            id: '',
                            nombre: nombreManual.trim()
                          });
                          setTimeout(() => {
                            if (nuevoEquipo.cantidad > 0) {
                              agregarEquipo();
                            }
                          }, 100);
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Agregar equipo manual (no inventariado)
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowModalPractica(false)}
                  className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarPractica}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md shadow-emerald-500/25"
                >
                  <Check size={18} />
                  {editingPractica ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            MODAL: DETALLE DE PRÁCTICA
            ============================================================ */}
        {showDetallePractica && practicaSeleccionada && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FlaskConical size={24} className="text-emerald-600" />
                  Detalle de la Práctica
                </h2>
                <button 
                  onClick={() => {
                    setShowDetallePractica(false);
                    setPracticaSeleccionada(null);
                  }} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Información básica */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                <div>
                  <p className="text-xs text-gray-500">Nombre</p>
                  <p className="font-semibold text-gray-800">{practicaSeleccionada.nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ficha</p>
                  <p className="font-semibold text-gray-800">{practicaSeleccionada.ficha}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Competencia</p>
                  <p className="font-semibold text-gray-800">{practicaSeleccionada.competencia_nombre || 'Sin competencia'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estado</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(practicaSeleccionada.estado)}`}>
                    {getEstadoLabel(practicaSeleccionada.estado)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="font-semibold text-gray-800">{practicaSeleccionada.fecha || 'No definida'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Grupos</p>
                  <p className="font-semibold text-gray-800">{practicaSeleccionada.grupos_trabajo || 1}</p>
                </div>
                {practicaSeleccionada.observaciones && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Observaciones</p>
                    <p className="text-sm text-gray-700">{practicaSeleccionada.observaciones}</p>
                  </div>
                )}
              </div>

              {/* Reactivos */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FlaskConical size={18} className="text-emerald-600" />
                  Reactivos
                  <span className="text-xs text-gray-400 font-normal">
                    ({practicaSeleccionada.reactivos?.length || 0})
                  </span>
                </h3>
                {practicaSeleccionada.reactivos && practicaSeleccionada.reactivos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {practicaSeleccionada.reactivos.map((r, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="font-medium text-gray-800 text-sm">
                          {r.reactivo_nombre || r.nombre || 'Reactivo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Cantidad: {r.cantidad} {r.unidad?.simbolo || ''}
                          {r.es_sensible && ' 🔴 Sensible'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No tiene reactivos asociados</p>
                )}
              </div>

              {/* Equipos */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Package size={18} className="text-blue-600" />
                  Equipos
                  <span className="text-xs text-gray-400 font-normal">
                    ({practicaSeleccionada.equipos?.length || 0})
                  </span>
                </h3>
                {practicaSeleccionada.equipos && practicaSeleccionada.equipos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {practicaSeleccionada.equipos.map((e, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="font-medium text-gray-800 text-sm">
                          {e.equipo_nombre || e.nombre || 'Equipo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Tiempo: {e.tiempo_uso_min || e.tiempo_uso || 0} min
                          {e.mantenimiento_requerido && ' 🔧 Mantenimiento'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No tiene equipos asociados</p>
                )}
              </div>

              {/* Materiales */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Package size={18} className="text-purple-600" />
                  Materiales
                  <span className="text-xs text-gray-400 font-normal">
                    ({practicaSeleccionada.materiales?.length || 0})
                  </span>
                </h3>
                {practicaSeleccionada.materiales && practicaSeleccionada.materiales.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {practicaSeleccionada.materiales.map((m, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="font-medium text-gray-800 text-sm">{m.nombre}</p>
                        <p className="text-xs text-gray-500">
                          Cantidad: {m.cantidad_total || m.cantidad_por_grupo || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No tiene materiales asociados</p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowDetallePractica(false);
                    setPracticaSeleccionada(null);
                  }}
                  className="px-5 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estilos para animaciones */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      ` }} />
    </Layout>
  );
};

export default GestionAcademica;