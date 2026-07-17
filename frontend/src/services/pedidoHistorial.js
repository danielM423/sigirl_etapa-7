import api from './api';

export const getPedidoHistorial = () => api.get('pedido-historial/');
export const createPedidoHistorial = (data) => api.post('pedido-historial/', data);

export default {
    getPedidoHistorial,
    createPedidoHistorial
};