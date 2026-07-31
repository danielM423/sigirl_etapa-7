import { createContext } from 'react';

// Contexto global de usuario.
// Sirve para compartir la sesión, el rol y las funciones de autenticación
// entre todos los componentes sin pasar props manualmente.
export const UserContext = createContext({
  user: null,
  role: null,
  isAdmin: false,
  isJefe: false,
  setUser: () => {},
  setRole: () => {},
  logout: () => {},
});
