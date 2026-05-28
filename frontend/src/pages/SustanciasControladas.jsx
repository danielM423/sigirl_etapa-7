import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const SustanciasControladas = () => {
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [nuevoReactivo, setNuevoReactivo] = useState({
    nombre: '',
    cantidad: 0,
    minimo: 10,
    ubicacion: '',
    categoria: 'Reactivos'
  });

  useEffect(() => {
    cargarReporte();
  }, []);

  const cargarReporte = async () => {
    try {
      const res = await api.get('reporte-sustancias-controladas/');
      setReporte(res.data);
    } catch (err) {
      console.error('Error cargando reporte:', err);
      alert('Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const toggleSensible = async (id, nombre, esSensible) => {
    if (window.confirm(`¿${esSensible ? 'Desmarcar' : 'Marcar'} "${nombre}" como reactivo sensible?`)) {
      try {
        const res = await api.post(`toggle-reactivo-sensible/${id}/`);
        alert(res.data.mensaje);
        cargarReporte();
      } catch (err) {
        console.error('Error:', err);
        alert('Error al cambiar el estado');
      }
    }
  };

  const crearReactivo = async () => {
    if (!nuevoReactivo.nombre) {
      alert('El nombre es obligatorio');
      return;
    }

    try {
      const res = await api.post('crear-reactivo-sensible/', nuevoReactivo);
      alert(res.data.mensaje);
      setShowModal(false);
      setNuevoReactivo({ nombre: '', cantidad: 0, minimo: 10, ubicacion: '', categoria: 'Reactivos' });
      cargarReporte();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al crear el reactivo');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center">Cargando reporte...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Control de Sustancias Controladas</h1>
            <p className="text-gray-500 text-sm mt-1">Reactivos de control especial y sus alertas</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            + Nuevo Reactivo Sensible
          </button>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Total Reactivos</p>
            <p className="text-2xl font-bold text-blue-600">{reporte?.total_reactivos || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-500">Reactivos Sensibles</p>
            <p className="text-2xl font-bold text-red-600">{reporte?.total_sensibles || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
            <p className="text-sm text-gray-500">Con Alertas</p>
            <p className="text-2xl font-bold text-amber-600">{reporte?.reactivos_con_alerta || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-emerald-500">
            <p className="text-sm text-gray-500">En Stock Normal</p>
            <p className="text-2xl font-bold text-emerald-600">
              {(reporte?.total_reactivos || 0) - (reporte?.reactivos_con_alerta || 0)}
            </p>
          </div>
        </div>

        {/* Tabla de reactivos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mínimo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sensible</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alertas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reporte?.reactivos?.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{r.nombre}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={r.cantidad <= r.minimo ? 'text-red-600 font-bold' : ''}>
                      {r.cantidad}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{r.minimo}</td>
                  <td className="px-6 py-4 text-sm">{r.ubicacion || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    {r.es_sensible ? (
                      <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">⚠️ Sensible</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">Normal</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {r.alertas?.length > 0 ? (
                      <div className="space-y-1">
                        {r.alertas.map((a, i) => (
                          <span key={i} className="inline-block px-2 py-1 rounded text-xs bg-red-100 text-red-800 mr-1">
                            ⚠️ {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-green-600">✅ Normal</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => toggleSensible(r.id, r.nombre, r.es_sensible)}
                      className={`px-3 py-1 rounded text-xs ${
                        r.es_sensible 
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {r.es_sensible ? 'Quitar Sensible' : 'Marcar Sensible'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reporte?.reactivos?.length === 0 && (
            <div className="text-center py-8 text-gray-500">No hay reactivos registrados</div>
          )}
        </div>

        {/* Modal para crear reactivo sensible */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Nuevo Reactivo Sensible</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={nuevoReactivo.nombre}
                    onChange={(e) => setNuevoReactivo({...nuevoReactivo, nombre: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Ej: Ácido Sulfúrico Concentrado"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad inicial</label>
                  <input
                    type="number"
                    value={nuevoReactivo.cantidad}
                    onChange={(e) => setNuevoReactivo({...nuevoReactivo, cantidad: parseInt(e.target.value) || 0})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock mínimo</label>
                  <input
                    type="number"
                    value={nuevoReactivo.minimo}
                    onChange={(e) => setNuevoReactivo({...nuevoReactivo, minimo: parseInt(e.target.value) || 10})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={nuevoReactivo.ubicacion}
                    onChange={(e) => setNuevoReactivo({...nuevoReactivo, ubicacion: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Ej: Estante de seguridad A-1"
                  />
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-600">
                    ⚠️ Este reactivo será marcado como <strong>CONTROL ESPECIAL</strong> y tendrá trazabilidad completa.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">
                  Cancelar
                </button>
                <button onClick={crearReactivo} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                  Crear Reactivo Sensible
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SustanciasControladas;