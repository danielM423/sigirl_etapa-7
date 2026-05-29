import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SelectorPractica = () => {
  const [programas, setProgramas] = useState([]);
  const [competencias, setCompetencias] = useState([]);
  const [practicas, setPracticas] = useState([]);
  const [selectedPrograma, setSelectedPrograma] = useState('');
  const [selectedCompetencia, setSelectedCompetencia] = useState('');
  const [selectedPractica, setSelectedPractica] = useState('');
  const [practicaDetalle, setPracticaDetalle] = useState(null);
  const [numeroGrupos, setNumeroGrupos] = useState(1);
  const [calculando, setCalculando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [alertasSensibles, setAlertasSensibles] = useState([]);

  useEffect(() => {
    cargarProgramas();
  }, []);

  useEffect(() => {
    if (selectedPrograma) {
      cargarCompetencias(selectedPrograma);
      setSelectedCompetencia('');
      setSelectedPractica('');
      setPracticas([]);
      setPracticaDetalle(null);
      setResultado(null);
      setAlertasSensibles([]);
    }
  }, [selectedPrograma]);

  useEffect(() => {
    if (selectedCompetencia) {
      cargarPracticas(selectedCompetencia);
      setSelectedPractica('');
      setPracticaDetalle(null);
      setResultado(null);
      setAlertasSensibles([]);
    }
  }, [selectedCompetencia]);

  useEffect(() => {
    if (selectedPractica) {
      cargarDetallePractica(selectedPractica);
      setResultado(null);
      setAlertasSensibles([]);
    }
  }, [selectedPractica]);

  const cargarProgramas = async () => {
    try {
      const res = await api.get('programas/');
      setProgramas(res.data);
    } catch (err) {
      console.error('Error cargando programas:', err);
    }
  };

  const cargarCompetencias = async (programaId) => {
    try {
      const res = await api.get(`competencias/?programa=${programaId}`);
      setCompetencias(res.data);
    } catch (err) {
      console.error('Error cargando competencias:', err);
    }
  };

  const cargarPracticas = async (competenciaId) => {
    try {
      const res = await api.get(`practicas/?competencia=${competenciaId}`);
      setPracticas(res.data);
    } catch (err) {
      console.error('Error cargando prácticas:', err);
    }
  };

  const cargarDetallePractica = async (practicaId) => {
    try {
      const res = await api.get(`practicas/${practicaId}/`);
      setPracticaDetalle(res.data);
    } catch (err) {
      console.error('Error cargando detalle:', err);
    }
  };

  const verificarReactivosSensibles = async (reactivos) => {
    const sensiblesEncontrados = [];
    
    for (const reactivo of reactivos) {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`http://127.0.0.1:8000/api/productos/${reactivo.id}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.es_sensible) {
            sensiblesEncontrados.push({
              nombre: reactivo.nombre,
              cantidad: reactivo.cantidad_total,
              unidad: reactivo.unidad
            });
          }
        }
      } catch (error) {
        console.error('Error verificando reactivo:', error);
      }
    }
    
    setAlertasSensibles(sensiblesEncontrados);
    return sensiblesEncontrados;
  };

  const calcularPedido = async () => {
    if (!selectedPractica || numeroGrupos < 1) {
      toast.warning('⚠️ Seleccione una práctica y un número válido de grupos', {
        position: "top-right",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    setCalculando(true);
    try {
      const res = await api.post('calculo-pedido/calcular/', {
        practica_id: selectedPractica,
        numero_grupos: numeroGrupos
      });
      setResultado(res.data);
      
      if (res.data.reactivos && res.data.reactivos.length > 0) {
        await verificarReactivosSensibles(res.data.reactivos);
      }
      
      if (!res.data.tiene_stock_suficiente) {
        toast.info('⚠️ Algunos productos no tienen stock suficiente. El pedido requerirá aprobación del Jefe.', {
          position: "top-right",
          autoClose: 4000,
          theme: "colored"
        });
      } else {
        toast.success('✅ Cálculo completado. Revise los detalles del pedido.', {
          position: "top-right",
          autoClose: 3000,
          theme: "colored"
        });
      }
    } catch (err) {
      console.error('Error calculando:', err);
      toast.error('❌ Error al calcular el pedido. Intente nuevamente.', {
        position: "top-right",
        autoClose: 4000,
        theme: "colored"
      });
    } finally {
      setCalculando(false);
    }
  };

  const generarPedido = async () => {
    if (!resultado) return;

    const obs = prompt('Observaciones (opcional):', observaciones);
    try {
      const res = await api.post('calculo-pedido/generar_pedido/', {
        practica_id: selectedPractica,
        numero_grupos: numeroGrupos,
        observaciones: obs || ''
      });
      
      toast.success(`✅ Pedido generado exitosamente! Solicitud ID: ${res.data.solicitud_id}`, {
        position: "top-right",
        autoClose: 5000,
        theme: "colored"
      });
      
      setSelectedPrograma('');
      setSelectedCompetencia('');
      setSelectedPractica('');
      setResultado(null);
      setPracticaDetalle(null);
      setAlertasSensibles([]);
    } catch (err) {
      console.error('Error generando pedido:', err);
      toast.error('❌ Error al generar el pedido', {
        position: "top-right",
        autoClose: 4000,
        theme: "colored"
      });
    }
  };

  const generarPDF = async () => {
    if (!selectedPractica) {
      toast.warning('⚠️ Primero seleccione una práctica', {
        position: "top-right",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/generar-pdf-solicitud/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          practica_id: selectedPractica,
          numero_grupos: numeroGrupos,
          observaciones: observaciones || ''
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `solicitud_${practicaDetalle?.nombre || 'practica'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success('📄 PDF generado exitosamente', {
          position: "top-right",
          autoClose: 3000,
          theme: "colored"
        });
      } else {
        const error = await response.json();
        toast.error('❌ Error al generar PDF: ' + (error.error || 'Error desconocido'), {
          position: "top-right",
          autoClose: 4000,
          theme: "colored"
        });
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al generar el PDF', {
        position: "top-right",
        autoClose: 4000,
        theme: "colored"
      });
    }
  };

  return (
    <Layout>
      <ToastContainer />
      <div className="p-6 max-w-5xl mx-auto">
        {/* Encabezado */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-stone-800">
            📋 Generar Solicitud de Práctica
          </h1>
          <p className="text-stone-500 mt-2">Seleccione programa, competencia y práctica para generar el pedido automáticamente</p>
        </motion.div>

        {/* Alerta de reactivos sensibles - Estilo mate */}
        <AnimatePresence>
          {alertasSensibles.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 bg-amber-50 border-l-4 border-amber-600 rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-700 text-xl">⚠️</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800 text-base">¡Cuidado! Reactivos Sensibles Detectados</h3>
                    <p className="text-amber-700 text-sm mt-1 mb-3">Los siguientes reactivos son de CONTROL ESPECIAL y requieren doble aprobación:</p>
                    <div className="flex flex-wrap gap-2">
                      {alertasSensibles.map((r, idx) => (
                        <span key={idx} className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                          🔴 {r.nombre} - {r.cantidad} {r.unidad}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-amber-600 mt-3">⚠️ Estos reactivos requieren trazabilidad completa y autorización especial del Jefe.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paso 1: Programa - Tarjeta mate */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-stone-50 rounded-xl border border-stone-200 p-6 mb-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-emerald-700 font-bold text-sm">1</span>
            </div>
            <h2 className="text-lg font-semibold text-stone-700">Seleccione Programa</h2>
          </div>
          <select
            value={selectedPrograma}
            onChange={(e) => setSelectedPrograma(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-lg px-4 py-2.5 text-stone-700 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-all"
          >
            <option value="">-- Seleccione un programa --</option>
            {programas.map(p => (
              <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
            ))}
          </select>
        </motion.div>

        {/* Paso 2: Competencia */}
        {selectedPrograma && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-stone-50 rounded-xl border border-stone-200 p-6 mb-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-emerald-700 font-bold text-sm">2</span>
              </div>
              <h2 className="text-lg font-semibold text-stone-700">Seleccione Competencia</h2>
            </div>
            <select
              value={selectedCompetencia}
              onChange={(e) => setSelectedCompetencia(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg px-4 py-2.5 text-stone-700 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-all"
              disabled={competencias.length === 0}
            >
              <option value="">-- Seleccione una competencia --</option>
              {competencias.map(c => (
                <option key={c.id} value={c.id}>{c.codigo} - {c.nombre.substring(0, 80)}</option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Paso 3: Práctica */}
        {selectedCompetencia && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-stone-50 rounded-xl border border-stone-200 p-6 mb-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-emerald-700 font-bold text-sm">3</span>
              </div>
              <h2 className="text-lg font-semibold text-stone-700">Seleccione Práctica</h2>
            </div>
            <select
              value={selectedPractica}
              onChange={(e) => setSelectedPractica(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg px-4 py-2.5 text-stone-700 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-all"
              disabled={practicas.length === 0}
            >
              <option value="">-- Seleccione una práctica --</option>
              {practicas.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Detalle de la práctica - Mate */}
        {practicaDetalle && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-50 rounded-xl border border-stone-200 p-6 mb-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-stone-700 mb-4">📖 Detalle de la Práctica</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-xs text-stone-400 uppercase tracking-wide">Nombre</label>
                <p className="font-medium text-stone-700 mt-1">{practicaDetalle.nombre}</p>
              </div>
              <div>
                <label className="text-xs text-stone-400 uppercase tracking-wide">Ficha</label>
                <p className="font-medium text-stone-700 mt-1">{practicaDetalle.ficha}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-stone-600 mb-2">Número de grupos:</label>
                <input
                  type="number"
                  min="1"
                  value={numeroGrupos}
                  onChange={(e) => setNumeroGrupos(parseInt(e.target.value) || 1)}
                  className="w-40 bg-white border border-stone-200 rounded-lg px-4 py-2 text-stone-700 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <button
                onClick={calcularPedido}
                disabled={calculando}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
              >
                {calculando ? '🔄 Calculando...' : '🔢 Calcular Cantidades'}
              </button>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-stone-600 mb-2">Observaciones:</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-lg px-4 py-2.5 text-stone-700 focus:outline-none focus:border-emerald-400"
                rows="3"
                placeholder="Observaciones adicionales..."
              />
            </div>
          </motion.div>
        )}

        {/* Resultado del cálculo */}
        {resultado && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-50 rounded-xl border border-stone-200 p-6 mb-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-stone-700 mb-4">📊 Resumen del Pedido</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-white rounded-lg border border-stone-100">
              <div>
                <span className="text-xs text-stone-400 uppercase tracking-wide">Práctica</span>
                <p className="font-medium text-stone-700 mt-1">{resultado.practica?.nombre}</p>
              </div>
              <div>
                <span className="text-xs text-stone-400 uppercase tracking-wide">Grupos</span>
                <p className="font-medium text-stone-700 mt-1">{resultado.numero_grupos}</p>
              </div>
            </div>
            
            {resultado.reactivos && resultado.reactivos.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-stone-700 mb-3">🧪 Reactivos a solicitar:</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden border border-stone-200">
                    <thead className="bg-stone-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-stone-600">Reactivo</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-stone-600">Cantidad Total</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-stone-600">Stock Actual</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-stone-600">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {resultado.reactivos.map((r, i) => (
                        <tr key={i} className="hover:bg-stone-50">
                          <td className="px-4 py-3 text-sm text-stone-700">
                            {r.nombre}
                            {alertasSensibles.some(s => s.nombre === r.nombre) && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700">
                                ⚠️ SENSIBLE
                              </span>
                            )}
                           </td>
                          <td className="px-4 py-3 text-sm text-stone-700">{r.cantidad_total} {r.unidad}</td>
                          <td className="px-4 py-3 text-sm text-stone-700">{r.stock_actual}</td>
                          <td className="px-4 py-3 text-sm">
                            {r.suficiente ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                                ✅ Suficiente
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700">
                                ⚠️ Insuficiente
                              </span>
                            )}
                          </td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {resultado.materiales && resultado.materiales.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-stone-700 mb-3">📦 Materiales a solicitar:</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg overflow-hidden border border-stone-200">
                    <thead className="bg-stone-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-stone-600">Material</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-stone-600">Cantidad Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {resultado.materiales.map((m, i) => (
                        <tr key={i} className="hover:bg-stone-50">
                          <td className="px-4 py-3 text-sm text-stone-700">{m.nombre}</td>
                          <td className="px-4 py-3 text-sm text-stone-700">{m.cantidad_total}</td>
                         </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <button
                onClick={generarPedido}
                className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md font-medium"
              >
                ✅ Confirmar y Generar Pedido
              </button>
              <button
                onClick={generarPDF}
                className="flex-1 bg-stone-600 text-white px-6 py-3 rounded-lg hover:bg-stone-700 transition-all shadow-sm hover:shadow-md font-medium"
              >
                📄 Generar PDF
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default SelectorPractica;