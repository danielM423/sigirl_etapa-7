import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReportesFormularios = () => {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReporte, setSelectedReporte] = useState(null);
  const [selectedRespuesta, setSelectedRespuesta] = useState(null);

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      const res = await api.get('formularios-respuesta/');
      const respuestas = res.data;

      const grupos = {};
      respuestas.forEach(r => {
        const nombre = r.plantilla_nombre || 'Sin nombre';
        if (!grupos[nombre]) {
          grupos[nombre] = [];
        }
        grupos[nombre].push(r);
      });

      const reportesData = Object.keys(grupos).map(nombre => ({
        nombre,
        total: grupos[nombre].length,
        respuestas: grupos[nombre],
        ultima: grupos[nombre].reduce((a, b) => new Date(a.fecha) > new Date(b.fecha) ? a : b)
      }));

      setReportes(reportesData);
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const colores = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500'];
  const iconos = ['🧪', '📦', '⚠️', '📊', '🔬', '📋'];

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center">Cargando reportes...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ToastContainer />
      <div className="p-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl">📊</span>
            <div>
              <h1 className="text-3xl font-bold text-stone-800">Reportes de Formularios</h1>
              <p className="text-stone-500 text-sm mt-1">Visualiza y analiza todas las respuestas de los formularios</p>
            </div>
          </div>
          <div className="flex gap-4 mt-3">
            <span className="text-sm bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full">
              📋 {reportes.length} tipos de formularios
            </span>
            <span className="text-sm bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full">
              📝 {reportes.reduce((acc, r) => acc + r.total, 0)} respuestas totales
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {reportes.map((r, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => setSelectedReporte(r)}
              className={`bg-gradient-to-br ${colores[idx % colores.length]} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-3xl">{iconos[idx % iconos.length]}</span>
                  <h3 className="text-sm font-semibold mt-2 opacity-90">{r.nombre}</h3>
                </div>
                <span className="text-2xl font-bold">{r.total}</span>
              </div>
              <div className="mt-3 flex justify-between text-xs opacity-75">
                <span>respuestas</span>
                <span>Último: {new Date(r.ultima?.fecha).toLocaleDateString('es-CO')}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedReporte && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                    <span>📋</span> {selectedReporte.nombre}
                  </h2>
                  <p className="text-sm text-stone-500">
                    Total: {selectedReporte.total} respuestas
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReporte(null)}
                  className="text-stone-400 hover:text-stone-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full">
                  <thead className="bg-stone-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-stone-600">#</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-stone-600">Práctica</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-stone-600">Usuario</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-stone-600">Fecha</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-stone-600">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReporte.respuestas.map((r, idx) => (
                      <tr key={r.id} className="border-t border-stone-100 hover:bg-stone-50 transition-colors">
                        <td className="px-4 py-2 text-sm text-stone-400">{idx + 1}</td>
                        <td className="px-4 py-2 text-sm text-stone-700 font-medium">
                          {r.practica_nombre || 'Sin práctica'}
                        </td>
                        <td className="px-4 py-2 text-sm text-stone-700">{r.usuario_nombre}</td>
                        <td className="px-4 py-2 text-sm text-stone-600">
                          {new Date(r.fecha).toLocaleDateString('es-CO')}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            onClick={() => setSelectedRespuesta(r)}
                            className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1"
                          >
                            👁️ Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedReporte.respuestas.length === 0 && (
                  <div className="text-center py-8 text-stone-500">
                    No hay respuestas para este formulario
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedRespuesta && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                    <span>📄</span> Detalle de respuesta
                  </h3>
                  <button
                    onClick={() => setSelectedRespuesta(null)}
                    className="text-stone-400 hover:text-stone-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-4 p-4 bg-stone-50 rounded-xl">
                  <p className="text-sm"><strong>Práctica:</strong> {selectedRespuesta.practica_nombre || 'Sin práctica'}</p>
                  <p className="text-sm"><strong>Usuario:</strong> {selectedRespuesta.usuario_nombre}</p>
                  <p className="text-sm"><strong>Fecha:</strong> {new Date(selectedRespuesta.fecha).toLocaleString('es-CO')}</p>
                </div>

                <div className="space-y-3">
                  {Object.entries(selectedRespuesta.datos).map(([key, value]) => (
                    <div key={key} className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                      <p className="text-sm font-medium text-stone-700">Campo {key}</p>
                      <p className="text-sm text-stone-600">{value || 'Sin respuesta'}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setSelectedRespuesta(null)}
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 p-4 bg-stone-50 rounded-2xl border border-stone-200">
          <p className="text-sm text-stone-600 flex items-center gap-4">
            <span>📊 Resumen general</span>
            <span className="text-stone-300">|</span>
            <span>{reportes.length} tipos de formularios</span>
            <span className="text-stone-300">|</span>
            <span>{reportes.reduce((acc, r) => acc + r.total, 0)} respuestas totales</span>
            <span className="text-stone-300">|</span>
            <span>Actualizado: {new Date().toLocaleString('es-CO')}</span>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ReportesFormularios;