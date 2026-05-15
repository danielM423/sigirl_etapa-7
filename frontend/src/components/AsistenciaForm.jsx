import { useState } from 'react';
import { createAsistencia } from '../services/asistenciaService';

export default function AsistenciaForm({ onSuccess }) {
  const [form, setForm] = useState({ usuario: '', fecha: '', presente: false });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await createAsistencia(form);
      setForm({ usuario: '', fecha: '', presente: false });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Error al registrar asistencia');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{marginBottom: 24}}>
      <h3>Registrar Asistencia</h3>
      <input name="usuario" value={form.usuario} onChange={handleChange} placeholder="Usuario" required />
      <input name="fecha" value={form.fecha} onChange={handleChange} placeholder="Fecha (YYYY-MM-DD)" required />
      <label>
        <input name="presente" type="checkbox" checked={form.presente} onChange={handleChange} /> Presente
      </label>
      <button type="submit">Registrar</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
