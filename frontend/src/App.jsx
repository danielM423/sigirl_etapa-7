import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserProvider } from './context/UserContext';
import ProtectedRouteByRole from './components/ProtectedRouteByRole';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas de autenticación
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';

// Dashboards por rol (CADA UNO YA TIENE SU PROPIO LAYOUT)
import UsuarioDashboard from './pages/UsuarioDashboard';
import AdminDashboard from './pages/AdminDashboard';
import JefeSuperiorDashboard from './pages/JefeSuperiorDashboard';

// Perfil y gestión (CADA UNO YA TIENE SU PROPIO LAYOUT)
import Perfil from './pages/Perfil';
import Usuarios from './pages/Usuarios';
import Alertas from './pages/Alertas';
import Reportes from './pages/Reportes';

// Páginas de prácticas (CADA UNA YA TIENE SU PROPIO LAYOUT)
import PracticaNueva from './pages/PracticaNueva';
import RFsDemo from './pages/RFsDemo';
import GestionProgramas from './pages/GestionProgramas';
import GestionCompetencias from './pages/GestionCompetencias';
import GestionPracticas from './pages/GestionPracticas';
import SelectorPractica from './pages/SelectorPractica';
import AprobacionesJefe from './pages/AprobacionesJefe';
import SustanciasControladas from './pages/SustanciasControladas';
import GestionFormularios from './pages/GestionFormularios';
import DiligenciarFormularios from './pages/DiligenciarFormularios';
import HojaVidaEquipos from './pages/HojaVidaEquipos';
import ReportesFormularios from './pages/ReportesFormularios';
import ProgramacionLaboratorios from './pages/ProgramacionLaboratorios';

// Páginas antiguas (CADA UNA YA TIENE SU PROPIO LAYOUT)
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';

function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          {/* Rutas públicas - SIN LAYOUT */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />

          {/* ============================================================
              TODAS LAS RUTAS PRIVADAS - CADA PÁGINA YA TIENE SU LAYOUT
              ============================================================ */}
          
          {/* Dashboards */}
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
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Inventario */}
          <Route path="/inventario" element={
            <ProtectedRoute>
              <Inventario />
            </ProtectedRoute>
          } />
          
          {/* Aprobaciones */}
          <Route path="/aprobaciones-jefe" element={
            <ProtectedRouteByRole requiredRoles={['jefe', 'admin']}>
              <AprobacionesJefe />
            </ProtectedRouteByRole>
          } />
          
          {/* Prácticas */}
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
          
          <Route path="/selector-practica" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe', 'usuario']}>
              <SelectorPractica />
            </ProtectedRouteByRole>
          } />
          
          <Route path="/hoja-vida-equipos" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe']}>
              <HojaVidaEquipos />
            </ProtectedRouteByRole>
          } />
          
          <Route path="/sustancias-controladas" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe']}>
              <SustanciasControladas />
            </ProtectedRouteByRole>
          } />
          
          <Route path="/reportes-formularios" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe']}>
              <ReportesFormularios />
            </ProtectedRouteByRole>
          } />
          
          {/* Formularios */}
          <Route path="/formularios/gestion" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe']}>
              <GestionFormularios />
            </ProtectedRouteByRole>
          } />
          
          <Route path="/formularios/diligenciar" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe', 'usuario']}>
              <DiligenciarFormularios />
            </ProtectedRouteByRole>
          } />
          
          {/* Programación */}
          <Route path="/programacion-laboratorios" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe', 'usuario']}>
              <ProgramacionLaboratorios />
            </ProtectedRouteByRole>
          } />
          
          {/* Perfil - SIN LAYOUT porque ya lo tiene */}
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          } />
          
          {/* Usuarios */}
          <Route path="/usuarios" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe']}>
              <Usuarios />
            </ProtectedRouteByRole>
          } />
          
          {/* Alertas */}
          <Route path="/alertas" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe']}>
              <Alertas />
            </ProtectedRouteByRole>
          } />
          
          {/* Reportes */}
          <Route path="/reportes" element={
            <ProtectedRouteByRole requiredRoles={['admin', 'jefe']}>
              <Reportes />
            </ProtectedRouteByRole>
          } />
          
          {/* Demo */}
          <Route path="/rfs-demo" element={
            <ProtectedRoute>
              <RFsDemo />
            </ProtectedRoute>
          } />
          
          {/* Redirección */}
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