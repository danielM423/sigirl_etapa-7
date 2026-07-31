import api from "./listadoDiario";

export const createListadoDiario = (data) => api.post("listados-diarios/", data);