import { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { UserContext } from '../context/UserContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Package, ClipboardList, AlertTriangle, CheckCircle,
  TrendingUp, Clock, FileText, Calendar, User
} from 'lucide-react';
import api from '../services/api';

const UsuarioDashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [practicas, setPracticas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [stats, setStats] = useState({
    totalPracticas: 0,
    pedidosActivos: 0,
    pedidosAprobados: 0,
    pedidosRechazados: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [practicasRes, pedidosRes] = await Promise.all([
        api.get('practicas/'),
        api.get('pedidos/')
      ]);
      
      const practicasData = practicasRes.data || [];
      const pedidosData = pedidosRes.data || [];
      
      const misPracticas = practicasData.filter(p => 
        p.instructor === user?.id || p.instructor_nombre === user?.username
      );
      const misPedidos = pedidosData.filter(p => 
        p.usuario === user?.id || p.usuario_username === user?.username
      );
      
      setPracticas(misPracticas);
      setPedidos(misPedidos);
      
      setStats({
        totalPracticas: misPracticas.length,
        pedidosActivos: misPedidos.filter(p => p.estado === 'pendiente').length,
        pedidosAprobados: misPedidos.filter(p => p.estado === 'aprobado').length,
        pedidosRechazados: misPedidos.filter(p => p.estado === 'rechazado').length
      });

    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'pendiente': 'bg-amber-100 text-amber-700',
      'aprobado': 'bg-emerald-100 text-emerald-700',
      'aprobada': 'bg-emerald-100 text-emerald-700',
      'rechazado': 'bg-rose-100 text-rose-700',
      'rechazada': 'bg-rose-100 text-rose-700',
      'entregado': 'bg-blue-100 text-blue-700',
      'finalizada': 'bg-stone-100 text-stone-700'
    };
    return colores[estado?.toLowerCase()] || 'bg-stone-100 text-stone-700';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CO');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-3 h-3 rounded-full mx-auto mb-3 bg-[#1FA971] animate-pulse" />
            <p className="text-stone-500 font-mono text-sm">CARGANDO DASHBOARD...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const statsCards = [
    { title: 'Mis Prácticas', value: stats.totalPracticas, icon: <ClipboardList className="w-5 h-5" />, bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { title: 'Pedidos Activos', value: stats.pedidosActivos, icon: <Clock className="w-5 h-5" />, bg: 'bg-amber-50', text: 'text-amber-600' },
    { title: 'Pedidos Aprobados', value: stats.pedidosAprobados, icon: <CheckCircle className="w-5 h-5" />, bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { title: 'Pedidos Rechazados', value: stats.pedidosRechazados, icon: <AlertTriangle className="w-5 h-5" />, bg: 'bg-rose-50', text: 'text-rose-600' }
  ];

  return (
    <Layout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
        {/* Encabezado */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl">📊</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Mi Dashboard</h1>
              <p className="text-stone-500 text-sm mt-1">
                Bienvenido, <span className="font-medium text-[#1FA971]">{user?.nombre || user?.username || 'Usuario'}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white border border-[#E0E0E0] border-t-[3px] border-t-[#1FA971] rounded-xl p-4 shadow-[0_2px_6px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_18px_rgba(31,169,113,0.13)] hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
                <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">{stat.title}</span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold font-mono text-[#157A55]">{stat.value}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mis Prácticas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#E0E0E0] bg-[#E8F5F0]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-[#157A55] uppercase tracking-wider">Mis Prácticas</span>
                <span className="text-[10px] font-mono text-stone-400">({practicas.length})</span>
              </div>
              <button
                onClick={() => navigate('/practicas/gestion')}
                className="text-[10px] font-mono font-bold text-[#1FA971] hover:text-[#157A55] transition-colors"
              >
                Ver todas →
              </button>
            </div>
            <div className="p-5">
              {practicas.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-5xl">📋</span>
                  <p className="text-stone-500 font-mono mt-4">No tienes prácticas registradas</p>
                  <p className="text-sm text-stone-400 font-mono">Crea una práctica desde el selector</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-stone-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-4 py-2 text-left text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-4 py-2 text-left text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">Estado</th>
                        <th className="px-4 py-2 text-left text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {practicas.slice(0, 5).map((p) => (
                        <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm font-mono font-medium text-stone-700">{p.nombre}</td>
                          <td className="px-4 py-3 text-sm font-mono text-stone-600">{formatDate(p.fecha)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${getEstadoColor(p.estado)}`}>
                              {p.estado || 'pendiente'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button className="text-[#1FA971] hover:text-[#157A55] text-xs font-mono font-bold transition-colors">
                              Ver detalle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Mis Pedidos Recientes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
          <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#E0E0E0] bg-[#E8F5F0]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-[#157A55] uppercase tracking-wider">Mis Pedidos Recientes</span>
                <span className="text-[10px] font-mono text-stone-400">({pedidos.length})</span>
              </div>
              <button
                onClick={() => navigate('/pedidos')}
                className="text-[10px] font-mono font-bold text-[#1FA971] hover:text-[#157A55] transition-colors"
              >
                Ver todos →
              </button>
            </div>
            <div className="p-5">
              {pedidos.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-5xl">📝</span>
                  <p className="text-stone-500 font-mono mt-4">No tienes pedidos registrados</p>
                  <p className="text-sm text-stone-400 font-mono">Genera una solicitud desde el selector de prácticas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-stone-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">Código</th>
                        <th className="px-4 py-2 text-left text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">Producto</th>
                        <th className="px-4 py-2 text-left text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">Cantidad</th>
                        <th className="px-4 py-2 text-left text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">Estado</th>
                        <th className="px-4 py-2 text-left text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {pedidos.slice(0, 5).map((p) => (
                        <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm font-mono font-medium text-stone-700">{p.codigo || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm font-mono text-stone-600">{p.producto?.nombre || p.producto_nombre || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm font-mono text-stone-700">{p.cantidad}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${getEstadoColor(p.estado)}`}>
                              {p.estado || 'pendiente'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-stone-600">{formatDate(p.fecha_solicitud)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Resumen rápido */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-[#E8F5F0] to-[#DDF3EA] rounded-xl p-4 border border-[#1FA971]/20"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-stone-600 font-mono">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#1FA971]" />
              Sistema operativo
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400" />
              Última actualización: {new Date().toLocaleString('es-CO')}
            </span>
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#1FA971]" />
              {user?.username || 'Usuario'}
            </span>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default UsuarioDashboard;