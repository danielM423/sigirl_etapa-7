import { useContext, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Users, 
  AlertTriangle, 
  FileText, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Sparkles
} from 'lucide-react';
import { UserContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, role, logout } = useContext(UserContext);
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const normalizedRole = role === 'jefe_superior' ? 'jefe' : role;
  const isAdmin = normalizedRole === 'admin';
  const isJefe = normalizedRole === 'jefe';

  const dashboardPath = isAdmin ? '/admin?tab=inventario' : isJefe ? '/jefe?tab=estadisticas' : '/usuario';
  const pedidosPath = isAdmin ? '/admin?tab=pedidos' : isJefe ? '/jefe?tab=pedidos' : '/pedidos';
  const usuariosPath = isAdmin ? '/register' : '/jefe?tab=usuarios';
  const alertasPath = isAdmin ? '/admin?tab=alertas' : '/jefe?tab=alertas';
  const perfilPath = isAdmin ? '/admin/perfil' : isJefe ? '/jefe/perfil' : '/usuario/perfil';

  const menuItems = [
    { path: dashboardPath, label: 'Dashboard', icon: LayoutDashboard },
    { path: '/inventario', label: 'Inventario', icon: Package },
    { path: pedidosPath, label: 'Pedidos', icon: ClipboardList },
    ...(isAdmin || isJefe ? [{ path: usuariosPath, label: 'Usuarios', icon: Users }] : []),
    ...(isAdmin || isJefe ? [{ path: alertasPath, label: 'Alertas', icon: AlertTriangle }] : []),
    ...(isAdmin || isJefe ? [{ path: '/dashboard', label: 'Reportes', icon: FileText }] : []),
  ];

  const secondaryItems = [
    { path: perfilPath, label: 'Perfil', icon: Settings },
  ];

  const isItemActive = (path) => {
    const [pathname, search] = path.split('?');

    if (location.pathname !== pathname) return false;
    if (!search) return true;

    const currentTab = new URLSearchParams(location.search).get('tab');
    const targetTab = new URLSearchParams(search).get('tab');
    return targetTab ? currentTab === targetTab : true;
  };

  const displayName = user?.full_name || user?.first_name || user?.username || 'Usuario';
  const userInitial = displayName[0]?.toUpperCase() || 'U';

  return (
    // CONTENEDOR DEL MENÚ LATERAL.
    // Este aside define el ancho del sidebar y su comportamiento al colapsarse.
    // Si lo encapsulas dentro de otro contenedor con centrado o márgenes globales,
    // el menú también se desplazará junto con el contenido.
    <aside
      className={`relative flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-72'
      } min-h-screen bg-white border-r border-slate-200 shadow-sm z-20`}
    >
      {/* Header del Sidebar */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/20 shrink-0">
          <FlaskConical className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-800 tracking-tight">SIGIRL</span>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Sistema de Gestión</span>
          </div>
        )}
      </div>

      {/* Información del usuario */}
      <div className={`px-4 py-4 ${collapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100 ${collapsed ? 'w-11 justify-center p-2' : ''}`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-xs shrink-0 shadow-sm">
            {userInitial}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-800 truncate">
                {displayName}
              </span>
              <span className="text-xs text-slate-500 font-medium capitalize flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-emerald-500" />
                {role === 'admin' ? 'Administrador' : 
                 role === 'jefe_superior' ? 'Jefe Superior' : 
                 role === 'jefe' ? 'Jefe' : 'Usuario'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className={`mb-3 ${collapsed ? 'text-center' : 'px-3'}`}>
          {!collapsed && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Menú Principal</span>
          )}
        </div>
        
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.path);
          
          return (
            <NavLink
              key={`${item.path}-${index}`}
              to={item.path}
              className={({ isActive: navActive }) => 
                `group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                  navActive || isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              {({ isActive: navActive }) => (
                <>
                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                    (navActive || isActive) ? 'bg-emerald-100' : 'bg-slate-100 group-hover:bg-slate-200'
                  }`}>
                    <Icon className={`h-4 w-4 shrink-0 ${
                      (navActive || isActive) ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-600'
                    }`} />
                  </div>
                  {!collapsed && (
                    <span className="font-medium text-sm"> {item.label}</span>
                  )}
                  {(navActive || isActive) && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Sección Secundaria */}
        <div className={`mt-6 mb-3 ${collapsed ? 'text-center' : 'px-3'}`}>
          {!collapsed && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Configuración</span>
          )}
        </div>

        {secondaryItems.map((item, index) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              key={`${item.path}-${index}`}
              to={item.path}
              className={({ isActive: navActive }) => 
                `group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                  navActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              {({ isActive: navActive }) => (
                <>
                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                    navActive ? 'bg-emerald-100' : 'bg-slate-100 group-hover:bg-slate-200'
                  }`}>
                    <Icon className={`h-4 w-4 shrink-0 ${
                      navActive ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-600'
                    }`} />
                  </div>
                  {!collapsed && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer del Sidebar */}
      <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 font-medium text-sm active:scale-95"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!collapsed && <span>Colapsar menú</span>}
        </button>
        
        <button
          type="button"
          onClick={logout}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all duration-200 font-semibold text-sm active:scale-95 ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="p-2 rounded-lg bg-rose-100">
            <LogOut className="h-4 w-4 shrink-0" />
          </div>
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;