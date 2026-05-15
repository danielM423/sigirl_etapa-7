import { useState } from 'react';
import { createListadoDiario } from '../services/listadoDiarioService';

export default function ListadoDiarioForm({ onSuccess }) {
  const [form, setForm] = useState({ fecha: '', descripcion: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await createListadoDiario(form);
      setForm({ fecha: '', descripcion: '' });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Error al crear listado');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{marginBottom: 24}}>
      <h3>Crear Listado Diario</h3>
      <input name="fecha" value={form.fecha} onChange={handleChange} placeholder="Fecha (YYYY-MM-DD)" required />
      <input name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" required />
      <button type="submit">Crear</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
