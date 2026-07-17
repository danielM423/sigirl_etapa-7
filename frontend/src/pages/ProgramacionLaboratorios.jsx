import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Calendar, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const ProgramacionLaboratorios = () => {
  const [programacion, setProgramacion] = useState({});
  const [loading, setLoading] = useState(true);
  const [semanaActual, setSemanaActual] = useState(0);
  
  const ambientes = ['TOC 501', 'TOC 505', 'TOC 507', 'TOC 503'];
  const franjas = ['Mañana', 'Tarde', 'Noche'];
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const coloresFranja = {
    'Mañana': 'border-l-4 border-amber-500 bg-amber-50',
    'Tarde': 'border-l-4 border-orange-500 bg-orange-50',
    'Noche': 'border-l-4 border-indigo-600 bg-indigo-50'
  };

  const iconosFranja = {
    'Mañana': '🌅',
    'Tarde': '☀️',
    'Noche': '🌙'
  };

  useEffect(() => {
    cargarProgramacion();
  }, [semanaActual]);

  const cargarProgramacion = async () => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            toast.error('❌ No hay sesión activa');
            setLoading(false);
            return;
        }
        const response = await fetch('http://127.0.0.1:8000/api/programacion-semanal/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            
            // ✅ MOSTRAR TODAS LAS PRÁCTICAS - SIN FILTRAR
            setProgramacion(data);
            
            const totalPracticas = Object.values(data).reduce((acc, day) => {
                return acc + Object.values(day).reduce((sum, amb) => sum + amb.length, 0);
            }, 0);
            toast.success(`✅ ${Object.keys(data).length} días, ${totalPracticas} prácticas`);
        } else {
            toast.error('❌ Error al cargar la programación');
        }
    } catch (err) {
        console.error('Error:', err);
        toast.error('❌ Error al cargar la programación');
    } finally {
        setLoading(false);
    }
};
  const getInicioSemana = (offset = 0) => {
    const hoy = new Date();
    const dia = hoy.getDay();
    const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1);
    const inicio = new Date(hoy);
    inicio.setDate(diff + (offset * 7));
    return inicio;
  };

  const getFechaDia = (index, offset = 0) => {
    const inicio = getInicioSemana(offset);
    const fecha = new Date(inicio);
    fecha.setDate(fecha.getDate() + index);
    return fecha;
  };

  const getFechaStr = (fecha) => {
    return fecha.toISOString().split('T')[0];
  };

  const getProgramacionDia = (fechaStr, ambiente, franja) => {
    const diaData = programacion[fechaStr];
    if (!diaData) return null;
    if (!diaData[ambiente]) return null;
    return diaData[ambiente].find(p => p.franja === franja) || null;
  };

  const esHoy = (fecha) => {
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() && 
           fecha.getMonth() === hoy.getMonth() && 
           fecha.getFullYear() === hoy.getFullYear();
  };

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const cambiarSemana = (direccion) => {
    setSemanaActual(semanaActual + direccion);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  const inicioSemana = getInicioSemana(semanaActual);
  const totalPracticas = Object.values(programacion).reduce((acc, day) => {
    return acc + Object.values(day).reduce((sum, amb) => sum + amb.length, 0);
  }, 0);

  const tieneDatos = Object.keys(programacion).length > 0;

  return (
    <Layout>
      <ToastContainer />
      <div className="p-6 max-w-full mx-auto">
        {/* Encabezado */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-4xl">📅</span>
                <div>
                  <h1 className="text-3xl font-bold text-stone-800">Programación de Laboratorios</h1>
                  <p className="text-stone-500 mt-1">
                    Semana del <span className="font-medium text-stone-700">{inicioSemana.toLocaleDateString('es-CO')}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => cambiarSemana(-1)} 
                className="p-2 bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => cambiarSemana(1)} 
                className="p-2 bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button 
                onClick={cargarProgramacion} 
                className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="text-sm bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-lg flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {Object.keys(programacion).length} días programados
            </span>
            <span className="text-sm bg-blue-100 text-blue-700 px-4 py-1.5 rounded-lg flex items-center gap-1">
              📋 {totalPracticas} prácticas en total
            </span>
          </div>
        </motion.div>

        {/* Mensaje cuando no hay datos */}
        {!tieneDatos && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-12 text-center">
            <span className="text-6xl block mb-4">📋</span>
            <h3 className="text-xl font-semibold text-stone-700 mb-2">No hay prácticas programadas</h3>
            <p className="text-stone-500">Genera un pedido desde el selector de prácticas y apruebalo para que aparezca aquí.</p>
          </div>
        )}

        {/* Tarjetas por día */}
        {tieneDatos && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {diasSemana.map((dia, idx) => {
              const fecha = getFechaDia(idx, semanaActual);
              const fechaStr = getFechaStr(fecha);
              const esHoyFecha = esHoy(fecha);
              
              const diaData = programacion[fechaStr] || {};
              const totalDia = Object.values(diaData).reduce((sum, amb) => sum + amb.length, 0);
              
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white rounded-xl border ${esHoyFecha ? 'border-emerald-400 shadow-lg shadow-emerald-100' : 'border-stone-200'} overflow-hidden`}
                >
                  <div className={`p-3 ${esHoyFecha ? 'bg-emerald-50' : 'bg-stone-50'} border-b border-stone-200`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-stone-800 text-sm">{dia}</div>
                        <div className={`text-xs ${esHoyFecha ? 'text-emerald-600' : 'text-stone-400'}`}>
                          {formatearFecha(fecha)}
                        </div>
                      </div>
                      {esHoyFecha && (
                        <span className="text-[10px] bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full">HOY</span>
                      )}
                    </div>
                    <div className="text-xs text-stone-400 mt-1">
                      {totalDia} práctica{totalDia !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
                    {ambientes.map((ambiente) => {
                      const practicas = [];
                      franjas.forEach(franja => {
                        const item = getProgramacionDia(fechaStr, ambiente, franja);
                        if (item) practicas.push({ ...item, franja, ambiente });
                      });
                      
                      if (practicas.length === 0) {
                        return (
                          <div key={ambiente} className="text-center text-stone-300 text-xs py-2">
                            — {ambiente} —
                          </div>
                        );
                      }
                      
                      return (
                        <div key={ambiente} className="space-y-1">
                          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-1">
                            {ambiente}
                          </div>
                          {practicas.map((p, i) => (
                            <div 
                              key={i} 
                              className={`${coloresFranja[p.franja] || 'border-l-4 border-stone-300'} rounded-lg p-2 text-xs shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                              title={`${p.practica} - ${p.instructor}`}
                            >
                              <div className="flex items-start gap-1">
                                <span className="text-sm">{iconosFranja[p.franja]}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-stone-800 text-xs truncate">
                                    {p.practica}
                                  </div>
                                  <div className="text-stone-500 text-[10px] truncate">
                                    {p.instructor}
                                  </div>
                                  <div className="text-stone-400 text-[9px] flex items-center gap-1">
                                    <span>Grupo: {p.grupo || 'N/A'}</span>
                                    <span>•</span>
                                    <span>{p.franja}</span>
                                    {p.estado && (
                                      <span className={`ml-1 px-1 py-0.5 rounded text-[8px] ${p.estado === 'programado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {p.estado}
                                      </span>
                                    )}
                                  </div>
                                  {p.observaciones && (
                                    <div className="text-stone-400 text-[8px] truncate italic">
                                      {p.observaciones}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Leyenda */}
        <div className="mt-8 flex flex-wrap items-center gap-6 p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
          <span className="text-sm font-medium text-stone-700">📌 Franjas horarias:</span>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-amber-50 border-l-4 border-amber-500 rounded"></span>
            <span className="text-sm text-stone-600">Mañana (6:00-12:00)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-orange-50 border-l-4 border-orange-500 rounded"></span>
            <span className="text-sm text-stone-600">Tarde (12:00-18:00)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-indigo-50 border-l-4 border-indigo-600 rounded"></span>
            <span className="text-sm text-stone-600">Noche (18:00-22:00)</span>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <span className="inline-block w-3 h-3 bg-emerald-100 border border-emerald-400 rounded"></span>
            <span>Hoy</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProgramacionLaboratorios;