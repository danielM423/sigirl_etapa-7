import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GestionFormularios = () => {
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCamposModal, setShowCamposModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedPlantilla, setSelectedPlantilla] = useState(null);
  const [campos, setCampos] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', activo: true });
  const [campoForm, setCampoForm] = useState({
    nombre: '', etiqueta: '', tipo: 'text', obligatorio: false, opciones: '', orden: 0
  });

  useEffect(() => {
    cargarPlantillas();
  }, []);

  const cargarPlantillas = async () => {
    try {
      const res = await api.get('formularios-plantilla/');
      setPlantillas(res.data);
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al cargar las plantillas');
    } finally {
      setLoading(false);
    }
  };

  const cargarCampos = async (plantillaId) => {
    try {
      const res = await api.get(`formularios-campos/?plantilla=${plantillaId}`);
      setCampos(res.data);
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al cargar los campos');
    }
  };

  const handleSave = async () => {
    if (!formData.nombre) {
      toast.warning('⚠️ El nombre es obligatorio');
      return;
    }
    try {
      if (editing) {
        await api.patch(`formularios-plantilla/${editing}/`, formData);
        toast.success('✅ Formulario actualizado');
      } else {
        await api.post('formularios-plantilla/', formData);
        toast.success('✅ Formulario creado');
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ nombre: '', descripcion: '', activo: true });
      cargarPlantillas();
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este formulario?')) return;
    try {
      await api.delete(`formularios-plantilla/${id}/`);
      toast.success('✅ Formulario eliminado');
      cargarPlantillas();
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al eliminar');
    }
  };

  const agregarCampo = async () => {
    if (!campoForm.nombre || !campoForm.etiqueta) {
      toast.warning('⚠️ Nombre y etiqueta son obligatorios');
      return;
    }
    try {
      await api.post('formularios-campos/', { ...campoForm, plantilla: selectedPlantilla.id });
      toast.success('✅ Campo agregado');
      setCampoForm({ nombre: '', etiqueta: '', tipo: 'text', obligatorio: false, opciones: '', orden: 0 });
      cargarCampos(selectedPlantilla.id);
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al agregar el campo');
    }
  };

  const eliminarCampo = async (id) => {
    if (!window.confirm('¿Eliminar este campo?')) return;
    try {
      await api.delete(`formularios-campos/${id}/`);
      toast.success('✅ Campo eliminado');
      cargarCampos(selectedPlantilla.id);
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al eliminar el campo');
    }
  };

  const abrirCamposModal = async (plantilla) => {
    setSelectedPlantilla(plantilla);
    await cargarCampos(plantilla.id);
    setShowCamposModal(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center">Cargando formularios...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ToastContainer />
      <div className="p-6 max-w-6xl mx-auto">
        {/* Encabezado */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-stone-800">📋 Gestión de Formularios</h1>
            <p className="text-stone-500 text-sm mt-1">Crea y administra las plantillas de formularios de laboratorio</p>
          </div>
          <button
            onClick={() => { setEditing(null); setFormData({ nombre: '', descripcion: '', activo: true }); setShowModal(true); }}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <span className="text-xl">+</span> Nueva Plantilla
          </button>
        </motion.div>

        {/* Grid de plantillas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plantillas.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📄</span>
                    <h3 className="text-lg font-semibold text-stone-800 truncate">{p.nombre}</h3>
                  </div>
                  <p className="text-sm text-stone-500 mt-1 line-clamp-2">{p.descripcion || 'Sin descripción'}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <span>📊</span> {p.campos?.length || 0} campos
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full ${p.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-500'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => abrirCamposModal(p)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all group relative"
                    title="Administrar campos del formulario"
                  >
                    <span className="text-lg">⚙️</span>
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                      Gestionar campos
                    </span>
                  </button>
                  <button
                    onClick={() => { setEditing(p.id); setFormData(p); setShowModal(true); }}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all group relative"
                    title="Editar plantilla"
                  >
                    <span className="text-lg">✏️</span>
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                      Editar
                    </span>
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all group relative"
                    title="Eliminar plantilla"
                  >
                    <span className="text-lg">🗑️</span>
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                      Eliminar
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {plantillas.length === 0 && (
          <div className="text-center py-16 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
            <span className="text-6xl">📋</span>
            <p className="text-stone-500 mt-4">No hay formularios creados</p>
            <p className="text-sm text-stone-400">Haz clic en "Nueva Plantilla" para comenzar</p>
          </div>
        )}

        {/* Modal para plantilla */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold text-stone-800 mb-4">
                {editing ? '✏️ Editar Plantilla' : '📝 Nueva Plantilla'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="Ej: INFORME DE REACTIVOS"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    rows="3"
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="Describe el propósito del formulario..."
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  Activo (visible para los usuarios)
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-stone-200 rounded-xl hover:bg-stone-50 transition-all">
                  Cancelar
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md">
                  Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal para campos */}
        {showCamposModal && selectedPlantilla && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-stone-800">⚙️ Campos: {selectedPlantilla.nombre}</h3>
                  <p className="text-sm text-stone-500">Gestiona las preguntas del formulario</p>
                </div>
                <button onClick={() => setShowCamposModal(false)} className="text-stone-400 hover:text-stone-600 text-2xl">✕</button>
              </div>

              <div className="bg-stone-50 rounded-xl p-4 mb-4 border border-stone-200">
                <h4 className="font-medium text-stone-700 mb-3 flex items-center gap-2">
                  <span>➕</span> Agregar Campo
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Nombre interno *" value={campoForm.nombre} onChange={(e) => setCampoForm({...campoForm, nombre: e.target.value})} className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
                  <input type="text" placeholder="Etiqueta visible *" value={campoForm.etiqueta} onChange={(e) => setCampoForm({...campoForm, etiqueta: e.target.value})} className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
                  <select value={campoForm.tipo} onChange={(e) => setCampoForm({...campoForm, tipo: e.target.value})} className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400">
                    <option value="text">📝 Texto corto</option>
                    <option value="textarea">📄 Texto largo</option>
                    <option value="number">🔢 Número</option>
                    <option value="date">📅 Fecha</option>
                    <option value="checkbox">☑️ Checkbox</option>
                    <option value="select">📋 Selección</option>
                  </select>
                  <input type="number" placeholder="Orden" value={campoForm.orden} onChange={(e) => setCampoForm({...campoForm, orden: parseInt(e.target.value) || 0})} className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400" />
                  {campoForm.tipo === 'select' && (
                    <textarea placeholder="Opciones (separadas por coma)" value={campoForm.opciones} onChange={(e) => setCampoForm({...campoForm, opciones: e.target.value})} className="border border-stone-200 rounded-lg px-3 py-2 text-sm col-span-2 focus:outline-none focus:border-emerald-400" rows="2" />
                  )}
                  <label className="flex items-center gap-2 text-sm text-stone-700 col-span-2">
                    <input type="checkbox" checked={campoForm.obligatorio} onChange={(e) => setCampoForm({...campoForm, obligatorio: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded" />
                    Obligatorio
                  </label>
                </div>
                <button onClick={agregarCampo} className="mt-3 bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-emerald-700 transition-all">
                  + Agregar Campo
                </button>
              </div>

              <h4 className="font-medium text-stone-700 mb-3 flex items-center gap-2">
                <span>📋</span> Campos del Formulario ({campos.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {campos.map((c) => (
                  <div key={c.id} className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border border-stone-200 hover:shadow-sm transition-shadow">
                    <div>
                      <p className="font-medium text-stone-700">{c.etiqueta}</p>
                      <p className="text-xs text-stone-400">
                        <span className="font-mono">{c.nombre}</span> • {c.tipo} {c.obligatorio && '• ⚠️ Obligatorio'}
                        {c.opciones && `• Opciones: ${c.opciones}`}
                      </p>
                    </div>
                    <button onClick={() => eliminarCampo(c.id)} className="text-red-400 hover:text-red-600 text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition-all">Eliminar</button>
                  </div>
                ))}
                {campos.length === 0 && <p className="text-stone-400 text-center py-4">No hay campos agregados</p>}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GestionFormularios;