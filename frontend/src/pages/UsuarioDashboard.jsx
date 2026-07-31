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
      // 1. Cargar prácticas del usuario
      const practicasRes = await api.get('practicas/');
      const practicasData = practicasRes.data || [];
      
      // Filtrar prácticas del usuario actual
      const misPracticas = practicasData.filter(p => 
        p.instructor === user?.id || p.instructor_nombre === user?.username
      );
      setPracticas(misPracticas);

      // 2. Cargar pedidos del usuario
      const pedidosRes = await api.get('pedidos/');
      const pedidosData = pedidosRes.data || [];
      
      // Filtrar pedidos del usuario actual
      const misPedidos = pedidosData.filter(p => 
        p.usuario === user?.id || p.usuario_username === user?.username
      );
      setPedidos(misPedidos);

      // 3. Calcular estadísticas
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

  const statsCards = [
    { title: 'Mis Prácticas', value: stats.totalPracticas, icon: <ClipboardList className="w-5 h-5" />, bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { title: 'Pedidos Activos', value: stats.pedidosActivos, icon: <Clock className="w-5 h-5" />, bg: 'bg-amber-50', text: 'text-amber-600' },
    { title: 'Pedidos Aprobados', value: stats.pedidosAprobados, icon: <CheckCircle className="w-5 h-5" />, bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { title: 'Pedidos Rechazados', value: stats.pedidosRechazados, icon: <AlertTriangle className="w-5 h-5" />, bg: 'bg-rose-50', text: 'text-rose-600' }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center">Cargando tu dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Encabezado */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📊</span>
            <div>
              <h1 className="text-3xl font-bold text-stone-800">Mi Dashboard</h1>
              <p className="text-stone-500 text-sm mt-1">
                Bienvenido, <span className="font-medium text-stone-700">{user?.nombre || user?.username || 'Usuario'}</span>
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
              className={`${stat.bg} rounded-2xl p-5 border border-stone-200/50 shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between">
                <div className={`${stat.text}`}>{stat.icon}</div>
                <span className={`text-xs px-2.5 py-1 rounded-full ${stat.text} bg-white/60`}>{stat.title}</span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-stone-800">{stat.value}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mis Prácticas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-stone-700">📋 Mis Prácticas</span>
                <span className="text-xs text-stone-400">({practicas.length})</span>
              </div>
              <button
                onClick={() => navigate('/practicas/gestion')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Ver todas →
              </button>
            </div>
            <div className="p-5">
              {practicas.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-5xl">📋</span>
                  <p className="text-stone-500 mt-4">No tienes prácticas registradas</p>
                  <p className="text-sm text-stone-400">Crea una práctica desde el selector</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-stone-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 uppercase">Nombre</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 uppercase">Fecha</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 uppercase">Estado</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {practicas.slice(0, 5).map((p) => (
                        <tr key={p.id} className="hover:bg-stone-50">
                          <td className="px-4 py-3 text-sm font-medium text-stone-800">{p.nombre}</td>
                          <td className="px-4 py-3 text-sm text-stone-600">{formatDate(p.fecha)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoColor(p.estado)}`}>
                              {p.estado || 'pendiente'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button className="text-emerald-600 hover:text-emerald-700 text-xs font-medium">
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
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-stone-700">📝 Mis Pedidos Recientes</span>
                <span className="text-xs text-stone-400">({pedidos.length})</span>
              </div>
              <button
                onClick={() => navigate('/pedidos')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Ver todos →
              </button>
            </div>
            <div className="p-5">
              {pedidos.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-5xl">📝</span>
                  <p className="text-stone-500 mt-4">No tienes pedidos registrados</p>
                  <p className="text-sm text-stone-400">Genera una solicitud desde el selector de prácticas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-stone-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 uppercase">Código</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 uppercase">Producto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 uppercase">Cantidad</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 uppercase">Estado</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 uppercase">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {pedidos.slice(0, 5).map((p) => (
                        <tr key={p.id} className="hover:bg-stone-50">
                          <td className="px-4 py-3 text-sm font-medium text-stone-700">{p.codigo || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-stone-600">{p.producto?.nombre || p.producto_nombre || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-stone-700">{p.cantidad}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoColor(p.estado)}`}>
                              {p.estado || 'pendiente'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-stone-600">{formatDate(p.fecha_solicitud)}</td>
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
          className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-2xl p-4 border border-emerald-200"
        >
          <div className="flex items-center justify-between text-sm text-stone-600">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Sistema operativo
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400" />
              Última actualización: {new Date().toLocaleString('es-CO')}
            </span>
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              {user?.username || 'Usuario'}
            </span>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default UsuarioDashboard;