import api from "./pedidoHistorial";

export const createPedidoHistorial = (data) => api.post("pedido-historial/", data);