// Proveedor real de sesión para el frontend.
// Mantiene sincronizados el usuario, el rol y el almacenamiento local del navegador.
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { UserContext } from "./AuthContext";

const SESSION_USER_KEY = "sigirl_user";

// Guarda o limpia la sesión en localStorage según el estado actual.
const persistSession = (nextSession) => {
  if (!nextSession?.user || !nextSession?.role) {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem(SESSION_USER_KEY);
    return;
  }

  localStorage.setItem("username", nextSession.user.username || "");
  localStorage.setItem("role", nextSession.role);
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(nextSession.user));
};

// Reconstruye la sesión al refrescar el navegador.
const getStoredSession = () => {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const storedRole = localStorage.getItem("role");
  const storedUser = JSON.parse(localStorage.getItem(SESSION_USER_KEY) || "null");

  if (!token || !username || !storedRole) {
    return { user: null, role: null };
  }

  return {
    user: storedUser || { username, role: storedRole },
    role: storedRole,
  };
};

export function UserProvider({ children }) {
  // session centraliza el usuario logueado y su rol dentro de toda la app.
  const [session, setSession] = useState(() => getStoredSession());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let active = true;

    api.get("auth/profile/")
      .then(({ data }) => {
        if (!active) return;
        setSession((prev) => {
          const nextSession = {
            user: data,
            role: data.role || prev.role,
          };
          persistSession(nextSession);
          return nextSession;
        });
      })
      .catch(() => {
        // Si el perfil no se puede cargar, conservamos la sesión local.
      });

    return () => {
      active = false;
    };
  }, []);

  const setUser = useCallback((nextUser) => {
    setSession((prev) => {
      const mergedUser = { ...(prev.user || {}), ...(nextUser || {}) };
      const nextSession = {
        user: mergedUser,
        role: nextUser?.role || prev.role,
      };
      persistSession(nextSession);
      return nextSession;
    });
  }, []);

  const setRole = useCallback((nextRole) => {
    setSession((prev) => {
      const nextSession = {
        ...prev,
        role: nextRole,
        user: prev.user ? { ...prev.user, role: nextRole } : prev.user,
      };
      persistSession(nextSession);
      return nextSession;
    });
  }, []);

  const logout = useCallback(() => {
    setSession({ user: null, role: null });
    persistSession({ user: null, role: null });
  }, []);

  const value = useMemo(() => ({
    user: session.user,
    role: session.role,
    isAdmin: session.role === "admin",
    isJefe: session.role === "jefe",
    setUser,
    setRole,
    logout,
  }), [session, setUser, setRole, logout]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
