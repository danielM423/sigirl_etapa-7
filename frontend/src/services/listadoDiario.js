import api from "./api";

export const getListadosDiarios = () => api.get("listados-diarios/");
export const deleteListadoDiario = (id) => api.delete(`listados-diarios/${id}/`);
export const updateListadoDiario = (id, data) => api.put(`listados-diarios/${id}/`, data);
export default api;
