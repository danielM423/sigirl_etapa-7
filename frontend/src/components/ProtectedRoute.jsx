import { Navigate } from 'react-router-dom';

// Protege rutas privadas.
// Si no existe token en el navegador, el usuario es redirigido al login.
function ProtectedRoute({ children, element }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si la sesión existe, se muestra el contenido protegido.
  return children || element || null;
}

export default ProtectedRoute;
