// ── Inventario de prácticas abiertas para instructores ───────────────
export const getInventarioPracticasInstructor = () => api.get('inventario-practicas-abiertas-instructor/');
// ── Categorías ───────────────────────────────────────────
export const getCategorias = () => api.get('categorias/');
import axios from "axios";

// Cliente HTTP central del frontend.
// Para desarrollo local: apunta al backend Django en puerto 8000
// Para producción: usa URL relativa
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",  // ← MODIFICADO: URL fija para desarrollo
});

// Interceptor de salida:
// agrega automáticamente el token a cada solicitud privada.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const requestUrl = config.url || "";
  const isPublicRoute = ["token/", "register/", "verify-email/", "auth/resend-verification/", "auth/user/"].some((route) => requestUrl.includes(route));

  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (!token && !isPublicRoute) {
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
    const isPublicRoute = ["token/", "register/", "verify-email/", "auth/resend-verification/", "auth/user/"].some((route) => requestUrl.includes(route));

    if (error.response?.status === 401 && !isPublicRoute) {
      console.error("❌ 401 - Token inválido o expirado");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      import('react-toastify').then(({ toast }) => {
        toast.error('No tienes permiso para realizar esta acción.');
      });
    } else if (error.response?.status >= 500) {
      import('react-toastify').then(({ toast }) => {
        toast.error('Error interno del servidor. Intenta de nuevo.');
      });
    }
    return Promise.reject(error);
  }
);

// ── Productos ──────────────────────────────────────────────
export const getProductos   = ()         => api.get('productos/');
export const createProducto = (data)     => api.post('productos/', data);
export const updateProducto = (id, data) => api.patch(`productos/${id}/`, data);
export const deleteProducto = (id)       => api.delete(`productos/${id}/`);

// Obtener detalle de producto/reactivo por ID (incluye stock y si es sensible)
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

// ── Top reactivos usados ──────────────────────────────────
export const getTopReactivosUsados = () => api.get('top-reactivos-usados/');

export default api;