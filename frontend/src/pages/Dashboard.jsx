// Dashboard general del sistema - Estilo Laboratorio Claro
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
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
} from 'recharts';
import { 
  AlertCircle, 
  BarChart3, 
  ClipboardList, 
  Package2, 
  RefreshCw,
  TrendingUp,
  XCircle,
  Download,
  ArrowUpRight,
  FlaskConical,
  User,
  Clock,
  CheckCircle
} from 'lucide-react';
import api, { getInventarioPracticasInstructor } from '../services/api';
import { UserContext } from '../context/UserContext';
import { exportToExcel } from '../utils/reportExport';
import Layout from '../components/Layout';

// Colores para gráficos
const CHART_COLORS = ['#1FA971', '#157A55', '#4ade80', '#f59e0b', '#ef4444'];

// Componente de tarjeta métrica estilo claro
const LabMetricCard = ({ title, value, icon, trend, subtitle }) => {
  return (
    <div className="bg-white border border-[#E0E0E0] border-t-[3px] border-t-[#1FA971] rounded-xl p-4 shadow-[0_2px_6px_rgba(0,0,0,0.05)] hover:shadow-[0_6px_18px_rgba(31,169,113,0.13)] hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider">{title}</span>
            {trend && (
              <span className="flex items-center gap-0.5 text-[8px] font-mono text-[#157A55] bg-[#E8F5F0] px-1.5 py-0.5 rounded">
                <TrendingUp className="h-2.5 w-2.5" />
                {trend}
              </span>
            )}
          </div>
          <p className="text-3xl font-bold font-mono text-[#157A55]">{value}</p>
          {subtitle && <p className="text-[9px] text-stone-500 font-mono mt-1">{subtitle}</p>}
        </div>
        <div className="p-2 rounded-lg bg-[#E8F5F0] border border-[#1FA971]/20 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
    </div>
  );
};

// Componente de sección estilo claro
const LabSection = ({ title, subtitle, icon, children, action, onActionClick }) => (
  <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
    <div className="px-5 py-4 border-b border-[#E0E0E0] bg-[#E8F5F0] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white border border-[#1FA971]/20 shadow-sm">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-bold font-mono text-[#157A55] uppercase tracking-wider">{title}</h2>
          {subtitle && <p className="text-[10px] text-stone-500 font-mono">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <button
          onClick={onActionClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold text-[#157A55] bg-white border border-[#1FA971]/30 hover:bg-[#E8F5F0] transition-all"
        >
          {action}
        </button>
      )}
    </div>
    <div className="p-5">
      {children}
    </div>
  </div>
);

// Tooltip personalizado claro
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-stone-200 rounded-md p-3 shadow-lg">
        <p className="font-mono font-bold text-emerald-600 mb-1.5 text-[10px]">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-[10px] font-mono">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-stone-500">{entry.name}:</span>
            <span className="font-bold text-emerald-600">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const navigate = useNavigate();
  const { role, user } = useContext(UserContext);
  const isAdmin = role === 'admin';
  const isJefe = role === 'jefe' || role === 'jefe_superior';
  const isUsuario = role === 'usuario';
  const canExportReports = isAdmin || isJefe;
  
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartsReady, setChartsReady] = useState(true);
  const [inventario, setInventario] = useState([]);
  const [loadingInventario, setLoadingInventario] = useState(true);
  const [misPracticas, setMisPracticas] = useState([]);
  const [misPedidos, setMisPedidos] = useState([]);

  // ========== CARGAR DATOS ==========
  const cargarDatos = useCallback(async (showToast = false) => {
    setLoading(true);
    try {
      const [productosResponse, pedidosResponse] = await Promise.all([
        api.get('productos/').catch(() => ({ data: [] })),
        api.get('pedidos/').catch(() => ({ data: [] })),
      ]);

      const prods = productosResponse.data?.results ?? productosResponse.data ?? [];
      const allPedidos = pedidosResponse.data?.results ?? pedidosResponse.data ?? [];
      
      setProductos(prods);
      setPedidos(allPedidos);

      // ========== SI ES USUARIO, FILTRAR SUS DATOS ==========
      if (isUsuario) {
        // Filtrar prácticas del usuario
        const practicasRes = await api.get('practicas/').catch(() => ({ data: [] }));
        const allPracticas = practicasRes.data?.results ?? practicasRes.data ?? [];
        const misPracticasData = allPracticas.filter(p => 
          p.instructor === user?.id || p.instructor_nombre === user?.username
        );
        setMisPracticas(misPracticasData);

        // Filtrar pedidos del usuario
        const misPedidosData = allPedidos.filter(p => 
          p.usuario === user?.id || p.usuario_username === user?.username
        );
        setMisPedidos(misPedidosData);
      }

      if (showToast) toast.success('🔬 Dashboard actualizado');

      // Recordatorios de stock
      if (!showToast) {
        try {
          const username = localStorage.getItem('username') || '';
          const prefs = JSON.parse(localStorage.getItem(`sigirl_profile_preferences:${username}`) || '{}');
          const stockReminders = prefs.stockReminders !== false;
          if (stockReminders) {
            const criticos = prods.filter((p) => Number(p.cantidad ?? 0) <= 0);
            const bajos = prods.filter((p) => Number(p.cantidad ?? 0) > 0 && Number(p.cantidad ?? 0) <= Number(p.minimo ?? p.umbral_minimo ?? 5));
            if (criticos.length > 0) {
              toast.error(`🔴 ${criticos.length} reactivo${criticos.length > 1 ? 's' : ''} agotado${criticos.length > 1 ? 's' : ''}: ${criticos.slice(0,2).map(p=>p.nombre).join(', ')}${criticos.length > 2 ? '...' : ''}`, { autoClose: 6000 });
            }
            if (bajos.length > 0) {
              toast.warn(`🟠 ${bajos.length} reactivo${bajos.length > 1 ? 's' : ''} bajo mínimo: ${bajos.slice(0,2).map(p=>p.nombre).join(', ')}${bajos.length > 2 ? '...' : ''}`, { autoClose: 6000 });
            }
          }
        } catch { /* preferencias no críticas */ }
      }
    } catch {
      toast.error('❌ Error al cargar dashboard');
    } finally {
      setLoading(false);
    }
  }, [isUsuario, user]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setChartsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // ========== ESTADÍSTICAS GENERALES ==========
  const stats = useMemo(() => ({
    totalProductos: productos.length,
    bajoStock: productos.filter((item) => Number(item.cantidad || 0) <= Number(item.minimo || 5)).length,
    totalPedidos: pedidos.length,
    alertas: pedidos.filter((item) => item.estado === 'rechazado').length,
    aprobados: pedidos.filter((item) => item.estado === 'aprobado').length,
    pendientes: pedidos.filter((item) => item.estado === 'pendiente').length,
  }), [productos, pedidos]);

  // ========== ESTADÍSTICAS DEL USUARIO ==========
  const userStats = useMemo(() => ({
    totalPracticas: misPracticas.length,
    pedidosActivos: misPedidos.filter(p => p.estado === 'pendiente').length,
    pedidosAprobados: misPedidos.filter(p => p.estado === 'aprobado').length,
    pedidosRechazados: misPedidos.filter(p => p.estado === 'rechazado').length,
  }), [misPracticas, misPedidos]);

  // ========== GRÁFICO DE BARRAS - USUARIO ==========
  const userBarData = useMemo(() => {
    const estados = {
      'pendiente': 0,
      'aprobado': 0,
      'rechazado': 0,
      'entregado': 0
    };
    misPedidos.forEach(p => {
      const estado = p.estado?.toLowerCase() || 'pendiente';
      if (estados[estado] !== undefined) estados[estado]++;
    });
    return [
      { name: 'Pendientes', value: estados.pendiente, color: '#f59e0b' },
      { name: 'Aprobados', value: estados.aprobado, color: '#22c55e' },
      { name: 'Rechazados', value: estados.rechazado, color: '#ef4444' },
      { name: 'Entregados', value: estados.entregado, color: '#3b82f6' },
    ].filter(item => item.value > 0);
  }, [misPedidos]);

  // ========== GRÁFICO CIRCULAR - USUARIO ==========
  const userDonutData = useMemo(() => {
    return userBarData.map(item => ({
      name: item.name,
      value: item.value,
      color: item.color
    }));
  }, [userBarData]);

  // ========== GRÁFICOS GENERALES (Admin/Jefe) ==========
  const barData = useMemo(() => {
    const grouped = productos.reduce((acc, item) => {
      const key = item.categoria_nombre || item.categoria || 'General';
      acc[key] = (acc[key] || 0) + Number(item.cantidad || 0);
      return acc;
    }, {});
    return Object.entries(grouped).slice(0, 5).map(([name, value]) => ({ name, value }));
  }, [productos]);

  const donutData = useMemo(() => {
    return [
      { name: 'Aprobados', value: stats.aprobados, color: '#22c55e' },
      { name: 'Pendientes', value: stats.pendientes, color: '#f59e0b' },
      { name: 'Rechazados', value: stats.alertas, color: '#ef4444' },
    ].filter((item) => item.value > 0);
  }, [stats]);

  const handleExportCategorias = () => {
    if (!canExportReports) {
      toast.info('Exportación disponible para administración');
      return;
    }
    const total = barData.reduce((sum, item) => sum + Number(item.value || 0), 0) || 1;
    const rows = barData.map((item) => ({
      Categoria: item.name,
      Cantidad: item.value,
      Porcentaje: `${((Number(item.value || 0) / total) * 100).toFixed(1)}%`,
      Nivel: Number(item.value || 0) <= 5 ? 'Leve' : Number(item.value || 0) <= 15 ? 'Medio' : 'Crítico',
    }));
    exportToExcel(rows, 'reporte-categorias.xlsx', 'Categorias');
    toast.success('Reporte exportado');
  };

  const handleExportEstados = () => {
    if (!canExportReports) return;
    const rows = donutData.map((item) => ({
      Estado: item.name,
      Total: item.value,
    }));
    exportToExcel(rows, 'estado-pedidos.xlsx', 'Pedidos');
    toast.success('Reporte exportado');
  };

  const handleVerTodos = () => {
    if (isAdmin) navigate('/admin?tab=pedidos');
    else if (isJefe) navigate('/jefe?tab=pedidos');
    else navigate('/pedidos');
  };

  const quickActions = [
    { label: 'Inventario', path: '/inventario', enabled: true },
    { label: 'Pedidos', path: '/pedidos', enabled: true },
    { label: 'Usuarios', path: '/usuarios', enabled: isAdmin || isJefe },
    { label: 'Alertas', path: '/alertas', enabled: isAdmin || isJefe },
    { label: 'Reportes', path: '/reportes', enabled: isAdmin || isJefe },
  ].filter((item) => item.enabled);

  const recentOrders = useMemo(() => {
    const data = isUsuario ? misPedidos : pedidos;
    return data.slice(0, 6).map((pedido) => ({
      id: pedido.id,
      codigo: pedido.codigo || `PED-${String(pedido.id).padStart(4, '0')}`,
      producto: pedido.producto_nombre || pedido.producto || 'Producto',
      solicitante: pedido.solicitante || pedido.usuario_username || 'Usuario',
      cantidad: pedido.cantidad || 1,
      estado: pedido.estado || 'pendiente',
    }));
  }, [pedidos, misPedidos, isUsuario]);

  // ========== RENDER ==========
  return (
    <Layout>
      <div className="space-y-5 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FlaskConical className="h-4 w-4 text-emerald-600" />
              <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider">
                {isUsuario ? 'PANEL DE USUARIO' : 'PANEL DE CONTROL'}
              </span>
            </div>
            <h2 className="text-xl font-bold font-mono text-stone-700">
              {isUsuario ? 'Mi Dashboard' : 'Dashboard Ejecutivo'}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] text-stone-500 font-mono">
                {isUsuario ? 'Bienvenido, ' + (user?.nombre || user?.username || 'Usuario') : 'REAGENT TRACKING SYSTEM'}
              </p>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow shadow-emerald-500 animate-pulse"></span>
            </div>
          </div>
          <button
            onClick={() => cargarDatos(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-stone-200 text-emerald-600 font-mono text-xs hover:border-emerald-300 hover:bg-emerald-50 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            ACTUALIZAR
          </button>
        </div>

        {/* ========== TARJETAS DE ESTADÍSTICAS ========== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {isUsuario ? (
            // ===== TARJETAS PARA USUARIO =====
            <>
              <LabMetricCard 
                title="MIS PRÁCTICAS" 
                value={userStats.totalPracticas} 
                icon={<ClipboardList className="h-5 w-5 text-emerald-600" />}
                subtitle="Prácticas creadas"
              />
              <LabMetricCard 
                title="PEDIDOS ACTIVOS" 
                value={userStats.pedidosActivos} 
                icon={<Clock className="h-5 w-5 text-amber-500" />}
                subtitle="Pendientes de aprobación"
              />
              <LabMetricCard 
                title="PEDIDOS APROBADOS" 
                value={userStats.pedidosAprobados} 
                icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
                subtitle="Solicitudes aceptadas"
              />
              <LabMetricCard 
                title="PEDIDOS RECHAZADOS" 
                value={userStats.pedidosRechazados} 
                icon={<XCircle className="h-5 w-5 text-rose-500" />}
                subtitle="Solicitudes rechazadas"
              />
            </>
          ) : (
            // ===== TARJETAS PARA ADMIN/JEFE =====
            <>
              <LabMetricCard 
                title="TOTAL PRODUCTOS" 
                value={stats.totalProductos} 
                icon={<Package2 className="h-5 w-5 text-emerald-600" />}
                subtitle="En inventario"
              />
              <LabMetricCard 
                title="PEDIDOS ACTIVOS" 
                value={stats.totalPedidos} 
                icon={<ClipboardList className="h-5 w-5 text-emerald-600" />}
                trend="+12%"
                subtitle="Este mes"
              />
              <LabMetricCard 
                title="STOCK BAJO" 
                value={stats.bajoStock} 
                icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
                subtitle="Requieren reposición"
              />
              <LabMetricCard 
                title="RECHAZADOS" 
                value={stats.alertas} 
                icon={<XCircle className="h-5 w-5 text-rose-500" />}
                subtitle="Alertas críticas"
              />
            </>
          )}
        </div>

        {/* ========== INVENTARIO DE PRÁCTICAS ABIERTAS ========== */}
        <div className="bg-gradient-to-br from-emerald-50 to-white border border-[#E0E0E0] rounded-xl p-6 shadow-sm mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Package2 className="h-5 w-5 text-emerald-600" />
            <span className="text-[11px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
              {isUsuario ? 'MIS PRÁCTICAS' : 'Inventario de Prácticas Abiertas'}
            </span>
          </div>
          {loadingInventario ? (
            <div className="text-stone-400 text-xs py-4 text-center">Cargando...</div>
          ) : isUsuario ? (
            // ===== PRÁCTICAS DEL USUARIO =====
            misPracticas.length === 0 ? (
              <div className="flex flex-col items-center py-6">
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-2 text-emerald-200">
                  <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.02 0l1.41-1.41M6.34 6.34L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-stone-400 text-sm font-mono">No has creado prácticas aún</span>
              </div>
            ) : (
              <div className="overflow-x-auto mb-2">
                <table className="min-w-full text-xs font-mono border rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-emerald-100 text-emerald-800">
                      <th className="px-3 py-2 border">Nombre</th>
                      <th className="px-3 py-2 border">Fecha</th>
                      <th className="px-3 py-2 border">Estado</th>
                      <th className="px-3 py-2 border">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {misPracticas.slice(0, 5).map(p => (
                      <tr key={p.id} className="border-b hover:bg-emerald-50/60 transition-colors">
                        <td className="px-3 py-2 border">{p.nombre}</td>
                        <td className="px-3 py-2 border text-center">{p.fecha}</td>
                        <td className="px-3 py-2 border text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            p.estado === 'aprobada' ? 'bg-emerald-100 text-emerald-700' :
                            p.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                            p.estado === 'rechazada' ? 'bg-rose-100 text-rose-700' :
                            'bg-stone-100 text-stone-700'
                          }`}>
                            {p.estado || 'pendiente'}
                          </span>
                        </td>
                        <td className="px-3 py-2 border text-center">
                          <button className="text-emerald-600 hover:text-emerald-700 text-[10px] font-mono">
                            Ver →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {misPracticas.length > 5 && (
                  <p className="text-[10px] text-stone-400 mt-2 text-center">Mostrando 5 de {misPracticas.length} prácticas</p>
                )}
              </div>
            )
          ) : (
            // ===== INVENTARIO GENERAL (Admin/Jefe) =====
            inventario.length === 0 ? (
              <div className="flex flex-col items-center py-6">
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-2 text-emerald-200">
                  <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.02 0l1.41-1.41M6.34 6.34L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-stone-400 text-sm font-mono">No hay inventario asociado a prácticas abiertas.</span>
              </div>
            ) : (
              <div className="overflow-x-auto mb-2">
                <table className="min-w-full text-xs font-mono border rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-emerald-100 text-emerald-800">
                      <th className="px-3 py-2 border">ID</th>
                      <th className="px-3 py-2 border">Nombre</th>
                      <th className="px-3 py-2 border">Tipo</th>
                      <th className="px-3 py-2 border">Cantidad</th>
                      <th className="px-3 py-2 border">Unidad</th>
                      <th className="px-3 py-2 border">Ubicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventario.map(prod => (
                      <tr key={prod.id} className="border-b hover:bg-emerald-50/60 transition-colors">
                        <td className="px-3 py-2 border text-center">{prod.id}</td>
                        <td className="px-3 py-2 border">{prod.nombre}</td>
                        <td className="px-3 py-2 border text-center">{prod.tipo}</td>
                        <td className="px-3 py-2 border text-center">{prod.cantidad}</td>
                        <td className="px-3 py-2 border text-center">{prod.unidad}</td>
                        <td className="px-3 py-2 border">{prod.ubicacion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>

        {/* ========== GRÁFICOS ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {isUsuario ? (
            // ===== GRÁFICOS PARA USUARIO =====
            <>
              <LabSection
                title="ESTADO DE MIS PEDIDOS"
                subtitle="Distribución de tus solicitudes"
                icon={<BarChart3 className="h-4 w-4 text-emerald-600" />}
              >
                <div className="h-[280px]">
                  {chartsReady && userBarData.length > 0 && (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={userBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                          {userBarData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {userBarData.length === 0 && (
                    <div className="flex items-center justify-center h-full text-stone-400 text-sm font-mono">
                      No hay pedidos para mostrar
                    </div>
                  )}
                </div>
              </LabSection>

              <LabSection
                title="RESUMEN DE MIS PEDIDOS"
                subtitle="Distribución porcentual"
                icon={<ClipboardList className="h-4 w-4 text-emerald-600" />}
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="relative w-full max-w-[220px] h-[220px]">
                    {chartsReady && userDonutData.length > 0 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={userDonutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none" label={false} labelLine={false}>
                            {userDonutData.map((entry, idx) => (
                              <Cell key={idx} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold font-mono text-emerald-600">{misPedidos.length}</p>
                        <p className="text-[8px] text-stone-500 font-mono uppercase">TOTAL</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 w-full sm:w-auto">
                    {userDonutData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 rounded border border-stone-200 bg-stone-50 px-2 py-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-[10px] font-mono text-stone-500 truncate">{item.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-stone-700">{item.value} ({Math.round((item.value / (misPedidos.length || 1)) * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </LabSection>
            </>
          ) : (
            // ===== GRÁFICOS PARA ADMIN/JEFE =====
            <>
              <LabSection
                title="DISTRIBUCIÓN POR CATEGORÍA"
                subtitle="Stock actual por categoría"
                icon={<BarChart3 className="h-4 w-4 text-emerald-600" />}
                action={canExportReports && <><Download className="h-3 w-3" /> EXPORTAR</>}
                onActionClick={handleExportCategorias}
              >
                <div className="h-[280px]">
                  {chartsReady && barData.length > 0 && (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                        <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </LabSection>

              <LabSection
                title="ESTADO DE PEDIDOS"
                subtitle="Distribución de solicitudes"
                icon={<ClipboardList className="h-4 w-4 text-emerald-600" />}
                action={canExportReports && <><Download className="h-3 w-3" /> EXPORTAR</>}
                onActionClick={handleExportEstados}
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="relative w-full max-w-[220px] h-[220px]">
                    {chartsReady && donutData.length > 0 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none" label={false} labelLine={false}>
                            {donutData.map((entry, idx) => (
                              <Cell key={idx} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold font-mono text-emerald-600">{stats.totalPedidos}</p>
                        <p className="text-[8px] text-stone-500 font-mono uppercase">TOTAL</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 w-full sm:w-auto">
                    {donutData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 rounded border border-stone-200 bg-stone-50 px-2 py-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-[10px] font-mono text-stone-500 truncate">{item.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-stone-700">{item.value} ({Math.round((item.value / (stats.totalPedidos || 1)) * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </LabSection>
            </>
          )}
        </div>

        {/* ========== PEDIDOS RECIENTES ========== */}
        <LabSection
          title={isUsuario ? "MIS PEDIDOS RECIENTES" : "PEDIDOS RECIENTES"}
          subtitle={isUsuario ? "Últimas solicitudes realizadas" : "Últimas solicitudes del sistema"}
          icon={<ClipboardList className="h-4 w-4 text-emerald-600" />}
          action={<span className="text-emerald-600 hover:text-emerald-700">VER TODOS →</span>}
          onActionClick={handleVerTodos}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="pb-3 text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">CÓDIGO</th>
                  <th className="pb-3 text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">SOLICITANTE</th>
                  <th className="pb-3 text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">PRODUCTO</th>
                  <th className="pb-3 text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">CANT.</th>
                  <th className="pb-3 text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">ESTADO</th>
                  <th className="pb-3 text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">ACCIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-[10px] text-stone-400 font-mono">
                      {isUsuario ? 'No has realizado pedidos aún' : 'No hay pedidos recientes'}
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-emerald-50/50 transition-colors">
                      <td className="py-3 text-[11px] font-mono text-stone-500">{order.codigo}</td>
                      <td className="py-3 text-[11px] font-mono text-stone-600">{order.solicitante}</td>
                      <td className="py-3 text-[11px] font-mono text-stone-600">{order.producto}</td>
                      <td className="py-3 text-[11px] font-mono text-stone-500">{order.cantidad}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                          order.estado === 'aprobado' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          order.estado === 'rechazado' ? 'bg-rose-100 text-rose-600 border border-rose-200' :
                          'bg-amber-100 text-amber-600 border border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            order.estado === 'aprobado' ? 'bg-emerald-500 animate-pulse' :
                            order.estado === 'rechazado' ? 'bg-rose-500' : 'bg-amber-500'
                          }`} />
                          {order.estado.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3">
                        <button className="text-[10px] font-mono font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                          {order.estado === 'pendiente' ? 'REVISAR →' : 'DETALLES →'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </LabSection>
      </div>
    </Layout>
  );
}

export default Dashboard;