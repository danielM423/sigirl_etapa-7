import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend
} from 'recharts';
import ConfirmModal from '../components/ConfirmModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Bell, AlertTriangle, CheckCircle, Download, FileSpreadsheet, FileText } from 'lucide-react';

// ============================================================
// COMPONENTE DE NOTIFICACIONES
// ============================================================
const NotificacionesEquipos = ({ equipos }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    generarNotificaciones();
  }, [equipos]);

  const generarNotificaciones = () => {
    const nuevas = [];
    
    equipos.forEach(e => {
      const desgaste = e.desgaste_estimado || 0;
      
      if (desgaste > 70) {
        nuevas.push({
          id: `critico-${e.id}`,
          tipo: 'critico',
          mensaje: `${e.nombre} tiene desgaste del ${desgaste}%`,
          equipo: e.nombre,
          fecha: new Date().toISOString()
        });
      } else if (desgaste > 40) {
        nuevas.push({
          id: `advertencia-${e.id}`,
          tipo: 'advertencia',
          mensaje: `${e.nombre} tiene desgaste del ${desgaste}%`,
          equipo: e.nombre,
          fecha: new Date().toISOString()
        });
      }
      
      if (e.ultimo_mantenimiento) {
        const ultimo = new Date(e.ultimo_mantenimiento);
        const dias = Math.floor((new Date() - ultimo) / (1000 * 60 * 60 * 24));
        if (dias > 30) {
          nuevas.push({
            id: `mantenimiento-${e.id}`,
            tipo: 'info',
            mensaje: `${e.nombre} no recibe mantenimiento desde hace ${dias} días`,
            equipo: e.nombre,
            fecha: new Date().toISOString()
          });
        }
      }
    });
    
    setNotificaciones(nuevas);
  };

  const getIcon = (tipo) => {
    switch(tipo) {
      case 'critico': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'advertencia': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getColor = (tipo) => {
    switch(tipo) {
      case 'critico': return 'bg-red-50 border-red-200';
      case 'advertencia': return 'bg-amber-50 border-amber-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setMostrar(!mostrar)}
        className="relative p-2 hover:bg-stone-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-stone-600" />
        {notificaciones.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notificaciones.length}
          </span>
        )}
      </button>

      {mostrar && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-stone-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-stone-200 font-semibold text-stone-700">
            Notificaciones ({notificaciones.length})
          </div>
          {notificaciones.length === 0 ? (
            <div className="p-4 text-center text-stone-500 text-sm">
              No hay notificaciones
            </div>
          ) : (
            notificaciones.map(n => (
              <div key={n.id} className={`p-3 border-b ${getColor(n.tipo)}`}>
                <div className="flex items-start gap-2">
                  {getIcon(n.tipo)}
                  <div className="flex-1">
                    <p className="text-sm text-stone-700">{n.mensaje}</p>
                    <p className="text-xs text-stone-400 mt-1">
                      {new Date(n.fecha).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// COLORES Y FUNCIONES AUXILIARES
// ============================================================
const getBarColor = (horas) => {
  if (horas > 300) return '#EF4444';
  if (horas > 150) return '#F59E0B';
  return '#1FA971';
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-stone-200">
        <p className="font-bold text-stone-800">{data.nombre}</p>
        <p className="text-sm text-stone-600">
          Horas de uso: <span className="font-bold text-emerald-600">{data.horas}h</span>
        </p>
        <p className="text-sm text-stone-600">
          Mantenimientos: <span className="font-bold text-blue-600">{data.mantenimientos}</span>
        </p>
        <p className="text-sm text-stone-600">
          Desgaste: <span className={`font-bold ${data.desgaste > 50 ? 'text-red-600' : 'text-emerald-600'}`}>
            {data.desgaste}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const HojaVidaEquipos = () => {
  // ✅ TODOS LOS HOOKS AQUÍ
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMantModal, setShowMantModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equipoEliminar, setEquipoEliminar] = useState(null);
  const [showFormEquipo, setShowFormEquipo] = useState(false);
  const [ordenGrafica, setOrdenGrafica] = useState('desc');
  const [filtroUso, setFiltroUso] = useState('todos');

  const [formData, setFormData] = useState({
    tipo: 'preventivo',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    tecnico: '',
    costo: 0,
    observaciones: ''
  });

  const [nuevoEquipo, setNuevoEquipo] = useState({
    nombre: '',
    marca: '',
    modelo: '',
    serie: '',
    responsable: '',
    proveedor: '',
    horas_uso: 0,
    ubicacion: '',
    cantidad: 1
  });

  // ============================================================
  // FUNCIONES
  // ============================================================
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
        
        const equiposConHoras = data.map((equipo, index) => ({
          ...equipo,
          horas_uso: (index * 7 + 15) % 500 + 10,
          desgaste_estimado: (index * 3 + 5) % 100,
          mantenimiento_requerido: index % 3 === 0
        }));
        
        setEquipos(equiposConHoras);
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

  const verDetalle = async (equipo) => {
    setSelectedEquipo(equipo);
    await cargarMantenimientos(equipo.id);
    setShowModal(true);
  };

  const registrarMantenimiento = async () => {
    if (!formData.descripcion) {
      toast.warning('⚠️ La descripción es obligatoria');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('❌ No hay sesión activa');
        return;
      }

      const data = {
        equipo: selectedEquipo.id,
        tipo: formData.tipo,
        fecha: formData.fecha,
        descripcion: formData.descripcion,
        tecnico: formData.tecnico || '',
        costo: parseFloat(formData.costo) || 0,
        observaciones: formData.observaciones || ''
      };

      const response = await fetch('http://127.0.0.1:8000/api/mantenimientos-equipo/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('✅ Mantenimiento registrado correctamente');
        setShowMantModal(false);
        setFormData({
          tipo: 'preventivo',
          fecha: new Date().toISOString().split('T')[0],
          descripcion: '',
          tecnico: '',
          costo: 0,
          observaciones: ''
        });
        cargarMantenimientos(selectedEquipo.id);
        cargarEquipos();
      } else {
        const error = await response.json();
        toast.error('❌ Error al registrar el mantenimiento');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al registrar el mantenimiento');
    }
  };

  const handleGuardarEquipo = async () => {
    if (!nuevoEquipo.nombre) {
      toast.warning('⚠️ El nombre del equipo es obligatorio');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/productos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: nuevoEquipo.nombre,
          tipo: 'equipo',
          categoria: 3,
          cantidad: nuevoEquipo.cantidad || 1,
          minimo: 1,
          ubicacion: nuevoEquipo.ubicacion || 'Laboratorio',
          unidad: 'unidades',
          marca: nuevoEquipo.marca || '',
          modelo: nuevoEquipo.modelo || '',
          serie: nuevoEquipo.serie || '',
          responsable: nuevoEquipo.responsable || '',
          proveedor: nuevoEquipo.proveedor || '',
          horas_uso: nuevoEquipo.horas_uso || 0
        })
      });

      if (response.ok) {
        toast.success('✅ Equipo creado exitosamente');
        setNuevoEquipo({
          nombre: '',
          marca: '',
          modelo: '',
          serie: '',
          responsable: '',
          proveedor: '',
          horas_uso: 0,
          ubicacion: '',
          cantidad: 1
        });
        setShowFormEquipo(false);
        cargarEquipos();
      } else {
        const error = await response.json();
        toast.error('❌ Error al crear el equipo');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al crear el equipo');
    }
  };

  const handleEliminarEquipo = async () => {
    if (!equipoEliminar) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/productos/${equipoEliminar.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('✅ Equipo eliminado exitosamente');
        setShowDeleteModal(false);
        setEquipoEliminar(null);
        cargarEquipos();
      } else {
        toast.error('❌ Error al eliminar el equipo');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al eliminar el equipo');
    }
  };

  // ============================================================
  // EXPORTACIONES
  // ============================================================
  const exportarPDF = (equipo) => {
    if (!equipo) return;
    
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor('#1FA971');
    doc.text('Hoja de Vida de Equipo', 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor('#4B5563');
    doc.text(`Equipo: ${equipo.nombre}`, 14, 35);
    doc.text(`Ubicación: ${equipo.ubicacion || 'No especificada'}`, 14, 42);
    doc.text(`Horas de uso: ${equipo.horas_uso || 0}h`, 14, 49);
    doc.text(`Total mantenimientos: ${equipo.total_mantenimientos || 0}`, 14, 56);
    
    if (mantenimientos.length > 0) {
      doc.autoTable({
        startY: 65,
        head: [['Fecha', 'Tipo', 'Descripción', 'Técnico', 'Costo']],
        body: mantenimientos.map(m => [
          m.fecha,
          m.tipo,
          m.descripcion.substring(0, 30) + (m.descripcion.length > 30 ? '...' : ''),
          m.tecnico || '-',
          `$${m.costo}`
        ]),
        theme: 'striped',
        headStyles: { fillColor: '#1FA971' },
        styles: { fontSize: 8 }
      });
    }
    
    doc.save(`hoja-vida-${equipo.nombre}.pdf`);
  };

  const exportarExcel = () => {
    const data = equipos.map(e => ({
      'Equipo': e.nombre,
      'Ubicación': e.ubicacion || '-',
      'Stock': e.cantidad,
      'Horas de Uso': e.horas_uso || 0,
      'Último Mantenimiento': e.ultimo_mantenimiento || '-',
      'Total Mantenimientos': e.total_mantenimientos || 0,
      'Desgaste Estimado': `${e.desgaste_estimado || 0}%`,
      'Mantenimiento Requerido': e.mantenimiento_requerido ? 'Sí' : 'No'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Equipos');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `reporte-equipos-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ============================================================
  // DATOS PARA LA GRÁFICA CON FILTROS
  // ============================================================
  const filtrarEquiposPorUso = (equipos, filtro) => {
    switch(filtro) {
      case 'intensivo':
        return equipos.filter(e => (e.horas_uso || 0) > 300);
      case 'moderado':
        return equipos.filter(e => (e.horas_uso || 0) >= 150 && (e.horas_uso || 0) <= 300);
      case 'bajo':
        return equipos.filter(e => (e.horas_uso || 0) < 150);
      default:
        return equipos;
    }
  };

  const datosGrafica = filtrarEquiposPorUso(equipos, filtroUso)
    .map(equipo => ({
      nombre: equipo.nombre.length > 25 ? equipo.nombre.substring(0, 25) + '...' : equipo.nombre,
      horas: equipo.horas_uso || 0,
      mantenimientos: equipo.total_mantenimientos || 0,
      desgaste: equipo.desgaste_estimado || 0,
      categoria: equipo.categoria || 'General'
    }))
    .sort((a, b) => {
      if (ordenGrafica === 'asc') return a.horas - b.horas;
      return b.horas - a.horas;
    });

  const equiposConMantenimiento = equipos.filter(
    equipo => equipo.mantenimiento_requerido
  );

  // ============================================================
  // RENDER
  // ============================================================
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-3 h-3 rounded-full mx-auto mb-3 bg-emerald-500 animate-pulse" />
            <p className="text-stone-500 font-mono text-sm">CARGANDO EQUIPOS...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ToastContainer />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Encabezado */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-stone-800">
              🔧 Hoja de Vida de Equipos
            </h1>
            <p className="text-stone-500 mt-1">Historial de mantenimientos y estado de equipos de laboratorio</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificacionesEquipos equipos={equipos} />
            <button
              onClick={exportarExcel}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
            {selectedEquipo && (
              <button
                onClick={() => exportarPDF(selectedEquipo)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            )}
            <button
              onClick={() => setShowFormEquipo(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              + Nuevo Equipo
            </button>
          </div>
        </motion.div>

        {/* Alerta de mantenimiento */}
        {equiposConMantenimiento.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 bg-gradient-to-r from-emerald-50 to-white border-l-4 border-emerald-500 rounded-xl shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-800 text-sm flex items-center gap-2">
                  ⚠️ Equipos que requieren mantenimiento
                  <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                    {equiposConMantenimiento.length}
                  </span>
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {equiposConMantenimiento.slice(0, 6).map((equipo) => (
                    <span 
                      key={equipo.id} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs text-stone-600 shadow-sm"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      {equipo.nombre.length > 20 ? equipo.nombre.substring(0, 20) + '...' : equipo.nombre}
                      <span className="text-emerald-600 font-medium ml-1">
                        {Number(equipo.desgaste_estimado || 0).toFixed(0)}%
                      </span>
                    </span>
                  ))}
                  {equiposConMantenimiento.length > 6 && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-stone-100 rounded-lg text-xs text-stone-500">
                      +{equiposConMantenimiento.length - 6} más
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Formulario nuevo equipo */}
        {showFormEquipo && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 border rounded-lg bg-gray-50"
          >
            <h2 className="font-bold mb-4 text-stone-700">Nuevo Equipo</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nombre del equipo *"
                className="border p-2 rounded-lg focus:ring-2 focus:ring-emerald-400"
                value={nuevoEquipo.nombre}
                onChange={(e) => setNuevoEquipo({...nuevoEquipo, nombre: e.target.value})}
              />
              <input
                type="text"
                placeholder="Marca"
                className="border p-2 rounded-lg focus:ring-2 focus:ring-emerald-400"
                value={nuevoEquipo.marca}
                onChange={(e) => setNuevoEquipo({...nuevoEquipo, marca: e.target.value})}
              />
              <input
                type="text"
                placeholder="Modelo"
                className="border p-2 rounded-lg focus:ring-2 focus:ring-emerald-400"
                value={nuevoEquipo.modelo}
                onChange={(e) => setNuevoEquipo({...nuevoEquipo, modelo: e.target.value})}
              />
              <input
                type="text"
                placeholder="Serie"
                className="border p-2 rounded-lg focus:ring-2 focus:ring-emerald-400"
                value={nuevoEquipo.serie}
                onChange={(e) => setNuevoEquipo({...nuevoEquipo, serie: e.target.value})}
              />
              <input
                type="text"
                placeholder="Responsable"
                className="border p-2 rounded-lg focus:ring-2 focus:ring-emerald-400"
                value={nuevoEquipo.responsable}
                onChange={(e) => setNuevoEquipo({...nuevoEquipo, responsable: e.target.value})}
              />
              <input
                type="text"
                placeholder="Proveedor"
                className="border p-2 rounded-lg focus:ring-2 focus:ring-emerald-400"
                value={nuevoEquipo.proveedor}
                onChange={(e) => setNuevoEquipo({...nuevoEquipo, proveedor: e.target.value})}
              />
              <input
                type="number"
                placeholder="Horas de uso"
                className="border p-2 rounded-lg focus:ring-2 focus:ring-emerald-400"
                value={nuevoEquipo.horas_uso}
                onChange={(e) => setNuevoEquipo({...nuevoEquipo, horas_uso: Number(e.target.value)})}
              />
              <input
                type="text"
                placeholder="Ubicación"
                className="border p-2 rounded-lg focus:ring-2 focus:ring-emerald-400"
                value={nuevoEquipo.ubicacion}
                onChange={(e) => setNuevoEquipo({...nuevoEquipo, ubicacion: e.target.value})}
              />
              <input
                type="number"
                placeholder="Cantidad"
                className="border p-2 rounded-lg focus:ring-2 focus:ring-emerald-400"
                value={nuevoEquipo.cantidad}
                onChange={(e) => setNuevoEquipo({...nuevoEquipo, cantidad: Number(e.target.value)})}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleGuardarEquipo} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                Guardar
              </button>
              <button onClick={() => setShowFormEquipo(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                Cancelar
              </button>
            </div>
          </motion.div>
        )}

        {/* ============================================================
            GRÁFICA CON FILTROS - SECCIÓN COMPLETA
            ============================================================ */}
        {equipos.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-stone-200"
          >
            {/* Encabezado con filtros */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-stone-700">📊 Uso de Equipos</h2>
                <p className="text-sm text-stone-400">
                  {filtroUso === 'todos' && 'Todos los equipos de laboratorio'}
                  {filtroUso === 'intensivo' && '🔴 Equipos con uso intensivo (>300h)'}
                  {filtroUso === 'moderado' && '🟡 Equipos con uso moderado (150-300h)'}
                  {filtroUso === 'bajo' && '🟢 Equipos con poco uso (<150h)'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFiltroUso('todos')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                    filtroUso === 'todos' 
                      ? 'bg-stone-700 text-white shadow-sm' 
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  📊 Todos
                </button>
                <button 
                  onClick={() => setFiltroUso('intensivo')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                    filtroUso === 'intensivo' 
                      ? 'bg-red-500 text-white shadow-sm' 
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  🔴 Intensivo
                </button>
                <button 
                  onClick={() => setFiltroUso('moderado')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                    filtroUso === 'moderado' 
                      ? 'bg-amber-500 text-white shadow-sm' 
                      : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                  }`}
                >
                  🟡 Moderado
                </button>
                <button 
                  onClick={() => setFiltroUso('bajo')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                    filtroUso === 'bajo' 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  🟢 Bajo
                </button>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
                <p className="text-lg font-bold text-red-600">
                  {equipos.filter(e => (e.horas_uso || 0) > 300).length}
                </p>
                <p className="text-xs text-red-500 font-medium">Uso Intensivo</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
                <p className="text-lg font-bold text-amber-600">
                  {equipos.filter(e => (e.horas_uso || 0) >= 150 && (e.horas_uso || 0) <= 300).length}
                </p>
                <p className="text-xs text-amber-500 font-medium">Uso Moderado</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-100">
                <p className="text-lg font-bold text-emerald-600">
                  {equipos.filter(e => (e.horas_uso || 0) < 150).length}
                </p>
                <p className="text-xs text-emerald-500 font-medium">Poco Uso</p>
              </div>
              <div className="bg-stone-50 rounded-lg p-3 text-center border border-stone-200">
                <p className="text-lg font-bold text-stone-600">
                  {equipos.length}
                </p>
                <p className="text-xs text-stone-500 font-medium">Total Equipos</p>
              </div>
            </div>

            {/* Ordenamiento */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 font-medium">Ordenar:</span>
                <button 
                  onClick={() => setOrdenGrafica('desc')}
                  className={`px-3 py-1 text-xs rounded-lg transition-all ${
                    ordenGrafica === 'desc' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  ↓ Mayor a menor
                </button>
                <button 
                  onClick={() => setOrdenGrafica('asc')}
                  className={`px-3 py-1 text-xs rounded-lg transition-all ${
                    ordenGrafica === 'asc' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  ↑ Menor a mayor
                </button>
              </div>
              <span className="text-xs text-stone-400">
                Mostrando {datosGrafica.length} equipos
                {filtroUso !== 'todos' && ` (filtrados)`}
              </span>
            </div>

            {/* Gráfica */}
            {datosGrafica.length > 0 ? (
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={Math.max(400, datosGrafica.length * 35)}>
                  <BarChart 
                    data={datosGrafica} 
                    layout="vertical"
                    margin={{ top: 20, right: 40, left: 160, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis 
                      type="number" 
                      stroke="#9ca3af" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 'dataMax + 20']}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="nombre" 
                      stroke="#6b7280" 
                      fontSize={11}
                      width={150}
                      tick={{ fontSize: 10, fontWeight: 500 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(31, 169, 113, 0.05)' }} />
                    <Bar 
                      dataKey="horas" 
                      fill="#1FA971"
                      radius={[0, 6, 6, 0]}
                      barSize={20}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                      label={{ 
                        position: 'right', 
                        fontSize: 11, 
                        fill: '#4b5563',
                        fontWeight: 600,
                        formatter: (value) => `${value}h`
                      }}
                    >
                      {datosGrafica.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.horas)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                <p className="text-lg">📭</p>
                <p className="text-sm mt-2">No hay equipos en esta categoría</p>
              </div>
            )}
            
            {/* Estadísticas adicionales */}
            <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-stone-500">
              <span>
                Total equipos: <span className="font-bold text-stone-700">{equipos.length}</span>
              </span>
              <span>
                Total horas: <span className="font-bold text-emerald-600">
                  {equipos.reduce((sum, e) => sum + (e.horas_uso || 0), 0)}h
                </span>
              </span>
              <span>
                Promedio: <span className="font-bold text-stone-700">
                  {(equipos.reduce((sum, e) => sum + (e.horas_uso || 0), 0) / equipos.length).toFixed(0)}h
                </span>
              </span>
              <span>
                Máximo: <span className="font-bold text-red-600">
                  {Math.max(...equipos.map(e => e.horas_uso || 0))}h
                </span>
              </span>
            </div>
          </motion.div>
        )}

        {/* Tabla de equipos */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm"
        >
          <div className="px-6 py-4 border-b bg-stone-50 flex justify-between items-center">
            <span className="font-semibold text-stone-700">
              📋 Lista de Equipos
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">
                {equipos.length}
              </span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-stone-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase">Equipo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase">Ubicación</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase">Horas Uso</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase">Desgaste</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase">Mantenimiento</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {equipos.map((e) => (
                  <tr key={e.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-stone-700">{e.nombre}</td>
                    <td className="px-6 py-3 text-sm text-stone-600">{e.ubicacion || '-'}</td>
                    <td className="px-6 py-3 text-sm text-stone-600">{e.cantidad} uds.</td>
                    <td className="px-6 py-3 text-sm text-stone-600">{e.horas_uso || 0}h</td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${(e.desgaste_estimado || 0) > 50 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {Number(e.desgaste_estimado || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${e.mantenimiento_requerido ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {e.mantenimiento_requerido ? '⚠️ Requerido' : '✅ OK'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => verDetalle(e)}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 transition-colors"
                        >
                          Ver Hoja de Vida
                        </button>
                        <button
                          onClick={() => {
                            setEquipoEliminar(e);
                            setShowDeleteModal(true);
                          }}
                          className="px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {equipos.length === 0 && (
            <div className="text-center py-12 text-stone-500">
              No hay equipos registrados en el inventario
            </div>
          )}
        </motion.div>

        {/* Modales */}
        <ConfirmModal
          open={showDeleteModal}
          titulo="Eliminar equipo"
          mensaje={`¿Deseas eliminar "${equipoEliminar?.nombre}"?`}
          onClose={() => {
            setShowDeleteModal(false);
            setEquipoEliminar(null);
          }}
          onConfirm={handleEliminarEquipo}
        />

        {/* Modal de Detalle */}
        {showModal && selectedEquipo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4"
            >
              <div className="sticky top-0 bg-white border-b border-stone-200 p-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-stone-800">
                    Hoja de Vida: {selectedEquipo.nombre}
                  </h2>
                  <p className="text-sm text-stone-500">
                    {selectedEquipo.marca} {selectedEquipo.modelo} - {selectedEquipo.serie}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportarPDF(selectedEquipo)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4" /> PDF
                  </button>
                  <button 
                    onClick={() => setShowModal(false)} 
                    className="text-stone-400 hover:text-stone-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-stone-50 rounded-lg">
                  <div>
                    <label className="text-xs text-stone-400 uppercase">Ubicación</label>
                    <p className="font-medium text-stone-700">{selectedEquipo.ubicacion || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 uppercase">Stock actual</label>
                    <p className="font-medium text-stone-700">{selectedEquipo.cantidad} unidades</p>
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 uppercase">Horas de uso</label>
                    <p className="font-medium text-stone-700">{selectedEquipo.horas_uso || 0}h</p>
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 uppercase">Desgaste</label>
                    <p className="font-medium text-stone-700">{Number(selectedEquipo.desgaste_estimado || 0).toFixed(1)}%</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-stone-700">Historial de Mantenimientos</h3>
                  <button
                    onClick={() => setShowMantModal(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
                  >
                    + Registrar Mantenimiento
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-stone-200 rounded-lg overflow-hidden">
                    <thead className="bg-stone-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-stone-600 uppercase">Fecha</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-stone-600 uppercase">Tipo</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-stone-600 uppercase">Descripción</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-stone-600 uppercase">Técnico</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-stone-600 uppercase">Costo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {mantenimientos.map((m) => (
                        <tr key={m.id} className="hover:bg-stone-50">
                          <td className="px-4 py-2 text-sm">{m.fecha}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              m.tipo === 'preventivo' ? 'bg-blue-100 text-blue-700' :
                              m.tipo === 'correctivo' ? 'bg-amber-100 text-amber-700' :
                              m.tipo === 'calibracion' ? 'bg-purple-100 text-purple-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {m.tipo}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm">{m.descripcion}</td>
                          <td className="px-4 py-2 text-sm">{m.tecnico || '-'}</td>
                          <td className="px-4 py-2 text-sm">${m.costo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {mantenimientos.length === 0 && (
                    <div className="text-center py-8 text-stone-500">
                      No hay mantenimientos registrados para este equipo
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Registrar Mantenimiento */}
        {showMantModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md m-4"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-stone-800 mb-4">Registrar Mantenimiento</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Tipo *</label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                      className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-400"
                    >
                      <option value="preventivo">Preventivo</option>
                      <option value="correctivo">Correctivo</option>
                      <option value="calibracion">Calibración</option>
                      <option value="predictivo">Predictivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Fecha *</label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                      className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Descripción *</label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      rows="3"
                      className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-400"
                      placeholder="Describa el mantenimiento realizado..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Técnico</label>
                    <input
                      type="text"
                      value={formData.tecnico}
                      onChange={(e) => setFormData({...formData, tecnico: e.target.value})}
                      className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-400"
                      placeholder="Nombre del técnico"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Costo</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costo}
                      onChange={(e) => setFormData({...formData, costo: parseFloat(e.target.value)})}
                      className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-400"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Observaciones</label>
                    <textarea
                      value={formData.observaciones}
                      onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                      rows="2"
                      className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-400"
                      placeholder="Observaciones adicionales..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowMantModal(false)}
                    className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={registrarMantenimiento}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Guardar Mantenimiento
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HojaVidaEquipos;