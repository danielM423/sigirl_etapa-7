import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const GestionProgramas = () => {
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    version: '1.0',
    descripcion: '',
    activo: true
  });

  useEffect(() => {
    cargarProgramas();
  }, []);

  const cargarProgramas = async () => {
    try {
      const res = await api.get('programas/');
      setProgramas(res.data);
    } catch (err) {
      console.error('Error cargando programas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.codigo || !formData.nombre) {
      alert('Código y nombre son obligatorios');
      return;
    }

    try {
      if (editing) {
        await api.patch(`programas/${editing}/`, formData);
        alert('Programa actualizado');
      } else {
        await api.post('programas/', formData);
        alert('Programa creado');
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ nombre: '', codigo: '', version: '1.0', descripcion: '', activo: true });
      cargarProgramas();
    } catch (err) {
      console.error('Error guardando:', err);
      alert('Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este programa?')) {
      try {
        await api.delete(`programas/${id}/`);
        alert('Programa eliminado');
        cargarProgramas();
      } catch (err) {
        console.error('Error eliminando:', err);
        alert('Error al eliminar');
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center">Cargando programas...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Programas</h1>
          <button onClick={() => { setEditing(null); setFormData({ nombre: '', codigo: '', version: '1.0', descripcion: '', activo: true }); setShowModal(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
            + Nuevo Programa
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Versión</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th></tr></thead>
            <tbody>
              {programas.map((prog) => (
                <tr key={prog.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{prog.codigo}</td><td className="px-6 py-4 text-sm">{prog.nombre}</td><td className="px-6 py-4 text-sm">{prog.version}</td>
                  <td className="px-6 py-4 text-sm"><span className={`px-2 py-1 rounded text-xs ${prog.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{prog.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="px-6 py-4 text-sm"><button onClick={() => { setEditing(prog.id); setFormData(prog); setShowModal(true); }} className="text-blue-600 mr-3">Editar</button><button onClick={() => handleDelete(prog.id)} className="text-red-600">Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editing ? 'Editar' : 'Nuevo'} Programa</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Código" value={formData.codigo} onChange={(e) => setFormData({...formData, codigo: e.target.value})} className="w-full border rounded px-3 py-2" />
                <input type="text" placeholder="Nombre" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full border rounded px-3 py-2" />
                <input type="text" placeholder="Versión" value={formData.version} onChange={(e) => setFormData({...formData, version: e.target.value})} className="w-full border rounded px-3 py-2" />
                <textarea placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full border rounded px-3 py-2" rows="3" />
                <label className="flex items-center"><input type="checkbox" checked={formData.activo} onChange={(e) => setFormData({...formData, activo: e.target.checked})} className="mr-2" /> Activo</label>
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

export default GestionProgramas;