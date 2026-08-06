import { toast } from 'react-toastify';

// ✅ LIMPIAR TODAS LAS NOTIFICACIONES
export const clearAllToasts = () => {
  toast.dismiss();
  toast.clearWaitingQueue();
};

// ✅ NOTIFICACIÓN DE ÉXITO
export const showSuccess = (message, duration = 4000) => {
  toast.dismiss(); // Eliminar notificaciones anteriores
  toast.success(message, {
    position: "top-right",
    autoClose: duration,
    closeOnClick: true,
    draggable: true,
    pauseOnHover: true,
    closeButton: true,
  });
};

// ✅ NOTIFICACIÓN DE ADVERTENCIA
export const showWarning = (message, duration = 5000) => {
  toast.dismiss(); // Eliminar notificaciones anteriores
  toast.warning(message, {
    position: "top-right",
    autoClose: duration,
    closeOnClick: true,
    draggable: true,
    pauseOnHover: true,
    closeButton: true,
  });
};

// ✅ NOTIFICACIÓN DE ERROR
export const showError = (message, duration = 6000) => {
  toast.dismiss(); // Eliminar notificaciones anteriores
  toast.error(message, {
    position: "top-right",
    autoClose: duration,
    closeOnClick: true,
    draggable: true,
    pauseOnHover: true,
    closeButton: true,
  });
};

// ✅ NOTIFICACIÓN DE INFORMACIÓN
export const showInfo = (message, duration = 4000) => {
  toast.dismiss(); // Eliminar notificaciones anteriores
  toast.info(message, {
    position: "top-right",
    autoClose: duration,
    closeOnClick: true,
    draggable: true,
    pauseOnHover: true,
    closeButton: true,
  });
};