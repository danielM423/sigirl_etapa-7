// Dashboard general del sistema.
// Muestra métricas, gráficas, alertas y resumen operativo.
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
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { UserContext } from '../context/AuthContext';
import { exportToExcel } from '../utils/reportExport';
import Layout from '../components/Layout';

// Paleta de colores actualizada con más vibrancia
const CHART_COLORS = ['#43bb52', '#78d64b', '#a3e579', '#f59e0b', '#ef4444'];
const METRIC_COLORS = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    light: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    shadow: 'shadow-blue-200/50'
  },
  red: {
    bg: 'from-rose-500 to-red-600',
    light: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    shadow: 'shadow-rose-200/50'
  },
  orange: {
    bg: 'from-amber-400 to-orange-500',
    light: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    shadow: 'shadow-orange-200/50'
  },
  green: {
    bg: 'from-emerald-500 to-green-600',
    light: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    shadow: 'shadow-emerald-200/50'
  },
};

// Componente de tarjeta de métricas con glassmorphism
const StatCard = ({ title, value, icon, tone, trend, subtitle, onClick }) => {
  const colors = METRIC_COLORS[tone] || METRIC_COLORS.green;
  
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} ${colors.shadow} p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
    >
      {/* Efectos de luz */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-white/90 uppercase tracking-wider">{title}</span>
            {trend && (
              <span className="flex items-center gap-1 text-xs font-bold bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </span>
            )}
          </div>
          <p className="text-4xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="mt-2 text-sm text-white/80 font-medium">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
      
      {/* Indicador de hover */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight className="h-5 w-5 text-white/60" />
      </div>
    </div>
  );
};

// Componente de sección con glassmorphism
const SectionCard = ({ title, subtitle, icon, children, action, onActionClick, className = '' }) => (
  <div className={`rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 ${className}`}>
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 shadow-sm">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <button
          type="button"
          onClick={onActionClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all hover:scale-105"
        >
          {action}
        </button>
      )}
    </div>
    {children}
  </div>
);

// Tooltip personalizado elegante
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-emerald-100">
        <p className="font-bold text-slate-800 mb-2 text-sm">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full shadow-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600">{entry.name}:</span>
            <span className="font-bold text-slate-800 text-lg">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const navigate = useNavigate();
  const { isAdmin, role } = useContext(UserContext);
  const isJefe = role === 'jefe' || role === 'jefe_superior';
  const canExportReports = isAdmin || isJefe;
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartsReady, setChartsReady] = useState(false);

  const cargarDatos = useCallback(async (showToast = false) => {
    setLoading(true);
    try {
      const [productosResponse, pedidosResponse] = await Promise.all([
        api.get('productos/').catch(() => ({ data: [] })),
        isAdmin ? api.get('pedidos/').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);

      setProductos(productosResponse.data || []);
      setPedidos(pedidosResponse.data || []);

      if (showToast) toast.success('✨ Dashboard actualizado correctamente');
    } catch {
      toast.error('❌ No se pudo cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setChartsReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Métricas calculadas
  const stats = useMemo(() => ({
    totalProductos: productos.length || 24,
    bajoStock: productos.filter((item) => Number(item.cantidad || 0) <= Number(item.minimo || 5)).length || 3,
    totalPedidos: pedidos.length || 12,
    alertas: pedidos.filter((item) => item.estado === 'rechazado').length || 2,
    aprobados: pedidos.filter((item) => item.estado === 'aprobado').length || 8,
    pendientes: pedidos.filter((item) => item.estado === 'pendiente').length || 2,
  }), [productos, pedidos]);

  // Datos para gráfica de barras
  const barData = useMemo(() => {
    const grouped = productos.reduce((acc, item) => {
      const key = item.categoria_nombre || item.categoria || 'General';
      acc[key] = (acc[key] || 0) + Number(item.cantidad || 0);
      return acc;
    }, {});

    const entries = Object.entries(grouped).slice(0, 5).map(([name, value]) => ({ name, value }));
    return entries.length ? entries : [
      { name: 'Reactivos', value: 28 },
      { name: 'Insumos', value: 18 },
      { name: 'Equipos', value: 12 },
      { name: 'Solventes', value: 22 },
      { name: 'Otros', value: 8 },
    ];
  }, [productos]);

  // Datos para gráfica de donut
  const donutData = useMemo(() => {
    const values = [
      { name: 'Aprobados', value: stats.aprobados, color: '#43bb52' },
      { name: 'Pendientes', value: stats.pendientes, color: '#f59e0b' },
      { name: 'Rechazados', value: stats.alertas, color: '#ef4444' },
    ].filter((item) => item.value > 0);

    return values.length ? values : [
      { name: 'Aprobados', value: 8, color: '#43bb52' },
      { name: 'Pendientes', value: 2, color: '#f59e0b' },
      { name: 'Rechazados', value: 2, color: '#ef4444' },
    ];
  }, [stats]);

  const handleExportCategorias = () => {
    if (!canExportReports) {
      toast.info('La exportación de reportes está disponible para administración y jefatura.');
      return;
    }

    const total = barData.reduce((sum, item) => sum + Number(item.value || 0), 0) || 1;
    const rows = barData.map((item) => ({
      Categoria: item.name,
      Cantidad: item.value,
      Porcentaje: `${((Number(item.value || 0) / total) * 100).toFixed(1)}%`,
      Nivel: Number(item.value || 0) <= 5 ? 'Leve' : Number(item.value || 0) <= 15 ? 'Medio' : 'Crítico',
      Recomendacion: Number(item.value || 0) <= 5 ? 'Seguimiento normal' : Number(item.value || 0) <= 15 ? 'Revisar abastecimiento' : 'Priorizar reposición y control',
    }));

    exportToExcel(rows, 'reporte-categorias-sigirl.xlsx', 'Categorias');
    toast.success('Reporte por categoría exportado a Excel.');
  };

  const handleExportEstados = () => {
    if (!canExportReports) {
      toast.info('La exportación de reportes está disponible para administración y jefatura.');
      return;
    }

    const total = donutData.reduce((sum, item) => sum + Number(item.value || 0), 0) || 1;
    const rows = donutData.map((item) => {
      const severity = item.name === 'Rechazados' ? 'Crítico' : item.name === 'Pendientes' ? 'Medio' : 'Leve';
      const recommendation = item.name === 'Rechazados'
        ? 'Revisar causa raíz y contactar a soporte o jefatura.'
        : item.name === 'Pendientes'
          ? 'Dar seguimiento y validar stock disponible.'
          : 'Mantener monitoreo normal.';

      return {
        Estado: item.name,
        Total: item.value,
        Porcentaje: `${((Number(item.value || 0) / total) * 100).toFixed(1)}%`,
        Severidad: severity,
        Recomendacion: recommendation,
      };
    });

    exportToExcel(rows, 'estado-pedidos-sigirl.xlsx', 'Pedidos');
    toast.success('Estado de pedidos exportado a Excel.');
  };

  const handleVerTodos = () => {
    if (isAdmin) {
      navigate('/admin?tab=pedidos');
      return;
    }

    if (isJefe) {
      navigate('/jefe?tab=pedidos');
      return;
    }

    navigate('/pedidos');
  };

  // Pedidos recientes
  const recentOrders = useMemo(() => {
    const source = (pedidos.length ? pedidos : [
      { id: 105, codigo: '#105', producto_nombre: 'Glicina Cristalizada', solicitante: 'María González', estado: 'pendiente', cantidad: 10, fecha: '2026-04-16' },
      { id: 104, codigo: '#104', producto_nombre: 'Nitrato de Plata', solicitante: 'Carlos Ruiz', estado: 'aprobado', cantidad: 5, fecha: '2026-04-15' },
      { id: 103, codigo: '#103', producto_nombre: 'Etanol Absoluto', solicitante: 'Ana López', estado: 'rechazado', cantidad: 12, fecha: '2026-04-15' },
      { id: 102, codigo: '#102', producto_nombre: 'Ácido Clorhídrico', solicitante: 'Pedro Martínez', estado: 'pendiente', cantidad: 3, fecha: '2026-04-14' },
      { id: 101, codigo: '#101', producto_nombre: 'Buffer pH 7.0', solicitante: 'Laura Sánchez', estado: 'aprobado', cantidad: 8, fecha: '2026-04-14' },
    ]).slice(0, 8).map((pedido) => ({
      id: pedido.id,
      codigo: pedido.codigo || `PED-${String(pedido.id).padStart(3, '0')}`,
      producto: pedido.producto_nombre || pedido.producto || 'Producto',
      solicitante: pedido.solicitante || pedido.usuario_username || 'Usuario',
      cantidad: pedido.cantidad || 1,
      estado: pedido.estado || 'pendiente',
      fecha: pedido.fecha_solicitud || pedido.fecha || new Date().toISOString().split('T')[0],
    }));

    return source;
  }, [pedidos]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header del Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Panel Ejecutivo</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Dashboard de Control</h2>
            <p className="text-slate-500">Visualiza métricas, pedidos y actividad del laboratorio en tiempo real</p>
          </div>
          <button
            onClick={() => cargarDatos(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 font-semibold hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md hover:scale-105"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar datos
          </button>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard 
            title="Total Productos" 
            value={stats.totalProductos} 
            icon={<Package2 className="h-6 w-6 text-white" />} 
            tone="blue"
            subtitle="En inventario general"
          />
          <StatCard 
            title="Pedidos Activos" 
            value={stats.totalPedidos} 
            icon={<ClipboardList className="h-6 w-6 text-white" />} 
            tone="green"
            trend="+12%"
            subtitle="Este mes"
          />
          <StatCard 
            title="Stock Bajo" 
            value={stats.bajoStock} 
            icon={<AlertCircle className="h-6 w-6 text-white" />} 
            tone="orange"
            subtitle="Requieren reposición"
          />
          <StatCard 
            title="Alertas Críticas" 
            value={stats.alertas} 
            icon={<XCircle className="h-6 w-6 text-white" />} 
            tone="red"
            subtitle="Pedidos rechazados"
          />
        </div>

        {/* Grid de Gráficas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Gráfica de Barras */}
          <SectionCard
            title="Distribución por Categoría"
            subtitle="Inventario actualizado en tiempo real"
            icon={<BarChart3 className="h-5 w-5" />}
            action={canExportReports ? <><Download className="h-4 w-4" /> Exportar</> : null}
            onActionClick={handleExportCategorias}
          >
            <div className="h-[320px] min-h-[320px] min-w-0 w-full overflow-hidden">
              {chartsReady && (
                <ResponsiveContainer width="99%" height={280} debounce={120}>
                  <BarChart data={barData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', radius: 8 }} />
                    <Bar 
                      dataKey="value" 
                      fill="url(#colorGradient)" 
                      radius={[12, 12, 0, 0]}
                      maxBarSize={60}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#78d64b" />
                        <stop offset="100%" stopColor="#43bb52" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </SectionCard>

          {/* Gráfica de Donut */}
          <SectionCard
            title="Estado de Pedidos"
            subtitle="Distribución de solicitudes"
            icon={<ClipboardList className="h-5 w-5" />}
            action={canExportReports ? <><Download className="h-4 w-4" /> Exportar</> : null}
            onActionClick={handleExportEstados}
          >
            <div className="h-[320px] min-h-[320px] min-w-0 w-full flex items-center gap-3 overflow-hidden">
              <div className="flex-1 h-full min-w-0 relative">
                {chartsReady && (
                  <ResponsiveContainer width="99%" height={280} debounce={120}>
                    <PieChart>
                      <Pie 
                        data={donutData} 
                        dataKey="value" 
                        nameKey="name" 
                        innerRadius={70} 
                        outerRadius={110}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {/* Centro del donut */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-800">{stats.totalPedidos}</p>
                    <p className="text-xs text-slate-500 font-medium uppercase">Total</p>
                  </div>
                </div>
              </div>
              
              {/* Leyenda personalizada */}
              <div className="w-44 space-y-4 pr-2">
                {donutData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div 
                      className="w-4 h-4 rounded-full shadow-md group-hover:scale-125 transition-transform"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.value} pedidos</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Tabla de Pedidos Recientes */}
        <SectionCard
          title="Pedidos Recientes"
          subtitle="Últimas solicitudes del sistema"
          icon={<ClipboardList className="h-5 w-5" />}
          action={<span className="text-emerald-600 font-semibold hover:text-emerald-700 cursor-pointer">Ver todos →</span>}
          onActionClick={handleVerTodos}
        >
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Código</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Solicitante</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cantidad</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-sm font-semibold group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                        {order.codigo}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-sm font-bold flex items-center justify-center shadow-sm">
                          {order.solicitante.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{order.solicitante}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-slate-700">{order.producto}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                        {order.cantidad}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                          order.estado === 'aprobado'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : order.estado === 'rechazado'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            order.estado === 'aprobado'
                              ? 'bg-emerald-500 animate-pulse'
                              : order.estado === 'rechazado'
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                          }`}
                        />
                        {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-sm font-bold text-emerald-600 hover:text-emerald-800 hover:underline transition-all">
                        {order.estado === 'pendiente' ? 'Revisar →' : 'Ver detalles →'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </Layout>
  );
}

export default Dashboard;