import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Bell, RefreshCw, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import Layout from '../components/Layout';
import { getAlertas } from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const Reportes = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarAlertas = () => {
    setLoading(true);
    getAlertas()
      .then((res) => {
        const datos = res.data?.results ?? res.data ?? [];
        setAlertas(datos);
        if (datos.length === 0) {
          toast.info('No hay alertas registradas');
        }
      })
      .catch((err) => {
        console.error('Error al cargar alertas:', err);
        toast.error('No se pudieron cargar las alertas');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarAlertas();
  }, []);

  // Función para extraer string de objetos {id, nombre}
  const getValue = (value, defaultValue = '—') => {
    if (!value) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return value.nombre || value.name || value.id || defaultValue;
    }
    return String(value);
  };

  // Datos para gráfica de prioridades (barras)
  const datosPrioridad = [
    { name: 'Alta', value: alertas.filter(a => getValue(a.prioridad) === 'alta').length, color: '#ef4444' },
    { name: 'Media', value: alertas.filter(a => getValue(a.prioridad) === 'media').length, color: '#f59e0b' },
    { name: 'Baja', value: alertas.filter(a => getValue(a.prioridad) === 'baja').length, color: '#1FA971' }
  ];

  // Datos para gráfica de estado (pastel)
  const datosEstado = [
    { name: 'Activas', value: alertas.filter(a => a.resuelta === false || getValue(a.estado) !== 'resuelta').length, color: '#ef4444' },
    { name: 'Resueltas', value: alertas.filter(a => a.resuelta === true || getValue(a.estado) === 'resuelta').length, color: '#1FA971' }
  ];

  const totalAlertas = alertas.length;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-3 h-3 rounded-full mx-auto mb-3 bg-emerald-500 animate-pulse" />
            <p className="text-stone-500 font-mono text-sm">CARGANDO ALERTAS...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto">
        {/* Cabecera */}
        <div className="bg-white border border-[#E0E0E0] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] mb-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bell className="h-4 w-4 text-[#1FA971]" />
                <span className="text-[10px] font-mono font-bold text-[#1FA971] uppercase tracking-wider">
                  MÓDULO DE ALERTAS
                </span>
                <span className="w-2 h-2 rounded-full bg-[#1FA971] animate-pulse" />
              </div>
              <h1 className="text-xl font-bold font-mono text-stone-700">Alertas del sistema</h1>
              <p className="text-[10px] font-mono text-stone-500 mt-1">
                Visualización de alertas generadas por bajo stock, vencimientos y eventos del sistema
              </p>
            </div>
            <button
              onClick={cargarAlertas}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold bg-[#E8F5F0] border border-[#1FA971]/30 text-[#157A55] hover:bg-[#1FA971]/20 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Actualizar
            </button>
          </div>
        </div>

        {/* GRÁFICAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Gráfica de Barras - Prioridades */}
          <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E0E0E0]">
              <BarChart3 className="h-4 w-4 text-[#1FA971]" />
              <h3 className="text-xs font-mono font-bold text-stone-700 uppercase tracking-wider">
                Alertas por Prioridad
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={datosPrioridad} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis allowDecimals={false} tick={{ fill: '#78716c', fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip contentStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {datosPrioridad.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center text-xs text-stone-500 mt-2">
              Total: {totalAlertas} alertas
            </div>
          </div>

          {/* Gráfica de Pastel - Estado */}
          <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E0E0E0]">
              <PieChartIcon className="h-4 w-4 text-[#1FA971]" />
              <h3 className="text-xs font-mono font-bold text-stone-700 uppercase tracking-wider">
                Alertas Resueltas vs Activas
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={datosEstado}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={40}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {datosEstado.map((entry, index) => (
                    <Cell key={`pie-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Contador de alertas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="bg-white border-l-4 border-red-500 rounded-lg p-4 shadow">
            <p className="text-xs text-gray-500">Alta Prioridad</p>
            <p className="text-2xl font-bold text-red-600">
              {alertas.filter(a => getValue(a.prioridad) === 'alta').length}
            </p>
          </div>
          <div className="bg-white border-l-4 border-amber-500 rounded-lg p-4 shadow">
            <p className="text-xs text-gray-500">Media Prioridad</p>
            <p className="text-2xl font-bold text-amber-600">
              {alertas.filter(a => getValue(a.prioridad) === 'media').length}
            </p>
          </div>
          <div className="bg-white border-l-4 border-green-500 rounded-lg p-4 shadow">
            <p className="text-xs text-gray-500">Resueltas</p>
            <p className="text-2xl font-bold text-green-600">
              {alertas.filter(a => a.resuelta === true || getValue(a.estado) === 'resuelta').length}
            </p>
          </div>
        </div>

        {/* Tabla de alertas */}
        <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <div className="px-5 py-3 border-b border-[#E0E0E0] bg-[#E8F5F0]">
            <span className="text-xs font-mono font-bold text-[#157A55] uppercase tracking-wider">
              LISTADO DE ALERTAS ({alertas.length} registros)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="px-4 py-3 text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider text-left">TÍTULO</th>
                  <th className="px-4 py-3 text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider text-left">PRODUCTO</th>
                  <th className="px-4 py-3 text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider text-left">REMITENTE</th>
                  <th className="px-4 py-3 text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider text-left">PRIORIDAD</th>
                  <th className="px-4 py-3 text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider text-left">ESTADO</th>
                  <th className="px-4 py-3 text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider text-left">DESCRIPCIÓN</th>
                  <th className="px-4 py-3 text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider text-left">FECHA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {alertas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-stone-400 font-mono text-sm">
                      No hay alertas registradas en el sistema
                    </td>
                  </tr>
                ) : (
                  alertas.map((item) => (
                    <tr key={item.id} className="hover:bg-[#E8F5F0]/40 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-semibold text-stone-700">
                        {getValue(item.titulo)}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-stone-600">
                        {getValue(item.producto_nombre || item.producto)}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-stone-500">
                        {getValue(item.remitente)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          getValue(item.prioridad) === 'alta' 
                            ? 'bg-rose-100 text-rose-700 border-rose-200'
                            : getValue(item.prioridad) === 'media'
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}>
                          {getValue(item.prioridad) === 'alta' ? '⬆ Alta' : 
                           getValue(item.prioridad) === 'media' ? '→ Media' : '⬇ Baja'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          (item.resuelta === true || getValue(item.estado) === 'resuelta')
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {(item.resuelta === true || getValue(item.estado) === 'resuelta') ? '✓ Resuelta' : '○ Activa'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-stone-400 max-w-xs truncate">
                        {getValue(item.descripcion || item.mensaje)}
                      </td>
                      <td className="px-4 py-3 text-[11px] font-mono text-stone-400">
                        {item.fecha ? new Date(item.fecha).toLocaleDateString('es-CO') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reportes;