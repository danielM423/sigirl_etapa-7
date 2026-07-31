import api from "./pdfDocumento";

export const createPDFDocumento = (data) => api.post("pdf-documentos/", data);