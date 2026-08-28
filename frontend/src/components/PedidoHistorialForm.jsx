import { useState } from 'react';
import { createPedidoHistorial } from '../services/pedidoHistorialService';

export default function PedidoHistorialForm({ onSuccess }) {
  const [form, setForm] = useState({ usuario: '', pedido: '', accion: '', fecha: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await createPedidoHistorial(form);
      setForm({ usuario: '', pedido: '', accion: '', fecha: '' });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Error al crear historial');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{marginBottom: 24}}>
      <h3>Agregar Historial de Pedido</h3>
      <input name="usuario" value={form.usuario} onChange={handleChange} placeholder="Usuario" required />
      <input name="pedido" value={form.pedido} onChange={handleChange} placeholder="Pedido" required />
      <input name="accion" value={form.accion} onChange={handleChange} placeholder="Acción" required />
      <input name="fecha" value={form.fecha} onChange={handleChange} placeholder="Fecha (YYYY-MM-DD)" required />
      <button type="submit">Crear</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
