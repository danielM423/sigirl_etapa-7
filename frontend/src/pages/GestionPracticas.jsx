import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const GestionPracticas = () => {
  const [practicas, setPracticas] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [instructores, setInstructores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    ficha: '',
    fecha: '',
    grupos_trabajo: 1,
    instructor: '',
    competencia: '',
    observaciones: '',
    estado: 'pendiente',
    es_recurrente: false,
    periodicidad_dias: 7,
    repeticiones_totales: 1
  });

  const getToken = () => localStorage.getItem('access_token');

  const cargarDatos = async () => {
    const token = getToken();
    if (!token) {
      console.error('No hay token');
      setLoading(false);
      return;
    }

    try {
      const [practicasRes, competenciasRes, instructoresRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/practicas/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://127.0.0.1:8000/api/competencias/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://127.0.0.1:8000/api/instructores/', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const practicas = await practicasRes.json();
      const competencias = await competenciasRes.json();
      const instructores = await instructoresRes.json();

      setPracticas(practicas);
      setCompetencias(competencias);
      setInstructores(instructores);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSave = async () => {
  if (!formData.nombre || !formData.ficha || !formData.fecha || !formData.competencia || !formData.instructor) {
    alert('Nombre, ficha, fecha, competencia e instructor son obligatorios');
    return;
  }

  const token = getToken();
  
  // Preparar datos para enviar (eliminar id)
  const datosEnviar = { ...formData };
  delete datosEnviar.id;
  delete datosEnviar.repeticiones_realizadas;
  delete datosEnviar.fecha_ultima_repeticion;
  
  const url = editing 
    ? `http://127.0.0.1:8000/api/practicas/${editing}/`
    : 'http://127.0.0.1:8000/api/practicas/';
  const method = editing ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(datosEnviar)
    });

    if (response.ok) {
      alert(editing ? '✅ Práctica actualizada' : '✅ Práctica creada');
      setShowModal(false);
      setEditing(null);
      setFormData({
        nombre: '',
        ficha: '',
        fecha: new Date().toISOString().split('T')[0],
        grupos_trabajo: 1,
        instructor: '',
        competencia: '',
        observaciones: '',
        estado: 'pendiente',
        es_recurrente: false,
        periodicidad_dias: 7,
        repeticiones_totales: 1
      });
      cargarDatos();
    } else {
      const error = await response.json();
      console.error('Error detallado:', error);
      alert('Error: ' + JSON.stringify(error));
    }
  } catch (err) {
    console.error('Error guardando:', err);
    alert('Error al guardar la práctica');
  }
};


  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta práctica?')) return;
    
    const token = getToken();
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/practicas/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Práctica eliminada');
        cargarDatos();
      } else {
        alert('Error al eliminar');
      }
    } catch (err) {
      console.error('Error eliminando:', err);
      alert('Error al eliminar la práctica');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center">Cargando prácticas...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Prácticas</h1>
            <p className="text-gray-500 text-sm mt-1">Administrar prácticas académicas</p>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setFormData({
                nombre: '',
                ficha: '',
                fecha: new Date().toISOString().split('T')[0],
                grupos_trabajo: 1,
                instructor: '',
                competencia: '',
                observaciones: '',
                estado: 'pendiente',
                es_recurrente: false,
                periodicidad_dias: 7,
                repeticiones_totales: 1
              });
              setShowModal(true);
            }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            + Nueva Práctica
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ficha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Competencia</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recurrente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {practicas.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{p.ficha}</td>
                  <td className="px-4 py-3 text-sm font-medium">{p.nombre}</td>
                  <td className="px-4 py-3 text-sm">{p.competencia_nombre || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {p.es_recurrente ? (
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        Cada {p.periodicidad_dias} días
                      </span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      p.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                      p.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button 
                      onClick={() => { 
                        setEditing(p.id); 
                        setFormData({
                          ...p,
                          fecha: p.fecha || new Date().toISOString().split('T')[0]
                        }); 
                        setShowModal(true); 
                      }} 
                      className="text-blue-600 mr-3 hover:text-blue-800"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)} 
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{editing ? 'Editar Práctica' : 'Nueva Práctica'}</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ficha *</label>
                    <input type="text" value={formData.ficha} onChange={(e) => setFormData({...formData, ficha: e.target.value})} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre *</label>
                    <input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full border rounded px-3 py-2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha *</label>
                    <input type="date" value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Grupos</label>
                    <input type="number" min="1" value={formData.grupos_trabajo} onChange={(e) => setFormData({...formData, grupos_trabajo: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Competencia *</label>
                  <select value={formData.competencia} onChange={(e) => setFormData({...formData, competencia: e.target.value})} className="w-full border rounded px-3 py-2">
                    <option value="">Seleccione una competencia</option>
                    {competencias.map(c => (
                      <option key={c.id} value={c.id}>{c.programa_nombre} - {c.nombre.substring(0, 50)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Instructor *</label>
                  <select value={formData.instructor} onChange={(e) => setFormData({...formData, instructor: e.target.value})} className="w-full border rounded px-3 py-2">
                    <option value="">Seleccione un instructor</option>
                    {instructores.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.username}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <select value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})} className="w-full border rounded px-3 py-2">
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobada">Aprobada</option>
                    <option value="rechazada">Rechazada</option>
                    <option value="finalizada">Finalizada</option>
                  </select>
                </div>

                <div>
                  <textarea placeholder="Observaciones" value={formData.observaciones} onChange={(e) => setFormData({...formData, observaciones: e.target.value})} className="w-full border rounded px-3 py-2" rows="2" />
                </div>

                {/* Prácticas Recurrentes */}
                <div className="border-t pt-4">
                  <label className="flex items-center gap-2 mb-3">
                    <input type="checkbox" checked={formData.es_recurrente} onChange={(e) => setFormData({...formData, es_recurrente: e.target.checked})} className="w-4 h-4" />
                    <span className="font-medium">Práctica recurrente</span>
                  </label>

                  {formData.es_recurrente && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">Periodicidad (días)</label>
                        <select value={formData.periodicidad_dias} onChange={(e) => setFormData({...formData, periodicidad_dias: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2">
                          <option value="1">Diaria</option>
                          <option value="2">Cada 2 días</option>
                          <option value="3">Cada 3 días</option>
                          <option value="7">Semanal</option>
                          <option value="14">Quincenal</option>
                          <option value="30">Mensual</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Número de repeticiones</label>
                        <input type="number" min="1" value={formData.repeticiones_totales} onChange={(e) => setFormData({...formData, repeticiones_totales: parseInt(e.target.value)})} className="w-full border rounded px-3 py-2" />
                      </div>
                    </div>
                  )}
                </div>
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

export default GestionPracticas;