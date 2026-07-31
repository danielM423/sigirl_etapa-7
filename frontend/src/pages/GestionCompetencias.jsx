import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const GestionCompetencias = () => {
  const [competencias, setCompetencias] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    programa: '',
    codigo: '',
    nombre: '',
    horas_estimadas: 0,
    descripcion: '',
    activo: true
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [compRes, progRes] = await Promise.all([
        api.get('competencias/'),
        api.get('programas/')
      ]);
      setCompetencias(compRes.data);
      setProgramas(progRes.data);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.programa || !formData.codigo || !formData.nombre) {
      alert('Programa, código y nombre son obligatorios');
      return;
    }

    try {
      if (editing) {
        await api.patch(`competencias/${editing}/`, formData);
        alert('Competencia actualizada');
      } else {
        await api.post('competencias/', formData);
        alert('Competencia creada');
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ programa: '', codigo: '', nombre: '', horas_estimadas: 0, descripcion: '', activo: true });
      cargarDatos();
    } catch (err) {
      console.error('Error guardando:', err);
      alert('Error al guardar la competencia');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta competencia?')) {
      try {
        await api.delete(`competencias/${id}/`);
        alert('Competencia eliminada');
        cargarDatos();
      } catch (err) {
        console.error('Error eliminando:', err);
        alert('Error al eliminar la competencia');
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center">Cargando competencias...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Competencias</h1>
          <button
            onClick={() => {
              setEditing(null);
              setFormData({ programa: '', codigo: '', nombre: '', horas_estimadas: 0, descripcion: '', activo: true });
              setShowModal(true);
            }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            + Nueva Competencia
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {competencias.map((comp) => (
                <tr key={comp.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{comp.codigo}</td>
                  <td className="px-6 py-4 text-sm">{comp.nombre}</td>
                  <td className="px-6 py-4 text-sm">{comp.programa_nombre}</td>
                  <td className="px-6 py-4 text-sm">{comp.horas_estimadas}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${comp.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {comp.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => { setEditing(comp.id); setFormData(comp); setShowModal(true); }} className="text-blue-600 mr-3">Editar</button>
                    <button onClick={() => handleDelete(comp.id)} className="text-red-600">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editing ? 'Editar Competencia' : 'Nueva Competencia'}</h2>
              <div className="space-y-4">
                <select value={formData.programa} onChange={(e) => setFormData({ ...formData, programa: e.target.value })} className="w-full border rounded px-3 py-2">
                  <option value="">Seleccione un programa</option>
                  {programas.map(p => (
                    <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
                  ))}
                </select>
                <input type="text" placeholder="Código" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} className="w-full border rounded px-3 py-2" />
                <input type="text" placeholder="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full border rounded px-3 py-2" />
                <input type="number" placeholder="Horas estimadas" value={formData.horas_estimadas} onChange={(e) => setFormData({ ...formData, horas_estimadas: parseInt(e.target.value) || 0 })} className="w-full border rounded px-3 py-2" />
                <textarea placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full border rounded px-3 py-2" rows="3" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.activo} onChange={(e) => setFormData({ ...formData, activo: e.target.checked })} />
                  Activo
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
                <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GestionCompetencias;