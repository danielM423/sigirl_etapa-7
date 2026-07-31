import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DiligenciarFormularios = () => {
  const [formularios, setFormularios] = useState([]);
  const [practicas, setPracticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [practicaSeleccionada, setPracticaSeleccionada] = useState('');
  const [respuestas, setRespuestas] = useState({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarFormularios();
    cargarPracticas();
  }, []);

  const cargarFormularios = async () => {
    try {
      const res = await api.get('mis-formularios/');
      setFormularios(res.data);
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al cargar los formularios');
    } finally {
      setLoading(false);
    }
  };

  const cargarPracticas = async () => {
    try {
      const res = await api.get('practicas/');
      setPracticas(res.data);
    } catch (err) {
      console.error('Error cargando prácticas:', err);
    }
  };

  const cargarDetalleFormulario = async (id) => {
    try {
      const res = await api.get(`formularios-plantilla/${id}/`);
      setSelectedForm(res.data);
      setRespuestas({});
      setPracticaSeleccionada('');
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al cargar el formulario');
    }
  };

  const handleChange = (campoId, value, tipo) => {
    let valorFinal = value;
    if (tipo === 'checkbox') {
      valorFinal = value.target.checked;
    } else if (tipo === 'number') {
      valorFinal = parseFloat(value) || 0;
    } else {
      valorFinal = value;
    }
    setRespuestas({ ...respuestas, [campoId]: valorFinal });
  };

  const enviarRespuestas = async () => {
    if (!practicaSeleccionada) {
      toast.warning('⚠️ Debes seleccionar una práctica');
      return;
    }
    for (const campo of selectedForm.campos) {
      if (campo.obligatorio && (respuestas[campo.id] === undefined || respuestas[campo.id] === '')) {
        toast.warning(`⚠️ El campo "${campo.etiqueta}" es obligatorio`);
        return;
      }
    }
    setEnviando(true);
    try {
      await api.post('formularios-respuesta/', {
        plantilla: selectedForm.id,
        practica: practicaSeleccionada,
        datos: respuestas
      });
      toast.success('✅ Formulario enviado exitosamente');
      setSelectedForm(null);
      setPracticaSeleccionada('');
      cargarFormularios();
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al enviar el formulario');
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
        <ToastContainer />
        <div className="p-6 max-w-2xl mx-auto">
          <button onClick={() => setSelectedForm(null)} className="text-emerald-600 hover:text-emerald-700 mb-4 flex items-center gap-2 transition-colors">
            ← Volver
          </button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📝</span>
              <div>
                <h1 className="text-2xl font-bold text-stone-800">{selectedForm.nombre}</h1>
                <p className="text-stone-500 text-sm">{selectedForm.descripcion}</p>
              </div>
            </div>
            <div className="mt-6 space-y-5">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <label className="block text-sm font-medium text-emerald-800 mb-1.5">📋 Práctica asociada *</label>
                <select value={practicaSeleccionada} onChange={(e) => setPracticaSeleccionada(e.target.value)}
                  className="w-full border border-emerald-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white">
                  <option value="">-- Seleccione una práctica --</option>
                  {practicas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.fecha}) - {p.instructor_nombre || 'Sin instructor'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-emerald-600 mt-1">Selecciona la práctica a la que corresponde este informe</p>
              </div>

              {selectedForm.campos?.sort((a, b) => a.orden - b.orden).map((campo, idx) => (
                <motion.div key={campo.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                  className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    {campo.etiqueta} {campo.obligatorio && <span className="text-red-500 text-lg">*</span>}
                  </label>
                  {campo.tipo === 'text' && (
                    <input type="text" value={respuestas[campo.id] || ''} onChange={(e) => handleChange(campo.id, e.target.value, campo.tipo)}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" placeholder={campo.etiqueta} />
                  )}
                  {campo.tipo === 'textarea' && (
                    <textarea value={respuestas[campo.id] || ''} onChange={(e) => handleChange(campo.id, e.target.value, campo.tipo)}
                      rows="4" className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" placeholder={campo.etiqueta} />
                  )}
                  {campo.tipo === 'number' && (
                    <input type="number" value={respuestas[campo.id] || ''} onChange={(e) => handleChange(campo.id, e.target.value, campo.tipo)}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" placeholder={campo.etiqueta} />
                  )}
                  {campo.tipo === 'date' && (
                    <input type="date" value={respuestas[campo.id] || ''} onChange={(e) => handleChange(campo.id, e.target.value, campo.tipo)}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all" />
                  )}
                  {campo.tipo === 'checkbox' && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={respuestas[campo.id] || false} onChange={(e) => handleChange(campo.id, e, campo.tipo)}
                        className="w-5 h-5 text-emerald-600 border-stone-300 rounded focus:ring-emerald-500" />
                      <span className="text-sm text-stone-600">Marcar</span>
                    </label>
                  )}
                  {campo.tipo === 'select' && (
                    <select value={respuestas[campo.id] || ''} onChange={(e) => handleChange(campo.id, e.target.value, campo.tipo)}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all">
                      <option value="">Seleccione...</option>
                      {campo.opciones?.split(',').map((opt, i) => <option key={i} value={opt.trim()}>{opt.trim()}</option>)}
                    </select>
                  )}
                </motion.div>
              ))}
            </div>
            <button onClick={enviarRespuestas} disabled={enviando}
              className="mt-6 w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md font-medium flex items-center justify-center gap-2">
              {enviando ? '🔄 Enviando...' : '📤 Enviar Formulario'}
            </button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ToastContainer />
      <div className="p-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📝</span>
            <div>
              <h1 className="text-3xl font-bold text-stone-800">Formularios de Laboratorio</h1>
              <p className="text-stone-500 text-sm mt-1">Complete los formularios asignados para cada práctica</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {formularios.map((f, idx) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{f.ya_respondio ? '✅' : '📄'}</span>
                    <h3 className="text-lg font-semibold text-stone-800">{f.nombre}</h3>
                  </div>
                  <p className="text-sm text-stone-500 mt-1 line-clamp-2">{f.descripcion || 'Sin descripción'}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-stone-400 flex items-center gap-1"><span>📊</span> {f.campos_count} campos</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${f.ya_respondio ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {f.ya_respondio ? '✅ Completado' : '⏳ Pendiente'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => cargarDetalleFormulario(f.id)}
                className={`mt-4 w-full py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md ${
                  f.ya_respondio ? 'bg-stone-100 text-stone-700 hover:bg-stone-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}>
                {f.ya_respondio ? '📖 Ver/Editar' : '✏️ Responder'}
              </button>
            </motion.div>
          ))}
        </div>

        {formularios.length === 0 && (
          <div className="text-center py-16 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
            <span className="text-6xl">📋</span>
            <p className="text-stone-500 mt-4">No hay formularios disponibles</p>
            <p className="text-sm text-stone-400">El Administrador aún no ha creado formularios</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DiligenciarFormularios;