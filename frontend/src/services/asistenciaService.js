import api from "./asistencia";

export const createAsistencia = (data) => api.post("asistencias/", data);