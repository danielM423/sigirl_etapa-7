// Panel del Jefe Superior - Estilo Laboratorio Claro + API Real
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Users, TrendingUp, BarChart3, Search, ChevronDown, Eye, Download,
  Plus, Edit2, Trash2, CheckCircle2, XCircle, Package, AlertCircle,
  FlaskConical, Shield, UserCheck, ClipboardList, RefreshCw,
  Clock, Activity
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell
} from 'recharts';
import Layout from '../components/Layout';
import PedidoHistorialList from '../components/PedidoHistorialList';
import PDFDocumentoList from '../components/PDFDocumentoList';
import AsistenciaList from '../components/AsistenciaList';
import ListadoDiarioList from '../components/ListadoDiarioList';
import ScrollReveal from '../components/ScrollReveal';
import { getProductos, getUsuarios, updateUsuario, deleteUsuario, getAuditoria, getPracticas, createPractica, updatePractica, deletePractica, aprobarPractica, rechazarPractica } from '../services/api';
import { exportToExcel } from '../utils/reportExport';

// ─── Design helpers ──────────────────────────────────────────────
const inputCls = 'w-full bg-stone-50 border border-[#E0E0E0] rounded-md px-3 py-2.5 text-sm font-mono text-stone-700 placeholder-stone-400 focus:outline-none focus:border-emerald-500 transition-colors';
const selectCls = `${inputCls} appearance-none cursor-pointer pr-8`;

const ESTADO_STYLES = {
  aprobado: 'bg-[#E8F5F0] text-[#1FA971] border border-[#1FA971]/25',
  pendiente: 'bg-amber-100 text-amber-400 border border-amber-200',
  rechazado: 'bg-rose-100 text-rose-400 border border-rose-200',
  ok: 'bg-[#E8F5F0] text-[#1FA971] border border-[#1FA971]/25',
  bajo_stock: 'bg-amber-100 text-amber-400 border border-amber-200',
  agotado: 'bg-rose-100 text-rose-400 border border-rose-200',
};

const EstadoBadge = ({ estado }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${ESTADO_STYLES[estado] || 'bg-stone-100 text-stone-500 border border-stone-200'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${estado === 'aprobado' || estado === 'ok' ? 'bg-emerald-400 animate-pulse' : estado === 'rechazado' || estado === 'agotado' ? 'bg-rose-400' : 'bg-amber-400'}`} />
    {estado}
  </span>
);

const StatCard = ({ label, value, icon, color = 'emerald' }) => {
  const colorMap = {
    emerald: 'border-[#1FA971]/25 text-[#1FA971] bg-[#E8F5F0]',
    amber: 'border-amber-200 text-amber-400 bg-amber-500/10',
    rose: 'border-rose-200 text-rose-400 bg-rose-500/10',
    blue: 'border-blue-200 text-blue-400 bg-blue-500/10',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
  };
  const [border, textCol, bg] = colorMap[color].split(' ');
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-lg p-4 hover:border-[#1FA971]/35 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider">{label}</span>
          <p className={`text-3xl font-bold font-mono mt-1 ${textCol}`}>{value}</p>
        </div>
        <div className={`p-2 rounded-md border ${border} ${bg}`}>{icon}</div>
      </div>
    </div>
  );
};

const LabSection = ({ title, children, action, onAction }) => (
  <div className="bg-white border border-[#E0E0E0] rounded-lg overflow-hidden">
    <div className="flex items-center justify-between px-5 py-3 border-b border-[#E0E0E0]">
      <span className="text-xs font-mono font-bold text-[#1FA971] uppercase tracking-wider">{title}</span>
      {action && (
        <button onClick={onAction} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono font-bold text-[#1FA971] bg-[#E8F5F0] border border-[#1FA971]/25 hover:bg-[#E8F5F0] transition-colors">
          {action}
        </button>
      )}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-md p-3 shadow-xl">
      <p className="font-mono font-bold text-[#1FA971] mb-1 text-[10px]">{label}</p>
      {payload.map((e, i) => (
        <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-stone-500">{e.name}:</span>
          <span className="font-bold text-[#1FA971]">{e.value}</span>
        </div>
      ))}
    </div>
  );
};

const JefeSuperiorDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [practicas, setPracticas] = useState([]);
  const [chartsReady, setChartsReady] = useState(false);
  const [editPractica, setEditPractica] = useState(null);
  const [formPractica, setFormPractica] = useState({ nombre: '', fecha: '', instructor: '', grupos_trabajo: '' });
  const [showUsuarioModal, setShowUsuarioModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [formUsuario, setFormUsuario] = useState({ nombre: '', email: '', departamento: '', rol: 'usuario' });
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const [auditoria, setAuditoria] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditModulo, setAuditModulo] = useState('');

  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    ['estadisticas', 'usuarios', 'inventario', 'bitacora', 'practicas'].includes(initialTab) ? initialTab : 'estadisticas'
  );

  const changeTab = (tab) => { setActiveTab(tab); setSearchParams({ tab }); };

  // ─── Load real API data ────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, usrRes, pracRes] = await Promise.all([
          getProductos(),
          getUsuarios().catch(() => ({ data: [] })),
          getPracticas()
        ]);
        setProductos((prodRes.data.results ?? prodRes.data).map(p => ({ ...p, categoria: p.categoria_nombre || String(p.categoria || '') })));
        const rawUsuarios = usrRes.data.results ?? usrRes.data;
        setUsuarios(rawUsuarios);
        setPracticas(pracRes.data.results ?? pracRes.data);
      } catch (err) {
        toast.error('Error al cargar datos del servidor');
        console.error(err);
      } finally {
        setLoading(false);
        requestAnimationFrame(() => setChartsReady(true));
      }
    };
    load();
  }, []);

  // ─── CRUD Prácticas ──────────────────────────────────────────
  const handleGuardarPractica = async () => {
    try {
      if (editPractica) {
        const { data } = await updatePractica(editPractica.id, formPractica);
        setPracticas(prev => prev.map(p => p.id === editPractica.id ? data : p));
        toast.success('Práctica actualizada');
      } else {
        const { data } = await createPractica(formPractica);
        setPracticas(prev => [data, ...prev]);
        toast.success('Práctica creada');
      }
      setEditPractica(null);
      setFormPractica({ nombre: '', fecha: '', instructor: '', grupos_trabajo: '' });
    } catch (err) {
      toast.error('Error al guardar práctica');
    }
  };

  const handleEditarPractica = (p) => {
    setEditPractica(p);
    setFormPractica({ nombre: p.nombre, fecha: p.fecha, instructor: p.instructor, grupos_trabajo: p.grupos_trabajo });
  };

  const handleEliminarPractica = async (id) => {
    if (!window.confirm('¿Eliminar esta práctica?')) return;
    try {
      await deletePractica(id);
      setPracticas(prev => prev.filter(p => p.id !== id));
      toast.success('Práctica eliminada');
    } catch { toast.error('Error al eliminar práctica'); }
  };

  const handleAprobarPractica = async (id) => {
    try {
      await aprobarPractica(id);
      setPracticas(prev => prev.map(p => p.id === id ? { ...p, estado: 'aprobado' } : p));
      toast.success('Práctica aprobada');
    } catch { toast.error('Error al aprobar práctica'); }
  };

  const handleRechazarPractica = async (id) => {
    try {
      await rechazarPractica(id, { motivo: 'Rechazado por jefe superior' });
      setPracticas(prev => prev.map(p => p.id === id ? { ...p, estado: 'rechazado' } : p));
      toast.success('Práctica rechazada');
    } catch { toast.error('Error al rechazar práctica'); }
  };

  // ─── Cargar bitácora cuando se activa ──────────────────────────
  useEffect(() => {
    if (activeTab !== 'bitacora') return;
    setAuditLoading(true);
    const params = {};
    if (auditSearch) params.search = auditSearch;
    if (auditModulo) params.modulo = auditModulo;
    getAuditoria(params)
      .then(res => setAuditoria(res.data.results ?? res.data))
      .catch(() => toast.error('Error al cargar bitácora'))
      .finally(() => setAuditLoading(false));
  }, [activeTab, auditSearch, auditModulo]);

  // ─── Filtros computados ────────────────────────────────────────
  useEffect(() => {
    const filtered = usuarios.filter(u => {
      const t = userSearchTerm.toLowerCase();
      return (u.username || u.nombre || '').toLowerCase().includes(t) ||
        (u.email || '').toLowerCase().includes(t) ||
        (u.department || u.departamento || '').toLowerCase().includes(t);
    });
    setFilteredUsuarios(filtered);
  }, [usuarios, userSearchTerm]);

  // ─── Usuario handlers ─────────────────────────────────────────
  const resetUsuarioForm = () => {
    setFormUsuario({ nombre: '', email: '', departamento: '', rol: 'usuario' });
    setSelectedUsuario(null);
  };

  const handleEditarUsuario = (u) => {
    setSelectedUsuario(u);
    setFormUsuario({
      nombre: u.username || u.nombre || '',
      email: u.email || '',
      departamento: u.department || u.departamento || '',
      rol: u.rol || 'usuario'
    });
    setShowUsuarioModal(true);
  };

  const handleGuardarUsuario = async () => {
    if (!formUsuario.nombre.trim() || !formUsuario.email.trim()) {
      toast.error('Completa nombre y email');
      return;
    }
    if (!formUsuario.email.includes('@')) {
      toast.error('Email inválido');
      return;
    }
    try {
      if (selectedUsuario) {
        const { data } = await updateUsuario(selectedUsuario.id, {
          username: formUsuario.nombre,
          email: formUsuario.email,
          nombre_input: formUsuario.nombre,
          departamento_input: formUsuario.departamento,
          rol_input: formUsuario.rol
        });
        setUsuarios(prev => prev.map(u => u.id === selectedUsuario.id ? { ...u, ...data } : u));
        toast.success('Usuario actualizado');
      }
      setShowUsuarioModal(false);
      resetUsuarioForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar usuario');
    }
  };

  const handleEliminarUsuario = async (id) => {
    const u = usuarios.find(x => x.id === id);
    if (!u || !window.confirm(`¿Eliminar a ${u.username || u.nombre}?`)) return;
    try {
      await deleteUsuario(id);
      setUsuarios(prev => prev.filter(x => x.id !== id));
      toast.success('Usuario eliminado');
    } catch { toast.error('Error al eliminar usuario'); }
  };

  const handleVerUsuario = (u) => {
    const lines = [
      `Usuario: ${u.username || u.nombre}`,
      `Email: ${u.email}`,
      `Departamento: ${u.department || u.departamento || '—'}`,
      `Rol: ${u.rol || 'usuario'}`
    ];
    toast.info(<div className="text-sm font-mono"><p className="font-bold mb-2 text-[#1FA971]">DETALLE USUARIO</p><div className="space-y-1">{lines.map((l, i) => <p key={i} className="text-stone-600">{l}</p>)}</div></div>, { autoClose: 6000 });
  };

  // ─── Computed stats ────────────────────────────────────────────
  const stats = useMemo(() => ({
    totalUsuarios: usuarios.length,
    totalProductos: productos.length,
    totalPracticas: practicas.length,
  }), [usuarios, productos, practicas]);

  const barData = useMemo(() => [
    { name: 'Usuarios', value: stats.totalUsuarios, fill: '#22c55e' },
    { name: 'Productos', value: stats.totalProductos, fill: '#f59e0b' },
    { name: 'Prácticas', value: stats.totalPracticas, fill: '#3b82f6' },
  ], [stats]);

  const TABS = [
    { key: 'estadisticas', label: 'ESTADÍSTICAS', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { key: 'usuarios', label: 'USUARIOS', icon: <Users className="w-3.5 h-3.5" /> },
    { key: 'inventario', label: 'INVENTARIO', icon: <Package className="w-3.5 h-3.5" /> },
    { key: 'practicas', label: 'PRÁCTICAS', icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { key: 'bitacora', label: 'BITÁCORA', icon: <RefreshCw className="w-3.5 h-3.5" /> },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_6px_#1FA971] animate-pulse mx-auto mb-3" />
            <p className="text-stone-500 font-mono text-sm">CARGANDO DATOS...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-[#1FA971]" />
                <span className="text-[10px] font-mono font-bold text-[#1FA971] uppercase tracking-wider">PANEL JEFE SUPERIOR</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#22c55e] animate-pulse" />
              </div>
              <h1 className="text-xl font-bold font-mono text-stone-700">Dashboard Ejecutivo</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#E8F5F0] text-[#1FA971] border border-[#1FA971]/25">{stats.totalUsuarios} usuarios</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-200">{stats.totalProductos} productos</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-200">{stats.totalPracticas} prácticas</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {TABS.map(t => (
                <button key={t.key} onClick={() => changeTab(t.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-mono font-bold transition-all ${activeTab === t.key
                    ? 'bg-emerald-500/15 border border-emerald-500/50 text-[#1FA971] shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                    : 'bg-stone-50 border border-[#E0E0E0] text-stone-500 hover:text-stone-600 hover:border-slate-500'
                    }`}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── ESTADÍSTICAS ─────────────────────────────────────── */}
        {activeTab === 'estadisticas' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard label="Total Usuarios" value={stats.totalUsuarios} icon={<Users className="w-4 h-4" />} color="blue" />
              <StatCard label="Total Productos" value={stats.totalProductos} icon={<Package className="w-4 h-4" />} color="emerald" />
              <StatCard label="Total Prácticas" value={stats.totalPracticas} icon={<ClipboardList className="w-4 h-4" />} color="purple" />
            </div>

            <div className="bg-white border border-[#E0E0E0] rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-[#E0E0E0]">
                <span className="text-xs font-mono font-bold text-[#1FA971] uppercase tracking-wider">RESUMEN GENERAL</span>
              </div>
              <div className="p-5 h-64">
                {chartsReady && (
                  <ResponsiveContainer width="100%" height={216}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F0F4F2' }} />
                      <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── USUARIOS ─────────────────────────────────────────── */}
        {activeTab === 'usuarios' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Total Usuarios" value={stats.totalUsuarios} icon={<Users className="w-4 h-4" />} color="blue" />
              <StatCard label="Administradores" value={usuarios.filter(u => u.is_staff && !u.is_superuser).length} icon={<Shield className="w-4 h-4" />} color="purple" />
              <StatCard label="Activos" value={usuarios.filter(u => u.is_active !== false).length} icon={<UserCheck className="w-4 h-4" />} color="emerald" />
            </div>

            <LabSection title="GESTIÓN DE USUARIOS" action={<><Plus className="w-3 h-3" /> NUEVO</>} onAction={() => { resetUsuarioForm(); setShowUsuarioModal(true); }}>
              <div className="mb-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                  <input type="text" placeholder="Buscar usuario..." value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} className={`${inputCls} pl-9`} />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      {['USUARIO', 'EMAIL', 'DEPARTAMENTO', 'ROL', 'ACCIONES'].map(h => (
                        <th key={h} className="pb-3 text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E0E0]">
                    {filteredUsuarios.length === 0 ? (
                      <tr><td colSpan={5} className="py-10 text-center text-stone-400 font-mono text-sm">Sin usuarios</td></tr>
                    ) : (
                      filteredUsuarios.map(u => (
                        <tr key={u.id} className="hover:bg-[#E8F5F0]/60 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#E8F5F0] border border-[#1FA971]/25 flex items-center justify-center text-[10px] font-mono font-bold text-[#1FA971]">
                                {(u.username || u.nombre || '?').slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm font-mono text-stone-700">{u.username || u.nombre}</span>
                            </div>
                          </td>
                          <td className="py-3 text-[11px] font-mono text-stone-500">{u.email || '—'}</td>
                          <td className="py-3 text-[11px] font-mono text-stone-500">{u.department || u.departamento || '—'}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${u.is_superuser ? 'bg-purple-100 text-purple-400 border border-purple-500/30' : u.is_staff ? 'bg-blue-100 text-blue-400 border border-blue-200' : 'bg-[#E8F5F0] text-[#1FA971] border border-[#1FA971]/25'}`}>
                              {u.is_superuser ? 'Jefe' : u.is_staff ? 'Admin' : 'Usuario'}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleVerUsuario(u)} className="p-1.5 text-stone-500 hover:text-stone-600 hover:bg-stone-100 rounded transition-colors" title="Ver"><Eye className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleEditarUsuario(u)} className="p-1.5 text-stone-500 hover:text-[#1FA971] hover:bg-[#E8F5F0] rounded transition-colors" title="Editar"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleEliminarUsuario(u.id)} className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </LabSection>
          </div>
        )}

        {/* ── INVENTARIO ────────────────────────────────────────────── */}
        {activeTab === 'inventario' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Total Productos" value={productos.length} icon={<Package className="w-4 h-4" />} color="blue" />
              <StatCard label="Bajo Stock" value={productos.filter(p => p.estado === 'bajo_stock').length} icon={<AlertCircle className="w-4 h-4" />} color="amber" />
              <StatCard label="Agotados" value={productos.filter(p => p.estado === 'agotado').length} icon={<XCircle className="w-4 h-4" />} color="rose" />
            </div>

            <LabSection title="INVENTARIO DE REACTIVOS">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      {['PRODUCTO', 'CATEGORÍA', 'CANT.', 'UMBRAL', 'UBICACIÓN', 'ESTADO'].map(h => (
                        <th key={h} className="pb-3 text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E0E0]">
                    {productos.length === 0 ? (
                      <tr><td colSpan={6} className="py-10 text-center text-stone-400 font-mono text-sm">Sin productos</td></tr>
                    ) : (
                      productos.map(p => (
                        <tr key={p.id} className="hover:bg-[#E8F5F0]/60 transition-colors">
                          <td className="py-3 text-sm font-mono font-semibold text-stone-700">{p.nombre}</td>
                          <td className="py-3"><span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">{p.categoria}</span></td>
                          <td className="py-3"><span className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold font-mono text-sm ${p.cantidad <= p.umbral_minimo ? 'bg-amber-100 text-amber-400' : 'bg-[#E8F5F0] text-[#1FA971]'}`}>{p.cantidad}</span></td>
                          <td className="py-3 text-[11px] font-mono text-stone-500">{p.umbral_minimo}</td>
                          <td className="py-3 text-[11px] font-mono text-stone-500">{p.ubicacion}</td>
                          <td className="py-3"><EstadoBadge estado={p.estado} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </LabSection>
          </div>
        )}

        {/* ── PRÁCTICAS ───────────────────────────────────────────── */}
        {activeTab === 'practicas' && (
          <div className="space-y-4">
            <LabSection title="LISTADO DE PRÁCTICAS" action={<><Plus className="w-3 h-3" /> NUEVA PRÁCTICA</>} onAction={() => { setEditPractica(null); setFormPractica({ nombre: '', fecha: '', instructor: '', grupos_trabajo: '' }); }}>
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full text-xs font-mono border">
                  <thead>
                    <tr className="bg-stone-100">
                      <th className="px-2 py-1 border">ID</th>
                      <th className="px-2 py-1 border">Nombre</th>
                      <th className="px-2 py-1 border">Fecha</th>
                      <th className="px-2 py-1 border">Instructor</th>
                      <th className="px-2 py-1 border">Grupos</th>
                      <th className="px-2 py-1 border">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {practicas.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-2 text-stone-400">No hay prácticas registradas</td></tr>
                    ) : (
                      practicas.map(prac => (
                        <tr key={prac.id} className="border-b">
                          <td className="px-2 py-1 border">{prac.id}</td>
                          <td className="px-2 py-1 border">{prac.nombre}</td>
                          <td className="px-2 py-1 border">{prac.fecha}</td>
                          <td className="px-2 py-1 border">{prac.instructor_nombre || prac.instructor}</td>
                          <td className="px-2 py-1 border">{prac.grupos_trabajo}</td>
                          <td className="px-2 py-1 border space-x-2">
                            <button onClick={() => handleEditarPractica(prac)} className="px-2 py-1 bg-blue-500/20 text-blue-700 rounded hover:bg-blue-500/40">Editar</button>
                            <button onClick={() => handleEliminarPractica(prac.id)} className="px-2 py-1 bg-rose-500/20 text-rose-700 rounded hover:bg-rose-500/40">Eliminar</button>
                            <button onClick={() => handleAprobarPractica(prac.id)} className="px-2 py-1 bg-emerald-500/20 text-emerald-700 rounded hover:bg-emerald-500/40">Aprobar</button>
                            <button onClick={() => handleRechazarPractica(prac.id)} className="px-2 py-1 bg-amber-500/20 text-amber-700 rounded hover:bg-amber-500/40">Rechazar</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-stone-50 border border-[#E0E0E0] rounded-lg p-4 max-w-xl mx-auto">
                <h3 className="text-sm font-mono font-bold text-stone-700 mb-3">{editPractica ? 'EDITAR PRÁCTICA' : 'CREAR NUEVA PRÁCTICA'}</h3>
                <div className="flex flex-col gap-2">
                  <input className={inputCls} placeholder="Nombre" value={formPractica.nombre} onChange={e => setFormPractica(f => ({ ...f, nombre: e.target.value }))} />
                  <input className={inputCls} placeholder="Fecha" type="date" value={formPractica.fecha} onChange={e => setFormPractica(f => ({ ...f, fecha: e.target.value }))} />
                  <input className={inputCls} placeholder="Instructor" value={formPractica.instructor} onChange={e => setFormPractica(f => ({ ...f, instructor: e.target.value }))} />
                  <input className={inputCls} placeholder="Grupos de trabajo" type="number" value={formPractica.grupos_trabajo} onChange={e => setFormPractica(f => ({ ...f, grupos_trabajo: e.target.value }))} />
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleGuardarPractica} className="px-4 py-2 bg-emerald-500/80 text-white rounded hover:bg-emerald-600">{editPractica ? 'Actualizar' : 'Crear'}</button>
                    {editPractica && (
                      <button onClick={() => { setEditPractica(null); setFormPractica({ nombre: '', fecha: '', instructor: '', grupos_trabajo: '' }); }} className="px-4 py-2 bg-stone-300 text-stone-700 rounded hover:bg-stone-400">Cancelar</button>
                    )}
                  </div>
                </div>
              </div>
            </LabSection>
          </div>
        )}

        {/* ── BITÁCORA ─────────────────────────────────────────── */}
        {activeTab === 'bitacora' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Registros totales" value={auditoria.length} icon={<Activity className="w-4 h-4" />} color="blue" />
              <StatCard label="Acciones hoy" value={auditoria.filter(a => a.fecha?.startsWith(new Date().toISOString().slice(0, 10))).length} icon={<Clock className="w-4 h-4" />} color="amber" />
              <StatCard label="Módulos activos" value={[...new Set(auditoria.map(a => a.modulo).filter(Boolean))].length} icon={<RefreshCw className="w-4 h-4" />} color="emerald" />
            </div>

            <LabSection
              title="BITÁCORA DE AUDITORÍA"
              action={<><Download className="w-3 h-3" /> EXPORTAR</>}
              onAction={() => exportToExcel(auditoria.map(a => ({ usuario: a.usuario, accion: a.accion, modulo: a.modulo, descripcion: a.descripcion, fecha: a.fecha })), 'bitacora.xlsx') && toast.success('Exportado')}
            >
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                  <input type="text" placeholder="Buscar usuario, acción..." value={auditSearch} onChange={e => setAuditSearch(e.target.value)} className={`${inputCls} pl-9`} />
                </div>
                <div className="relative w-full md:w-44">
                  <select value={auditModulo} onChange={e => setAuditModulo(e.target.value)} className={selectCls}>
                    <option value="">Todos los módulos</option>
                    {[...new Set(auditoria.map(a => a.modulo).filter(Boolean))].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" />
                </div>
              </div>

              {auditLoading ? (
                <div className="py-10 text-center text-stone-500 font-mono text-sm">Cargando bitácora...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E0E0E0]">
                        {['USUARIO', 'ACCIÓN', 'MÓDULO', 'DESCRIPCIÓN', 'FECHA'].map(h => (
                          <th key={h} className="pb-3 text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E0E0]">
                      {auditoria.length === 0 ? (
                        <tr><td colSpan={5} className="py-10 text-center text-stone-400 font-mono text-sm">Sin registros de auditoría</td></tr>
                      ) : (
                        auditoria.map((a, i) => (
                          <tr key={a.id || i} className="hover:bg-[#E8F5F0]/60 transition-colors">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[9px] font-mono font-bold text-blue-400">
                                  {String(a.usuario || '?').slice(0, 2).toUpperCase()}
                                </div>
                                <span className="text-[11px] font-mono text-stone-600">{a.usuario || 'Sistema'}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${a.accion === 'crear' || a.accion === 'create' ? 'bg-[#E8F5F0] text-[#1FA971] border border-[#1FA971]/25' : a.accion === 'eliminar' || a.accion === 'delete' ? 'bg-rose-100 text-rose-400 border border-rose-200' : 'bg-amber-100 text-amber-400 border border-amber-200'}`}>{a.accion || '—'}</span>
                            </td>
                            <td className="py-3"><span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">{a.modulo || '—'}</span></td>
                            <td className="py-3 text-[11px] font-mono text-stone-500 max-w-xs truncate">{a.descripcion || '—'}</td>
                            <td className="py-3 text-[10px] font-mono text-stone-500">{a.fecha ? new Date(a.fecha).toLocaleString('es-CO') : '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </LabSection>
          </div>
        )}

        {/* ── MODAL USUARIO ──────────────────────────────────────── */}
        {showUsuarioModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border border-[#E0E0E0] rounded-lg overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0]">
                <div>
                  <h2 className="text-sm font-mono font-bold text-[#1FA971] uppercase tracking-wider">{selectedUsuario ? 'EDITAR USUARIO' : 'NUEVO USUARIO'}</h2>
                  <p className="text-[10px] font-mono text-stone-500 mt-0.5">Modifica los datos del usuario</p>
                </div>
                <button onClick={() => { setShowUsuarioModal(false); resetUsuarioForm(); }} className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"><XCircle className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1.5">Usuario</label>
                  <input type="text" value={formUsuario.nombre} onChange={e => setFormUsuario({ ...formUsuario, nombre: e.target.value })} className={inputCls} placeholder="nombre_usuario" />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input type="email" value={formUsuario.email} onChange={e => setFormUsuario({ ...formUsuario, email: e.target.value })} className={inputCls} placeholder="correo@ejemplo.com" />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1.5">Departamento</label>
                  <input type="text" value={formUsuario.departamento} onChange={e => setFormUsuario({ ...formUsuario, departamento: e.target.value })} className={inputCls} placeholder="Laboratorio General" />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1.5">Rol</label>
                  <select value={formUsuario.rol} onChange={e => setFormUsuario({ ...formUsuario, rol: e.target.value })} className={selectCls}>
                    <option value="usuario">Usuario</option>
                    <option value="admin">Admin</option>
                    <option value="jefe">Jefe</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E0E0E0] bg-stone-50">
                <button onClick={() => { setShowUsuarioModal(false); resetUsuarioForm(); }} className="px-4 py-2 rounded text-xs font-mono font-bold border border-[#E0E0E0] text-stone-500 hover:text-stone-700 hover:border-slate-500 transition-colors">Cancelar</button>
                <button onClick={handleGuardarUsuario} className="px-4 py-2 rounded text-xs font-mono font-bold bg-[#1FA971] text-white hover:bg-[#157A55] transition-colors shadow-sm">Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* INTEGRACIÓN RFs para presentación */}
      <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 my-4">
        <h2 className="text-lg font-bold mb-2 text-emerald-700">RF-034: Historial de Pedidos</h2>
        <PedidoHistorialList />
      </div>
      <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 my-4">
        <h2 className="text-lg font-bold mb-2 text-emerald-700">RF-039: PDFs Almacenados</h2>
        <PDFDocumentoList />
      </div>
      <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 my-4">
        <h2 className="text-lg font-bold mb-2 text-emerald-700">RF-055: Asistencias</h2>
        <AsistenciaList />
      </div>
      <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 my-4">
        <h2 className="text-lg font-bold mb-2 text-emerald-700">RF-056: Listados Diarios</h2>
        <ListadoDiarioList />
      </div>
    </Layout>
  );
};

export default JefeSuperiorDashboard;