import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/AuthContext';

// Este componente protege rutas según el rol permitido.
// Si el usuario no cumple el rol requerido, se redirige automáticamente.
const ProtectedRouteByRole = ({ children, requiredRoles }) => {
  // Primero intenta tomar el rol desde el contexto global;
  // si aún no está cargado, usa el valor persistido en localStorage.
  const { role } = useContext(UserContext);
  const storedRole = role || localStorage.getItem('role');
  const normalizedRole = storedRole === 'jefe_superior' ? 'jefe' : storedRole;

  // Si no existe rol, no hay sesión válida y se envía al login.
  if (!normalizedRole) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol no está permitido en esta vista, se redirige al panel correcto.
  if (!requiredRoles.includes(normalizedRole)) {
    if (normalizedRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (normalizedRole === 'jefe') {
      return <Navigate to="/jefe" replace />;
    } else {
      return <Navigate to="/usuario" replace />;
    }
  }

  // Si el rol sí coincide, se renderiza el contenido protegido.
  return children;
};

export default ProtectedRouteByRole;
