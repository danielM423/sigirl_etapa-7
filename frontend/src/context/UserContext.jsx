import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    // 🔥 LEER EL OBJETO COMPLETO DEL USUARIO
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const userRole = parsedUser.role || localStorage.getItem("role") || 'usuario';
        
        setUser({ 
          username: parsedUser.username || localStorage.getItem("username"),
          nombre: parsedUser.username || localStorage.getItem("username"),
          role: userRole
        });
        setRole(userRole);
        
        // 🔥 ACTUALIZAR localStorage PARA MANTENER CONSISTENCIA
        localStorage.setItem("role", userRole);
      } catch (error) {
        console.error('Error al leer usuario:', error);
      }
    } else if (localStorage.getItem("role")) {
      // Fallback: si solo existe role
      const userRole = localStorage.getItem("role");
      const username = localStorage.getItem("username");
      setUser({ username, nombre: username, role: userRole });
      setRole(userRole);
    }
  }, []);

  useEffect(() => {
    if (user?.username) {
      localStorage.setItem("username", user.username);
    }
    if (role) {
      localStorage.setItem("role", role);
      // Actualizar también el objeto user en localStorage
      if (user) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.role = role;
        localStorage.setItem('user', JSON.stringify(userData));
      }
    }
  }, [user, role]);

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, role, setUser, setRole, logout }}>
      {children}
    </UserContext.Provider>
  );
}