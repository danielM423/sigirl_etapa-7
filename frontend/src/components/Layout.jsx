import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  Users, 
  AlertTriangle,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  FlaskConical,
  Search,
  Bell,
  BarChart3,
  Calendar
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, role } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const normalizedRole = role === 'jefe_superior' ? 'jefe' : role;

  // ========== CONTADOR DE APROBACIONES PENDIENTES (BADGE) ==========
  const [aprobacionesPendientes, setAprobacionesPendientes] = useState(0);

const contarAprobacionesPendientes = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setAprobacionesPendientes(0);
      return;
    }
    
    const res = await fetch('http://127.0.0.1:8000/api/pedidos-requieren-aprobacion/', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // ✅ Si es 403 (usuario no autorizado), silenciosamente no mostrar badge
    if (res.status === 403 || res.status === 401) {
      setAprobacionesPendientes(0);
      return;
    }
    
    if (res.ok) {
      const data = await res.json();
      setAprobacionesPendientes(data.length);
    } else {
      setAprobacionesPendientes(0);
    }
  } catch (error) {
    // ✅ Ignorar errores silenciosamente
    setAprobacionesPendientes(0);
  }
};

  // Cargar al inicio y actualizar cada 30 segundos
  // Cargar al inicio y actualizar cada 30 segundos
useEffect(() => {
  contarAprobacionesPendientes();
  const interval = setInterval(contarAprobacionesPendientes, 30000);
  return () => clearInterval(interval);
}, []);

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Avatar reactivo: se actualiza cuando cambia el usuario o la ruta
  const username = user?.username || localStorage.getItem('username') || '';
  const [avatarSrc, setAvatarSrc] = useState(() => localStorage.getItem(`sigirl_avatar:${username}`) || '');

  // Re-leer avatar si el username o la ruta cambia (al volver de Perfil)
  useEffect(() => {
    const stored = localStorage.getItem(`sigirl_avatar:${username}`) || '';
    setAvatarSrc(stored);
  }, [username, location.pathname]);

  const formatDate = () => {
    return currentTime.toLocaleDateString('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // ========== MENÚ SUPERIOR CON BADGE ==========
const navItems = [
  // ============================================================
  // 1. DASHBOARD
  // ============================================================
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['admin', 'jefe', 'usuario'] },

  // ============================================================
  // 2. INVENTARIO
  // ============================================================
  { path: '/inventario', label: 'Inventario', icon: <Package className="w-4 h-4" />, roles: ['admin', 'jefe', 'usuario'] },

  // ============================================================
  // 3. PRÁCTICAS Y SOLICITUDES
  // ============================================================
  { path: '/selector-practica', label: 'Generar Solicitud', icon: <ClipboardList className="w-4 h-4" />, roles: ['usuario'] },

  // ============================================================
  // 4. PEDIDOS Y APROBACIONES
  // ============================================================
  { path: '/aprobaciones-jefe', label: 'Aprobar Excepciones', icon: <AlertTriangle className="w-4 h-4" />, roles: ['admin', 'jefe'], badge: true },

  // ============================================================
  // 5. FORMULARIOS
  // ============================================================
  { path: '/formularios/diligenciar', label: 'Formularios', icon: <FileText className="w-4 h-4" />, roles: ['admin', 'jefe', 'usuario'] },

  // ============================================================
  // 6. PROGRAMACIÓN
  // ============================================================
  { path: '/programacion-laboratorios', label: 'Programación', icon: <Calendar className="w-4 h-4" />, roles: ['admin', 'jefe', 'usuario'] },

  // ============================================================
  // 7. GESTIÓN DE EQUIPOS Y SUSTANCIAS
  // ============================================================
  { path: '/hoja-vida-equipos', label: 'Hoja de Vida Equipos', icon: <Package className="w-4 h-4" />, roles: ['admin', 'jefe'] },

  // ============================================================
  // 8. GESTIÓN DE FORMULARIOS (Admin/Jefe)
  // ============================================================
  { path: '/formularios/gestion', label: 'Gestionar Formularios', icon: <FileText className="w-4 h-4" />, roles: ['admin', 'jefe'] },
  { path: '/reportes-formularios', label: 'Reportes Formularios', icon: <BarChart3 className="w-4 h-4" />, roles: ['admin', 'jefe'] },

  // ============================================================
  // 9. ADMINISTRACIÓN DEL SISTEMA
  // ============================================================
  { path: '/usuarios', label: 'Usuarios', icon: <Users className="w-4 h-4" />, roles: ['admin', 'jefe'] },
  { path: '/alertas', label: 'Alertas', icon: <AlertTriangle className="w-4 h-4" />, roles: ['admin', 'jefe'] },
  { path: '/reportes', label: 'Reportes', icon: <FileText className="w-4 h-4" />, roles: ['admin', 'jefe'] },

  // ============================================================
  // 10. PERFIL (SIEMPRE AL FINAL)
  // ============================================================
  { path: '/perfil', label: 'Perfil', icon: <User className="w-4 h-4" />, roles: ['admin', 'jefe', 'usuario'] },
];

  const filteredNav = navItems.filter(item => item.roles.includes(normalizedRole));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative">
      {/* Patrón de fondo */}
      <div className="pattern-dots"></div>
      
      <div className="relative z-10">
        {/* Header con glassmorphism */}
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-md border-b border-[#e2e8f0] shadow-sm"
        >
          <div className="flex justify-between items-center px-4 sm:px-6 py-3">
            <div className="flex items-center gap-4">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-[#16a34a] hover:text-[#15803d] transition-colors"
              >
                <Menu size={20} />
              </motion.button>
              
              <Link to="/dashboard" className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="p-2 rounded-xl bg-gradient-to-br from-[#16a34a] to-[#15803d] shadow-md"
                >
                  <FlaskConical size={20} className="text-white" />
                </motion.div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-[#16a34a] to-[#15803d] bg-clip-text text-transparent">
                    SIGIRL
                  </h1>
                  <p className="text-[9px] text-[#64748b] font-mono hidden md:block">
                    Sistema de Gestión de Investigación
                  </p>
                </div>
              </Link>
            </div>
            
            {/* Barra de búsqueda */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] w-4 h-4" />
                <input 
                  type="text"
                  placeholder="Buscar reactivos, pedidos, usuarios..."
                  className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Estado del sistema */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#dcfce7]/50 rounded-full">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 rounded-full bg-[#16a34a] shadow-glow-green"
                />
                <span className="text-[10px] font-mono text-[#16a34a] font-medium">SISTEMA ONLINE</span>
              </div>
              
              {/* Hora y fecha */}
              <div className="hidden lg:block text-right">
                <p className="text-xs font-mono text-[#1e293b] font-medium">{formatTime()}</p>
                <p className="text-[9px] text-[#64748b] font-mono">{formatDate()}</p>
              </div>
              
              {/* Notificaciones */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-xl hover:bg-[#f8fafc] transition-colors"
              >
                <Bell size={18} className="text-[#64748b]" />
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-[#f59e0b] rounded-full text-[9px] text-white flex items-center justify-center font-mono font-bold"
                >
                  3
                </motion.span>
              </motion.button>
              
              {/* Avatar */}
              <div className="flex items-center gap-3 pl-3 border-l border-[#e2e8f0]">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative w-9 h-9 rounded-full border-2 border-[#16a34a]/30 overflow-hidden shadow-md cursor-pointer"
                  onClick={() => navigate('/perfil')}
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#16a34a] to-[#15803d] flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {(user?.nombre || username || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </motion.div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-[#1e293b] leading-tight">
                    {user?.nombre || username || 'Usuario'}
                  </p>
                  <p className="text-[10px] text-[#16a34a] font-mono font-medium">
                    {normalizedRole === 'admin' ? 'Administrador' : normalizedRole === 'jefe' ? 'Jefe Superior' : 'Usuario'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar + Main Content */}
        <div className="flex pt-[65px]">
          {/* Backdrop móvil para cerrar sidebar */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-[9] bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside className={`
            fixed z-10
            w-64 h-[calc(100vh-65px)] 
            bg-white border-r border-[#e2e8f0]
            transition-transform duration-300 ease-in-out
            overflow-y-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <nav className="p-4 space-y-1">
              <div className="mb-5 px-2 pt-2 pb-4 border-b border-[#e2e8f0]">
                <div className="text-center text-[11px] font-mono text-[#16a34a]/70">
                  SO₃OH · NaOH · HCl
                </div>
              </div>
              
              {filteredNav.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg
                    transition-all font-mono text-sm
                    ${location.pathname === item.path 
                      ? 'bg-[#dcfce7] text-[#16a34a] border-l-[3px] border-[#16a34a] font-semibold pl-[13px]' 
                      : 'text-stone-600 hover:text-[#16a34a] hover:bg-[#dcfce7]/50'
                    }
                  `}
                >
                  {item.icon}
                  <div className="flex items-center gap-1 flex-1">
                    <span>{item.label}</span>
                    {item.badge && aprobacionesPendientes > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                        {aprobacionesPendientes}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
              
              <div className="pt-4 mt-4 border-t border-[#e2e8f0]">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-all font-mono text-sm w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <motion.main 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-auto lg:ml-64"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
};

export default Layout;