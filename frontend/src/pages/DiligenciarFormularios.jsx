import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const DiligenciarFormularios = () => {
  const [formularios, setFormularios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarFormularios();
  }, []);

  const cargarFormularios = async () => {
    try {
      const res = await api.get('mis-formularios/');
      setFormularios(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalleFormulario = async (id) => {
    try {
      const res = await api.get(`formularios-plantilla/${id}/`);
      setSelectedForm(res.data);
      setRespuestas({});
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleChange = (campoId, value, tipo) => {
    let valorFinal = value;
    if (tipo === 'checkbox') {
      valorFinal = value.target.checked;
    } else if (tipo === 'number') {
      valorFinal = parseFloat(value) || 0;
    }
    setRespuestas({ ...respuestas, [campoId]: valorFinal });
  };

  const enviarRespuestas = async () => {
    for (const campo of selectedForm.campos) {
      if (campo.obligatorio && (respuestas[campo.id] === undefined || respuestas[campo.id] === '')) {
        alert(`El campo "${campo.etiqueta}" es obligatorio`);
        return;
      }
    }

    setEnviando(true);
    try {
      await api.post('formularios-respuesta/', {
        plantilla: selectedForm.id,
        datos: respuestas
      });
      alert('✅ Formulario enviado exitosamente');
      setSelectedForm(null);
      cargarFormularios();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al enviar el formulario');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center">Cargando formularios...</div>
      </Layout>
    );
  }

  if (selectedForm) {
    return (
      <Layout>
        <div className="p-6 max-w-2xl mx-auto">
          <button onClick={() => setSelectedForm(null)} className="text-blue-600 mb-4">← Volver</button>
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-2">{selectedForm.nombre}</h1>
            <p className="text-gray-500 mb-6">{selectedForm.descripcion}</p>

            <div className="space-y-4">
              {selectedForm.campos?.map((campo) => (
                <div key={campo.id}>
                  <label className="block text-sm font-medium mb-1">
                    {campo.etiqueta} {campo.obligatorio && <span className="text-red-500">*</span>}
                  </label>
                  {campo.tipo === 'text' && (
                    <input type="text" value={respuestas[campo.id] || ''} onChange={(e) => handleChange(campo.id, e.target.value, campo.tipo)} className="w-full border rounded px-3 py-2" />
                  )}
                  {campo.tipo === 'textarea' && (
                    <textarea value={respuestas[campo.id] || ''} onChange={(e) => handleChange(campo.id, e.target.value, campo.tipo)} className="w-full border rounded px-3 py-2" rows="4" />
                  )}
                  {campo.tipo === 'number' && (
                    <input type="number" value={respuestas[campo.id] || ''} onChange={(e) => handleChange(campo.id, e.target.value, campo.tipo)} className="w-full border rounded px-3 py-2" />
                  )}
                  {campo.tipo === 'date' && (
                    <input type="date" value={respuestas[campo.id] || ''} onChange={(e) => handleChange(campo.id, e.target.value, campo.tipo)} className="w-full border rounded px-3 py-2" />
                  )}
                  {campo.tipo === 'checkbox' && (
                    <input type="checkbox" checked={respuestas[campo.id] || false} onChange={(e) => handleChange(campo.id, e, campo.tipo)} className="w-4 h-4" />
                  )}
                </div>
              ))}
            </div>

            <button onClick={enviarRespuestas} disabled={enviando} className="mt-6 w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
              {enviando ? 'Enviando...' : 'Enviar Formulario'}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Formularios de Laboratorio</h1>
        <p className="text-gray-500 mb-6">Complete los formularios asignados</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formularios.map((f) => (
            <div key={f.id} className="bg-white rounded-lg shadow p-4 border hover:shadow-lg">
              <h3 className="text-lg font-semibold">{f.nombre}</h3>
              <p className="text-sm text-gray-500 mt-1">{f.descripcion}</p>
              <p className="text-xs text-gray-400 mt-2">Campos: {f.campos_count}</p>
              {f.ya_respondio && <p className="text-xs text-green-600 mt-1">✓ Ya respondido</p>}
              <button onClick={() => cargarDetalleFormulario(f.id)} className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700">
                {f.ya_respondio ? 'Ver/Editar' : 'Responder'}
              </button>
            </div>
          ))}
        </div>

        {formularios.length === 0 && <div className="text-center py-8 text-gray-500">No hay formularios disponibles</div>}
      </div>
    </Layout>
  );
};

export default DiligenciarFormularios;