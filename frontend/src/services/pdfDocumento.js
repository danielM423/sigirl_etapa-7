import api from "./api";

export const getPDFDocumentos = () => api.get("pdf-documentos/");
export const deletePDFDocumento = (id) => api.delete(`pdf-documentos/${id}/`);
export const updatePDFDocumento = (id, data) => api.put(`pdf-documentos/${id}/`, data, { headers: { 'Content-Type': 'application/json' } });
export default api;
