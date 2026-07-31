import api from "./api";

export const getPedidoHistorial = () => api.get("pedido-historial/");
export default api;
