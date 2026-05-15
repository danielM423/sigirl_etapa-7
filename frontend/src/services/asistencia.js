import api from "./api";

export const getAsistencias = () => api.get("asistencias/");
export const deleteAsistencia = (id) => api.delete(`asistencias/${id}/`);
export const updateAsistencia = (id, data) => api.put(`asistencias/${id}/`, data);
export default api;
