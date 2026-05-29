import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const GestionFormularios = () => {
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true
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
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nombre) {
      alert('El nombre es obligatorio');
      return;
    }

    try {
      if (editing) {
        await api.patch(`formularios-plantilla/${editing}/`, formData);
        alert('Formulario actualizado');
      } else {
        await api.post('formularios-plantilla/', formData);
        alert('Formulario creado');
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ nombre: '', descripcion: '', activo: true });
      cargarPlantillas();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este formulario?')) {
      try {
        await api.delete(`formularios-plantilla/${id}/`);
        alert('Formulario eliminado');
        cargarPlantillas();
      } catch (err) {
        console.error('Error:', err);
        alert('Error al eliminar');
      }
    }
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
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Formularios</h1>
            <p className="text-gray-500 text-sm mt-1">Crear plantillas de formularios de laboratorio</p>
          </div>
          <button
            onClick={() => { setEditing(null); setFormData({ nombre: '', descripcion: '', activo: true }); setShowModal(true); }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            + Nuevo Formulario
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantillas.map((p) => (
            <div key={p.id} className="bg-white rounded-lg shadow p-4 border hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{p.nombre}</h3>
                  <p className="text-sm text-gray-500 mt-1">{p.descripcion || 'Sin descripción'}</p>
                  <p className="text-xs text-gray-400 mt-2">Campos: {p.campos?.length || 0}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditing(p.id); setFormData(p); setShowModal(true); }}
                    className="text-emerald-600 hover:text-emerald-800 text-sm"
                  >
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 text-sm">
                    🗑️
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t">
                <span className={`text-xs px-2 py-1 rounded ${p.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {p.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {plantillas.length === 0 && (
          <div className="text-center py-8 text-gray-500">No hay formularios creados</div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editing ? 'Editar Formulario' : 'Nuevo Formulario'}</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Nombre" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full border rounded px-3 py-2" />
                <textarea placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full border rounded px-3 py-2" rows="3" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.activo} onChange={(e) => setFormData({...formData, activo: e.target.checked})} />
                  Activo
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancelar</button>
                <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded">Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GestionFormularios;