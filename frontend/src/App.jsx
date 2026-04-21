// Archivo raíz de navegación del frontend.
// Aquí se definen todas las rutas públicas, protegidas y redirecciones por rol.
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserProvider } from './context/UserContext';
import ProtectedRouteByRole from './components/ProtectedRouteByRole';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas de autenticación
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboards por rol
import UsuarioDashboard from './pages/UsuarioDashboard';
import AdminDashboard from './pages/AdminDashboard';
import JefeSuperiorDashboard from './pages/JefeSuperiorDashboard';
import ProfileSettings from './pages/ProfileSettings';

// Páginas antiguas (mantener compatibilidad)
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Pedidos from './pages/pedidos';

// Redirige automáticamente al usuario al panel correcto según su rol guardado.
const RoleBasedRedirect = ({ adminTo, jefeTo, usuarioTo }) => {
  const storedRole = localStorage.getItem('role');
  const normalizedRole = storedRole === 'jefe_superior' ? 'jefe' : storedRole;

  if (normalizedRole === 'admin') {
    return <Navigate to={adminTo} replace />;
  }

  if (normalizedRole === 'jefe') {
    return <Navigate to={jefeTo} replace />;
  }

  return <Navigate to={usuarioTo} replace />;
};

function App() {
  // Se monta el router principal y se envuelve todo con el proveedor de usuario.
  return (
    <Router>
      {/* UserProvider envuelve toda la app para que cualquier vista
          pueda acceder al usuario autenticado y a su rol. */}
      <UserProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboards por rol */}
          <Route
            path="/usuario"
            element={
              <ProtectedRouteByRole requiredRoles={['usuario']}>
                <UsuarioDashboard />
              </ProtectedRouteByRole>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRouteByRole requiredRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRouteByRole>
            }
          />
          <Route
            path="/jefe"
            element={
              <ProtectedRouteByRole requiredRoles={['jefe']}>
                <JefeSuperiorDashboard />
              </ProtectedRouteByRole>
            }
          />
          <Route
            path="/usuario/perfil"
            element={
              <ProtectedRouteByRole requiredRoles={['usuario']}>
                <ProfileSettings />
              </ProtectedRouteByRole>
            }
          />
          <Route
            path="/admin/perfil"
            element={
              <ProtectedRouteByRole requiredRoles={['admin']}>
                <ProfileSettings />
              </ProtectedRouteByRole>
            }
          />
          <Route
            path="/jefe/perfil"
            element={
              <ProtectedRouteByRole requiredRoles={['jefe']}>
                <ProfileSettings />
              </ProtectedRouteByRole>
            }
          />

          {/* Rutas antiguas (compatibilidad) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventario"
            element={
              <ProtectedRoute>
                <Inventario />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pedidos"
            element={
              <ProtectedRoute>
                <Pedidos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute>
                <RoleBasedRedirect adminTo="/register" jefeTo="/jefe?tab=usuarios" usuarioTo="/usuario" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alertas"
            element={
              <ProtectedRoute>
                <RoleBasedRedirect adminTo="/admin?tab=alertas" jefeTo="/jefe?tab=alertas" usuarioTo="/usuario" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reportes"
            element={
              <ProtectedRoute>
                <RoleBasedRedirect adminTo="/dashboard" jefeTo="/dashboard" usuarioTo="/usuario" />
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={2800}
          theme="colored"
          newestOnTop
          pauseOnHover
          draggable
        />
      </UserProvider>
    </Router>
  );
}

export default App;