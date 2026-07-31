import { useEffect, useContext, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Package,
  FileText,
  LogOut,
  BarChart3,
  Users,
  Settings,
  AlertTriangle,
  Boxes,
  ClipboardList,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { UserContext } from '../context/UserContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role: rawRole, logout, user } = useContext(UserContext);
  // Normaliza el rol a minúsculas y sin espacios
  const role = (rawRole || '').toLowerCase().replace(/\s+/g, '');
  console.log('ROL ACTUAL:', role);
  const [openSection, setOpenSection] = useState('inventario');
  const currentTab = new URLSearchParams(location.search).get('tab');
  
  // ========== NUEVO: ESTADO PARA EL CONTADOR ==========
  const [aprobacionesPendientes, setAprobacionesPendientes] = useState(0);

  // ========== NUEVO: FUNCIÓN PARA CONTAR PEDIDOS ==========
  const contarAprobacionesPendientes = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      const res = await fetch('http://127.0.0.1:8000/api/pedidos-requieren-aprobacion/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAprobacionesPendientes(data.length);
      }
    } catch (error) {
      console.error('Error contando aprobaciones:', error);
    }
  };

  // ========== NUEVO: EFECTO PARA CARGAR EL CONTADOR ==========
  useEffect(() => {
    contarAprobacionesPendientes();
    // Actualizar cada 30 segundos
    const interval = setInterval(contarAprobacionesPendientes, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = useMemo(() => {
    switch (role) {
      case 'admin':
        return [
          { path: '/admin?tab=inventario', label: 'Dashboard', icon: Home, description: 'Panel principal' },
          {
            key: 'inventario',
            label: 'Inventario',
            icon: Package,
            description: 'Stock y alertas',
            children: [
              { path: '/admin?tab=inventario', label: 'Vista general', icon: Boxes },
              { path: '/inventario', label: 'Reactivos', icon: Package },
              { path: '/admin?tab=inventario', label: 'Alertas', icon: AlertTriangle },
            ],
          },
          { path: '/admin?tab=practicas', label: 'Prácticas', icon: ClipboardList, description: 'Gestión de prácticas' },
          { path: '/admin?tab=pedidos', label: 'Pedidos', icon: ClipboardList, description: 'Aprobaciones' },
          { path: '/usuarios', label: 'Usuarios', icon: Users, description: 'Gestión de usuarios' },
          { path: '/perfil', label: 'Configuración', icon: Settings, description: 'Mi perfil' },
          { path: '/sustancias-controladas', label: 'Sustancias Controladas', icon: AlertTriangle, description: 'Reporte de reactivos sensibles' },
          { path: '/programas', label: 'Programas', icon: FileText, description: 'Gestión de programas' },
          { path: '/competencias', label: 'Competencias', icon: FileText, description: 'Gestión de competencias' },
          { path: '/selector-practica', label: 'Generar Solicitud', icon: ClipboardList, description: 'Solicitud automática' },
          { path: '/practicas/gestion', label: 'Gestionar Prácticas', icon: ClipboardList, description: 'CRUD de prácticas' },
        ];
      case 'jefe':
      case 'jefesuperior':
        return [
          { path: '/jefe?tab=estadisticas', label: 'Dashboard', icon: BarChart3, description: 'Resumen general' },
          {
            key: 'inventario',
            label: 'Inventario',
            icon: Package,
            description: 'Control del stock',
            children: [
              { path: '/inventario', label: 'Ver inventario', icon: Boxes },
              { path: '/jefe?tab=pedidos', label: 'Movimientos', icon: ClipboardList },
              { path: '/inventario', label: 'Alertas', icon: AlertTriangle },
            ],
          },
          { path: '/sustancias-controladas', label: 'Sustancias Controladas', icon: AlertTriangle, description: 'Reporte de reactivos sensibles' },
          { path: '/jefe?tab=practicas', label: 'Prácticas', icon: ClipboardList, description: 'Gestión de prácticas' },
          { path: '/jefe?tab=pedidos', label: 'Pedidos', icon: FileText, description: 'CRUD completa' },
          { path: '/usuarios', label: 'Usuarios', icon: Users, description: 'Gestión de usuarios' },
          { path: '/perfil', label: 'Configuración', icon: Settings, description: 'Mi perfil' },
          { path: '/programas', label: 'Programas', icon: FileText, description: 'Gestión de programas' },
          { path: '/competencias', label: 'Competencias', icon: FileText, description: 'Gestión de competencias' },
          { path: '/selector-practica', label: 'Generar Solicitud', icon: ClipboardList, description: 'Solicitud automática' },
          { path: '/practicas/gestion', label: 'Gestionar Prácticas', icon: ClipboardList, description: 'CRUD de prácticas' },
          { 
            path: '/aprobaciones-jefe', 
            label: 'Aprobar Excepciones', 
            icon: AlertTriangle, 
            description: 'Pedidos que requieren aprobación',
            badge: aprobacionesPendientes
          },
        ];
      case 'usuario':
        return [
          { path: '/usuario', label: 'Dashboard', icon: Home, description: 'Inicio personal' },
          {
            key: 'inventario',
            label: 'Inventario',
            icon: Package,
            description: 'Consulta rápida',
            children: [
              { path: '/inventario', label: 'Productos', icon: Boxes },
              { path: '/inventario', label: 'Alertas', icon: AlertTriangle },
            ],
          },
          { path: '/usuario', label: 'Pedidos', icon: ClipboardList, description: 'Mis solicitudes' },
          { path: '/usuarios', label: 'Usuarios', icon: Users, description: 'Gestión de usuarios' },
          { path: '/perfil', label: 'Configuración', icon: Settings, description: 'Mi perfil' },
          { path: '/selector-practica', label: 'Generar Solicitud', icon: ClipboardList, description: 'Solicitud automática' },
        ];
      default:
        return [];
    }
  }, [role, aprobacionesPendientes]);

  const isRouteActive = (path) => {
    const [pathname, search] = path.split('?');

    if (location.pathname !== pathname) return false;
    if (!search) return true;

    const targetTab = new URLSearchParams(search).get('tab');
    return targetTab ? currentTab === targetTab : true;
  };

  const isGroupActive = (children = []) => children.some((child) => isRouteActive(child.path));

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search, setIsOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-80 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 text-white flex flex-col z-40 transition-transform duration-300 ease-in-out transform border-r border-emerald-500/20 shadow-2xl shadow-cyan-950/40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="p-5 border-b border-emerald-500/20 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <span className="text-white font-bold text-lg">✓</span>
            </div>
            <div>
              <h1 className="font-bold text-2xl bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">SIGIRL</h1>
              <p className="text-sm text-emerald-400/80 font-semibold">v1.0 Pro</p>
            </div>
          </div>
        </div>

        <div className="p-3 mx-3 mt-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-emerald-500/20 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
              <span className="font-bold text-sm text-slate-900">{(user?.username || 'US').slice(0, 2).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base text-white truncate">{user?.username || 'Usuario'}</p>
              <p className="text-sm text-emerald-400/70 truncate">
                {role === 'admin' && 'Administrador'}
                {role === 'usuario' && 'Usuario'}
                {(role === 'jefe' || role === 'jefe_superior') && 'Jefe Superior'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-2 overflow-y-auto relative z-10 mt-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const expanded = openSection === item.key;
              const active = isGroupActive(item.children);

              return (
                <div key={item.key}>
                  <button
                    onClick={() => setOpenSection(expanded ? '' : item.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                      active
                        ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/15 border border-emerald-400/30'
                        : 'text-slate-300 hover:bg-white/5 hover:border hover:border-emerald-500/20 hover:text-emerald-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className="text-xs text-slate-400 group-hover:text-emerald-400/70 transition-colors">{item.description}</p>
                    </div>
                    {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  {expanded && (
                    <div className="ml-4 mt-2 pl-3 border-l border-emerald-500/20 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = isRouteActive(child.path);
                        return (
                          <button
                            key={child.path + child.label}
                            onClick={() => handleNavigation(child.path)}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${
                              childActive
                                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/20'
                                : 'text-slate-300 hover:bg-white/5 hover:text-emerald-300'
                            }`}
                          >
                            <ChildIcon className="w-4 h-4" />
                            <span>{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = isRouteActive(item.path);

            return (
              <button
                key={item.path + item.label}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                  active
                    ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/20 border border-emerald-400/40 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-300 hover:bg-white/5 hover:border hover:border-emerald-500/20 hover:text-emerald-300'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{item.label}</p>
                    {item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 group-hover:text-emerald-400/70 transition-colors">{item.description}</p>
                </div>
                {active && <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/50 animate-pulse"></div>}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-2 relative z-10">
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
        </div>

        <div className="p-4 border-t border-emerald-500/20 relative z-10">
          <div className="text-xs text-emerald-400/60 mb-3 px-4 font-medium uppercase tracking-wider">
            {role === 'admin' && '👨‍💼 Administrador'}
            {role === 'usuario' && '👤 Usuario'}
            {(role === 'jefe' || role === 'jefe_superior') && '👔 Jefe Superior'}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group border border-transparent hover:border-red-500/30"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 left-4 p-3 rounded-xl z-50 transition-all duration-200 ${
          isOpen
            ? 'bg-slate-900/95 backdrop-blur-md text-emerald-400 border border-emerald-500/40'
            : 'bg-slate-900/85 backdrop-blur-md text-emerald-300 shadow-lg border border-emerald-500/30 hover:bg-slate-800/90'
        }`}
        title={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </>
  );
};

export default Sidebar;