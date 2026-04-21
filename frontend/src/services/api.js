import axios from "axios";

// Cliente HTTP central del frontend.
// Todas las solicitudes al backend pasan por esta instancia.
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Interceptor de salida:
// agrega automáticamente el token a cada solicitud privada.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const requestUrl = config.url || "";
  const isPublicRoute = ["token/", "register/"].some((route) => requestUrl.includes(route));

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (!isPublicRoute) {
    console.warn("Sesión no encontrada para esta solicitud");
  }

  return config;
});

// Interceptor de entrada:
// detecta errores de autenticación y obliga a volver al login si el token expiró.
api.interceptors.response.use(
  response => response,
  error => {
    const requestUrl = error.config?.url || "";
    const isPublicRoute = ["token/", "register/"].some((route) => requestUrl.includes(route));

    if (error.response?.status === 401 && !isPublicRoute) {
      console.error("❌ 401 - Token inválido o expirado");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;