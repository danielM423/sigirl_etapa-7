import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Calendar, ChevronLeft, ChevronRight, RefreshCw, Clock, X } from 'lucide-react';

const ProgramacionLaboratorios = () => {
  const [programacion, setProgramacion] = useState({});
  const [loading, setLoading] = useState(true);
  const [semanaActual, setSemanaActual] = useState(0);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [practicaSeleccionada, setPracticaSeleccionada] = useState(null);
  
  const navegacionAutomaticaRealizada = useRef(false);
  
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
  }, []);

  const abrirDetalle = (practica, fecha, ambiente) => {
    setPracticaSeleccionada({
      ...practica,
      fecha: fecha,
      ambiente: ambiente,
      hora_inicio: practica.hora_inicio || 'No especificada',
      hora_fin: practica.hora_fin || '',
      id: practica.id || 'N/A',
      creado_por: practica.creado_por || 'admin'
    });
    setModalAbierto(true);
  };

  const cargarProgramacion = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('❌ No hay sesión activa');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://127.0.0.1:8000/api/programacion-laboratorio/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📅 Datos de programación:', data);
        
        const programacionPorFecha = {};
        data.forEach(p => {
          const fecha = p.fecha;
          if (!programacionPorFecha[fecha]) {
            programacionPorFecha[fecha] = {};
          }
          const ambiente = p.ambiente_nombre;
          if (!programacionPorFecha[fecha][ambiente]) {
            programacionPorFecha[fecha][ambiente] = [];
          }
          programacionPorFecha[fecha][ambiente].push({
            id: p.id,
            franja: p.franja_nombre,
            practica: p.practica_nombre,
            instructor: p.instructor_nombre,
            grupo: p.grupo || 'N/A',
            estado: p.estado || 'programado',
            observaciones: p.observaciones || '',
            hora_inicio: p.hora_inicio || null,
            hora_fin: p.hora_fin || null,
            creado_por: p.creado_por || 'admin'
          });
        });
        
        setProgramacion(programacionPorFecha);
        
        const fechasConDatos = Object.keys(programacionPorFecha).sort();
        if (fechasConDatos.length > 0 && !navegacionAutomaticaRealizada.current) {
          const primeraFecha = new Date(fechasConDatos[0] + 'T00:00:00');
          const hoy = new Date();
          const diaSemana = primeraFecha.getDay();
          const diffAlLunes = diaSemana === 0 ? 6 : diaSemana - 1;
          const lunesFecha = new Date(primeraFecha);
          lunesFecha.setDate(primeraFecha.getDate() - diffAlLunes);
          const diffDias = Math.floor((lunesFecha - hoy) / (1000 * 60 * 60 * 24));
          const semanasOffset = Math.round(diffDias / 7);
          setSemanaActual(semanasOffset);
          navegacionAutomaticaRealizada.current = true;
          console.log(`📅 Navegando a la semana del ${lunesFecha.toLocaleDateString()}, offset: ${semanasOffset}`);
        }
        
        let totalPracticas = 0;
        Object.values(programacionPorFecha).forEach(dia => {
          Object.values(dia).forEach(ambiente => {
            totalPracticas += ambiente.length;
          });
        });
        
        toast.success(`✅ ${Object.keys(programacionPorFecha).length} días, ${totalPracticas} prácticas`);
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
  
  let totalPracticas = 0;
  Object.values(programacion).forEach(dia => {
    Object.values(dia).forEach(ambiente => {
      totalPracticas += ambiente.length;
    });
  });

  return (
    <Layout>
      <ToastContainer />
      <div className="p-6 max-w-full mx-auto">
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
              <button onClick={() => cambiarSemana(-1)} className="p-2 bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => cambiarSemana(1)} className="p-2 bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button onClick={() => { navegacionAutomaticaRealizada.current = false; cargarProgramacion(); }} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
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
                            onClick={() => abrirDetalle(p, fechaStr, ambiente)}
                            className={`${coloresFranja[p.franja] || 'border-l-4 border-stone-300'} rounded-lg p-2 text-xs shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:bg-opacity-80`}
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
                                <div className="text-stone-400 text-[9px] flex items-center gap-1 flex-wrap">
                                  <span>ID: #{p.id}</span>
                                  <span>•</span>
                                  <span>Grupo: {p.grupo || 'N/A'}</span>
                                  <span>•</span>
                                  <span>{p.franja}</span>
                                  {p.hora_inicio && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5">
                                        <Clock className="w-3 h-3" />
                                        {p.hora_inicio}{p.hora_fin ? ` - ${p.hora_fin}` : ''}
                                      </span>
                                    </>
                                  )}
                                  {p.estado && (
                                    <span className={`ml-1 px-1 py-0.5 rounded text-[8px] ${p.estado === 'programado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                      {p.estado}
                                    </span>
                                  )}
                                  {p.creado_por && (
                                    <>
                                      <span>•</span>
                                      <span className="text-emerald-600">👤 {p.creado_por}</span>
                                    </>
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

      {modalAbierto && practicaSeleccionada && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-stone-200 p-5 flex justify-between items-center z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h2 className="text-lg font-bold text-stone-800">Detalle de Práctica</h2>
                  <p className="text-sm text-stone-500">{practicaSeleccionada.practica}</p>
                </div>
              </div>
              <button onClick={() => setModalAbierto(false)} className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-xs text-stone-400 font-medium uppercase">ID</p>
                  <p className="font-bold text-stone-800 font-mono">#{practicaSeleccionada.id}</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-xs text-stone-400 font-medium uppercase">Práctica</p>
                  <p className="font-bold text-stone-800 text-sm">{practicaSeleccionada.practica}</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-xs text-stone-400 font-medium uppercase">Instructor</p>
                  <p className="font-bold text-stone-800">{practicaSeleccionada.instructor}</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-xs text-stone-400 font-medium uppercase">Fecha</p>
                  <p className="font-bold text-stone-800">
                    {new Date(practicaSeleccionada.fecha + 'T00:00:00').toLocaleDateString('es-CO', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-xs text-stone-400 font-medium uppercase">Hora</p>
                  <p className="font-bold text-stone-800">
                    {practicaSeleccionada.hora_inicio || 'No especificada'}
                    {practicaSeleccionada.hora_fin && ` - ${practicaSeleccionada.hora_fin}`}
                  </p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-xs text-stone-400 font-medium uppercase">Ambiente</p>
                  <p className="font-bold text-stone-800">{practicaSeleccionada.ambiente}</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-xs text-stone-400 font-medium uppercase">Franja Horaria</p>
                  <p className="font-bold text-stone-800">
                    {iconosFranja[practicaSeleccionada.franja]} {practicaSeleccionada.franja}
                  </p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-xs text-stone-400 font-medium uppercase">Grupo</p>
                  <p className="font-bold text-stone-800">{practicaSeleccionada.grupo || 'N/A'}</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-xs text-stone-400 font-medium uppercase">Estado</p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    practicaSeleccionada.estado === 'programado' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : practicaSeleccionada.estado === 'pendiente' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      practicaSeleccionada.estado === 'programado' 
                        ? 'bg-emerald-500' 
                        : practicaSeleccionada.estado === 'pendiente' 
                        ? 'bg-amber-500' 
                        : 'bg-red-500'
                    }`}></span>
                    {practicaSeleccionada.estado || 'programado'}
                  </span>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-xs text-stone-400 font-medium uppercase">Solicitado por</p>
                  <p className="font-bold text-stone-800">{practicaSeleccionada.creado_por || 'admin'}</p>
                </div>
              </div>

              {practicaSeleccionada.observaciones && (
                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <p className="text-xs text-stone-400 font-medium uppercase">Observaciones</p>
                  <p className="text-stone-700 whitespace-pre-wrap text-sm">{practicaSeleccionada.observaciones}</p>
                </div>
              )}

              <button
                onClick={() => setModalAbierto(false)}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default ProgramacionLaboratorios;