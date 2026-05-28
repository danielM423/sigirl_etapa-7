import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserProvider } from './context/UserContext';
import ProtectedRouteByRole from './components/ProtectedRouteByRole';
import ProtectedRoute from './components/ProtectedRoute';
import GestionProgramas from './pages/GestionProgramas';
import GestionCompetencias from './pages/GestionCompetencias';
import SelectorPractica from './pages/SelectorPractica';  // ← IMPORTANTE: agregado
import GestionPracticas from './pages/GestionPracticas';
// Páginas de autenticación
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';

// Dashboards por rol
import UsuarioDashboard from './pages/UsuarioDashboard';
import AdminDashboard from './pages/AdminDashboard';
import JefeSuperiorDashboard from './pages/JefeSuperiorDashboard';

// Perfil y gestión
import Perfil from './pages/Perfil';
import Usuarios from './pages/Usuarios';
import Alertas from './pages/Alertas';
import Reportes from './pages/Reportes';

// Páginas de prácticas
import PracticaNueva from './pages/PracticaNueva';
import RFsDemo from './pages/RFsDemo';

// Páginas antiguas (mantener compatibilidad)
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Pedidos from './pages/pedidos';
import AprobacionesJefe from './pages/AprobacionesJefe';
 import SustanciasControladas from './pages/SustanciasControladas';


function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />
          import AprobacionesJefe from './pages/AprobacionesJefe';

          
          <Route path="/aprobaciones-jefe" element={
            <ProtectedRouteByRole requiredRoles={['jefe', 'admin']}>
              <AprobacionesJefe />
            </ProtectedRouteByRole>
          } />
          {/* Dashboards por rol */}
          <Route path="/usuario" element={
            <ProtectedRouteByRole requiredRoles={['usuario']}>
              <UsuarioDashboard />
            </ProtectedRouteByRole>
          } />
          <Route path="/admin" element={
            <ProtectedRouteByRole requiredRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRouteByRole>
          } />
          <Route path="/jefe" element={
            <ProtectedRouteByRole requiredRoles={['jefe']}>
              <JefeSuperiorDashboard />
            </ProtectedRouteByRole>
          } />
          
          {/* Rutas de prácticas */}
          <Route path="/practicas/nueva" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe']}>
              <PracticaNueva />
            </ProtectedRouteByRole>
          } />
          <Route path="/practicas/gestion" element={
  <ProtectedRouteByRole requiredRoles={['admin', 'jefe']}>
    <GestionPracticas />
  </ProtectedRouteByRole>
} />
          
          {/* Rutas antiguas (compatibilidad) */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/inventario" element={<ProtectedRoute><Inventario /></ProtectedRoute>} />
          <Route path="/pedidos" element={<ProtectedRoute><Pedidos /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="/usuarios" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe', 'usuario']}>
              <Usuarios />
            </ProtectedRouteByRole>
          } />
          <Route path="/alertas" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe']}>
              <Alertas />
            </ProtectedRouteByRole>
          } />
          <Route path="/reportes" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe']}>
              <Reportes />
            </ProtectedRouteByRole>
          } />
          <Route path="/programas" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe']}>
              <GestionProgramas />
            </ProtectedRouteByRole>
          } />
          <Route path="/competencias" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe']}>
              <GestionCompetencias />
            </ProtectedRouteByRole>
          } />
          
          {/* RUTA NUEVA: Selector de Prácticas */}
          <Route path="/selector-practica" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe', 'usuario']}>
              <SelectorPractica />
            </ProtectedRouteByRole>
          } />
         

// Dentro de Routes
<Route path="/sustancias-controladas" element={
  <ProtectedRouteByRole requiredRoles={['admin', 'jefe']}>
    <SustanciasControladas />
  </ProtectedRouteByRole>
} />
          {/* Ruta demo para los RFs implementados */}
          <Route path="/rfs-demo" element={<ProtectedRoute><RFsDemo /></ProtectedRoute>} />
          <Route path="/practicas/gestion" element={
              <ProtectedRouteByRole requiredRoles={['admin', 'jefe']}>
                <GestionPracticas />
              </ProtectedRouteByRole>
            } />
          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer 
          position="top-right" 
          autoClose={3500} 
          hideProgressBar={false} 
          newestOnTop 
          closeOnClick 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
        />
      </UserProvider>
    </Router>
  );
}

export default App;