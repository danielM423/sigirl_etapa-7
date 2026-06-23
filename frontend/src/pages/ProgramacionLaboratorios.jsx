import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  }, []);

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
        setProgramacion(data);
        toast.success(`✅ ${Object.keys(data).length} días cargados`);
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
        <div className="p-6 text-center">Cargando programación...</div>
      </Layout>
    );
  }

  const inicioSemana = getInicioSemana(semanaActual);

  return (
    <Layout>
      <ToastContainer />
      <div className="p-6 max-w-full mx-auto">
        {/* Encabezado */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-4xl">📅</span>
                <div>
                  <h1 className="text-3xl font-bold text-stone-800">Programación de Laboratorios</h1>
                  <p className="text-stone-500 mt-2">
                    Semana del <span className="font-medium text-stone-700">{inicioSemana.toLocaleDateString('es-CO')}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => cambiarSemana(-1)} className="px-4 py-2 bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors">← Anterior</button>
              <button onClick={() => cambiarSemana(1)} className="px-4 py-2 bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors">Siguiente →</button>
            </div>
          </div>
          <div className="flex gap-4 mt-3">
            <span className="text-sm bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-lg">
              {Object.keys(programacion).length} días programados
            </span>
            <span className="text-sm bg-blue-100 text-blue-700 px-4 py-1.5 rounded-lg">
              {ambientes.length} ambientes
            </span>
          </div>
        </motion.div>

        {/* Tarjetas por día */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {diasSemana.map((dia, idx) => {
            const fecha = getFechaDia(idx, semanaActual);
            const fechaStr = getFechaStr(fecha);
            const esHoyFecha = esHoy(fecha);
            
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className={`bg-white rounded-xl border ${esHoyFecha ? 'border-emerald-400 shadow-lg shadow-emerald-100' : 'border-stone-200'} overflow-hidden`}>
                <div className={`p-3 ${esHoyFecha ? 'bg-emerald-50' : 'bg-stone-50'} border-b border-stone-200`}>
                  <div className="font-bold text-stone-800 text-sm">{dia}</div>
                  <div className={`text-xs ${esHoyFecha ? 'text-emerald-600' : 'text-stone-400'}`}>
                    {formatearFecha(fecha)}
                    {esHoyFecha && <span className="ml-2 text-[10px] bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full">HOY</span>}
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
                      return <div key={ambiente} className="text-center text-stone-300 text-xs py-4">— {ambiente} —</div>;
                    }
                    return (
                      <div key={ambiente} className="space-y-1">
                        <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{ambiente}</div>
                        {practicas.map((p, i) => (
                          <div key={i} className={`${coloresFranja[p.franja] || 'border-l-4 border-stone-300'} rounded-lg p-2 text-xs shadow-sm hover:shadow-md transition-shadow`}>
                            <div className="flex items-start gap-1">
                              <span className="text-sm">{iconosFranja[p.franja]}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-stone-800 text-xs truncate" title={p.practica}>{p.practica}</div>
                                <div className="text-stone-500 text-[10px] truncate">{p.instructor}</div>
                                <div className="text-stone-400 text-[9px]">Grupo: {p.grupo || 'N/A'} • {p.franja}</div>
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

        {/* Leyenda */}
        <div className="mt-8 flex flex-wrap items-center gap-6 p-4 bg-white rounded-xl border border-stone-200 shadow-sm">
          <span className="text-sm font-medium text-stone-700">📌 Franjas horarias:</span>
          <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 bg-amber-50 border-l-4 border-amber-500 rounded"></span><span className="text-sm text-stone-600">Mañana (6:00-12:00)</span></div>
          <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 bg-orange-50 border-l-4 border-orange-500 rounded"></span><span className="text-sm text-stone-600">Tarde (12:00-18:00)</span></div>
          <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 bg-indigo-50 border-l-4 border-indigo-600 rounded"></span><span className="text-sm text-stone-600">Noche (18:00-22:00)</span></div>
          <div className="flex-1"></div>
          <button onClick={cargarProgramacion} className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md">Actualizar</button>
        </div>

        {/* Debug */}
        <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
          <details>
            <summary className="text-sm font-medium text-stone-600 cursor-pointer">Ver datos recibidos ({Object.keys(programacion).length} días)</summary>
            <pre className="mt-2 text-xs text-stone-500 overflow-auto max-h-40 p-3 bg-white rounded-lg border border-stone-200">
              {JSON.stringify(programacion, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </Layout>
  );
};

export default ProgramacionLaboratorios;