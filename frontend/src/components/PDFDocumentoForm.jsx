import { useState } from 'react';
import { createPDFDocumento } from '../services/pdfDocumentoService';

export default function PDFDocumentoForm({ onSuccess }) {
  const [form, setForm] = useState({ nombre: '', archivo: null });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const data = new FormData();
    data.append('nombre', form.nombre);
    if (form.archivo) data.append('archivo', form.archivo);
    try {
      await createPDFDocumento(data);
      setForm({ nombre: '', archivo: null });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Error al subir PDF');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{marginBottom: 24}}>
      <h3>Subir PDF</h3>
      <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
      <input name="archivo" type="file" accept="application/pdf" onChange={handleChange} required />
      <button type="submit">Subir</button>
      {error && <div style={{color:'red'}}>{error}</div>}
    </form>
  );
}
