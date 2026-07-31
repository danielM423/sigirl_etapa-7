import axios from "axios";

// Cliente HTTP central del frontend.
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Interceptor de salida: agrega automáticamente el token a cada solicitud privada.
api.interceptors.request.use((config) => {
  // Intentar obtener token de diferentes nombres posibles
  const token = localStorage.getItem("access_token") || localStorage.getItem("token");
  const requestUrl = config.url || "";
  
  const isPublicRoute = [
    "token/", "register/", "verify-email/", "auth/resend-verification/", 
    "auth/user/", "instructores/", "reactivos/", "equipos/", "unidades-medida/",
    "token/refresh/"
  ].some((route) => requestUrl.includes(route));

  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`🔐 Token añadido a ${requestUrl}`);
  } else if (!token && !isPublicRoute) {
    console.warn(`⚠️ Sin token para: ${requestUrl}`);
  }

  return config;
});

// Interceptor de entrada: detecta errores de autenticación y renueva el token automáticamente
api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = error.config?.url || "";
    
    const isPublicRoute = [
      "token/", "register/", "verify-email/", "auth/resend-verification/", 
      "auth/user/", "instructores/", "reactivos/", "equipos/", "unidades-medida/",
      "token/refresh/"
    ].some((route) => requestUrl.includes(route));

    // Si es error 401 y no es una ruta pública y no se ha intentado renovar aún
    if (error.response?.status === 401 && !isPublicRoute && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem("refresh_token");
      
      if (refreshToken) {
        try {
          console.log("🔄 Intentando renovar token...");
          const response = await api.post("token/refresh/", { refresh: refreshToken });
          
          if (response.data.access) {
            // Guardar nuevo token
            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("token", response.data.access);
            
            // Reintentar la petición original con el nuevo token
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            console.log("✅ Token renovado exitosamente");
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("❌ Error al renovar token:", refreshError);
          // Si falla la renovación, redirigir al login
          localStorage.removeItem("access_token");
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        // No hay refresh token, redirigir al login
        console.error("❌ No hay refresh token disponible");
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } else if (error.response?.status === 403) {
      const { toast } = await import('react-toastify');
      toast.error('No tienes permiso para realizar esta acción.');
    } else if (error.response?.status >= 500) {
      const { toast } = await import('react-toastify');
      toast.error('Error interno del servidor. Intenta de nuevo.');
    }
    
    return Promise.reject(error);
  }
);

// ── Productos ──────────────────────────────────────────────
export const getProductos   = ()         => api.get('productos/');
export const createProducto = (data)     => api.post('productos/', data);
export const updateProducto = (id, data) => api.patch(`productos/${id}/`, data);
export const deleteProducto = (id)       => api.delete(`productos/${id}/`);
export const getProductoById = (id) => api.get(`productos/${id}/`);

// ── Pedidos ────────────────────────────────────────────────
export const getPedidos   = ()         => api.get('pedidos/');
export const createPedido = (data)     => api.post('pedidos/', data);
export const updatePedido = (id, data) => api.patch(`pedidos/${id}/`, data);
export const deletePedido = (id)       => api.delete(`pedidos/${id}/`);

// ── Alertas ────────────────────────────────────────────────
export const getAlertas   = ()         => api.get('alertas/');
export const createAlerta = (data)     => api.post('alertas/', data);
export const updateAlerta = (id, data) => api.patch(`alertas/${id}/`, data);
export const deleteAlerta = (id)       => api.delete(`alertas/${id}/`);

// ── Usuarios (gestión staff) ───────────────────────────────
export const getUsuarios   = ()         => api.get('usuarios/');
export const createUsuario = (data)     => api.post('usuarios/', data);
export const updateUsuario = (id, data) => api.patch(`usuarios/${id}/`, data);
export const deleteUsuario = (id)       => api.delete(`usuarios/${id}/`);

// ── Movimientos ───────────────────────────────────────────
export const getMovimientos    = ()         => api.get('movimientos/');
export const createMovimiento  = (data)     => api.post('movimientos/', data);

// ── Auth ──────────────────────────────────────────────────
export const verifyEmailToken = (uid, token) => api.get(`verify-email/${uid}/${token}/`);
export const resendVerificationEmail = (data) => api.post('auth/resend-verification/', data);
export const verifyEmailCode = (data) => api.post('auth/verify-email-code/', data);

// ── Reportes backend ──────────────────────────────────────
export const getInventoryExcelReportUrl = () => `${api.defaults.baseURL}reportes/inventario-excel/`;
export const getInventoryTemplateUrl = () => `${api.defaults.baseURL}reportes/plantilla-inventario/`;
export const getInventoryPdfReportUrl = () => `${api.defaults.baseURL}reportes/inventario-pdf/`;

// ── Auditoría ──────────────────────────────────────────────
export const getAuditoria = (params = {}) => api.get('auditoria/', { params });

// ── Instructores ──────────────────────────────────────────
export const getInstructores = () => api.get('instructores/');

// ── Inventario prácticas abiertas para instructores ───────
export const getInventarioPracticasInstructor = () => api.get('inventario-practicas-abiertas-instructor/');

// ── Categorías ───────────────────────────────────────────
export const getCategorias = () => api.get('categorias/');

// ── Prácticas ──────────────────────────────────────────────
export const getPracticas = () => api.get('practicas/');
export const createPractica = (data) => api.post('practicas/', data);
export const updatePractica = (id, data) => api.patch(`practicas/${id}/`, data);
export const deletePractica = (id) => api.delete(`practicas/${id}/`);
export const aprobarPractica = (id) => api.post(`practicas/${id}/aprobar/`);
export const rechazarPractica = (id, data) => api.post(`practicas/${id}/rechazar/`, data);
export const descargarExcelPracticas = () => api.get('practicas/excel/', { responseType: 'blob' });

// ── Equipos ────────────────────────────────────────────────
export const getEquipos = () => api.get('equipos/');
export const createEquipo = (data) => api.post('equipos/', data);
export const updateEquipo = (id, data) => api.patch(`equipos/${id}/`, data);
export const deleteEquipo = (id) => api.delete(`equipos/${id}/`);

// ── Reactivos ──────────────────────────────────────────────
export const getReactivos = () => api.get('reactivos/');
export const createReactivo = (data) => api.post('reactivos/', data);
export const updateReactivo = (id, data) => api.patch(`reactivos/${id}/`, data);
export const deleteReactivo = (id) => api.delete(`reactivos/${id}/`);

// ── Unidades de medida ─────────────────────────────────────
export const getUnidadesMedida = () => api.get('unidades-medida/');

// ── Top reactivos usados ──────────────────────────────────
export const getTopReactivosUsados = () => api.get('top-reactivos-usados/');

export default api;