import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { motion } from 'framer-motion';
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
  const [franjaSeleccionada, setFranjaSeleccionada] = useState('');

  useEffect(() => { cargarProgramas(); }, []);

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
    } catch (err) { console.error('Error cargando programas:', err); }
  };

  const cargarCompetencias = async (programaId) => {
    try {
      const res = await api.get(`competencias/?programa=${programaId}`);
      setCompetencias(res.data);
    } catch (err) { console.error('Error cargando competencias:', err); }
  };

  const cargarPracticas = async (competenciaId) => {
    try {
      const res = await api.get(`practicas/?competencia=${competenciaId}`);
      setPracticas(res.data);
    } catch (err) { console.error('Error cargando prácticas:', err); }
  };

  const cargarDetallePractica = async (practicaId) => {
    try {
      const res = await api.get(`practicas/${practicaId}/`);
      setPracticaDetalle(res.data);
    } catch (err) { console.error('Error cargando detalle:', err); }
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
      } catch (error) { console.error('Error verificando reactivo:', error); }
    }
    setAlertasSensibles(sensiblesEncontrados);
    return sensiblesEncontrados;
  };

  const calcularPedido = async () => {
    if (!selectedPractica || numeroGrupos < 1) {
      toast.warning('⚠️ Seleccione una práctica y un número válido de grupos');
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
        toast.info('⚠️ Algunos productos no tienen stock suficiente. El pedido requerirá aprobación del Jefe.');
      } else {
        toast.success('✅ Cálculo completado. Revise los detalles del pedido.');
      }
    } catch (err) {
      console.error('Error calculando:', err);
      toast.error('❌ Error al calcular el pedido. Intente nuevamente.');
    } finally {
      setCalculando(false);
    }
  };

  const generarPedido = async () => {
    if (!resultado) return;
    if (!franjaSeleccionada) {
      toast.warning('⚠️ Por favor seleccione una franja horaria para la programación');
      return;
    }
    const obs = prompt('Observaciones (opcional):', observaciones);
    try {
      const res = await api.post('calculo-pedido/generar_pedido/', {
        practica_id: selectedPractica,
        numero_grupos: numeroGrupos,
        observaciones: obs || '',
        franja: franjaSeleccionada
      });
      toast.success(`✅ Pedido generado exitosamente! Solicitud ID: ${res.data.solicitud_id}`);
      setSelectedPrograma('');
      setSelectedCompetencia('');
      setSelectedPractica('');
      setResultado(null);
      setPracticaDetalle(null);
      setAlertasSensibles([]);
      setFranjaSeleccionada('');
    } catch (err) {
      console.error('Error generando pedido:', err);
      toast.error('❌ Error al generar el pedido');
    }
  };

  const generarPDF = async () => {
    if (!selectedPractica) {
      toast.warning('⚠️ Primero seleccione una práctica');
      return;
    }
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/generar-pdf-solicitud/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
        toast.success('📄 PDF generado exitosamente');
      } else {
        const error = await response.json();
        toast.error('❌ Error al generar PDF: ' + (error.error || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al generar el PDF');
    }
  };

  return (
    <Layout>
      <ToastContainer />
      <div className="p-6 max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📋</span>
            <div>
              <h1 className="text-3xl font-bold text-stone-800">Generar Solicitud</h1>
              <p className="text-stone-500 text-sm mt-1">Solicita reactivos, materiales o equipos para tus prácticas</p>
            </div>
          </div>
        </div>

        {/* Alerta de reactivos sensibles */}
        {alertasSensibles.length > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold">Reactivos Sensibles Detectados</p>
                <ul className="list-disc list-inside text-sm ml-2">
                  {alertasSensibles.map((r, idx) => (
                    <li key={idx}><strong>{r.nombre}</strong> - {r.cantidad} {r.unidad}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ========== UNA SOLA TARJETA GRANDE ========== */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-6 flex items-center gap-2">
            <span>📋</span> Nueva Solicitud
          </h2>

          {/* Fila 1: Programa */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-stone-700 mb-2">Programa de formación</label>
            <select 
              value={selectedPrograma} 
              onChange={(e) => setSelectedPrograma(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
            >
              <option value="">Seleccione un programa</option>
              {programas.map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}
            </select>
          </div>

          {/* Fila 2: Competencia (condicional) */}
          {selectedPrograma && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-stone-700 mb-2">Competencia</label>
              <select 
                value={selectedCompetencia} 
                onChange={(e) => setSelectedCompetencia(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
                disabled={competencias.length === 0}
              >
                <option value="">Seleccione una competencia</option>
                {competencias.map(c => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
              </select>
            </div>
          )}

          {/* Fila 3: Práctica (condicional) */}
          {selectedCompetencia && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-stone-700 mb-2">Práctica / Actividad</label>
              <select 
                value={selectedPractica} 
                onChange={(e) => setSelectedPractica(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
                disabled={practicas.length === 0}
              >
                <option value="">Seleccione una práctica</option>
                {practicas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          )}

          {/* Detalles adicionales (solo cuando hay práctica seleccionada) */}
          {practicaDetalle && (
            <>
              {/* Fila 4: Número de grupos y botón calcular */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Número de grupos</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={numeroGrupos} 
                    onChange={(e) => setNumeroGrupos(parseInt(e.target.value) || 1)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={calcularPedido} 
                    disabled={calculando}
                    className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md font-medium"
                  >
                    {calculando ? 'Calculando...' : 'Calcular Cantidades'}
                  </button>
                </div>
              </div>

              {/* Fila 5: Observaciones */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-stone-700 mb-2">Observaciones</label>
                <textarea 
                  value={observaciones} 
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
                  rows="3" 
                  placeholder="Escribir el motivo de la solicitud..." 
                />
              </div>

              {/* Fila 6: Franja Horaria */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-stone-700 mb-2">Franja Horaria</label>
                <select 
                  value={franjaSeleccionada} 
                  onChange={(e) => setFranjaSeleccionada(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
                >
                  <option value="">Seleccione una franja</option>
                  <option value="Mañana">🌅 Mañana (6:00-12:00)</option>
                  <option value="Tarde">☀️ Tarde (12:00-18:00)</option>
                  <option value="Noche">🌙 Noche (18:00-22:00)</option>
                </select>
                <p className="text-xs text-stone-400 mt-1">La práctica se programará en esta franja horaria</p>
              </div>
            </>
          )}

          {/* Resultado del cálculo (dentro de la misma tarjeta) */}
          {resultado && (
            <>
              <div className="border-t border-stone-200 my-6"></div>
              <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <span>📊</span> Resumen del Pedido
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm text-stone-500">Práctica</p>
                  <p className="font-medium text-stone-800">{resultado.practica?.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">Grupos</p>
                  <p className="font-medium text-stone-800">{resultado.numero_grupos}</p>
                </div>
              </div>
              
              {resultado.reactivos && resultado.reactivos.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-stone-700 mb-3">🧪 Reactivos a solicitar</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-stone-200 rounded-xl overflow-hidden">
                      <thead className="bg-stone-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Reactivo</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Cantidad</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Stock</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {resultado.reactivos.map((r, i) => (
                          <tr key={i} className="hover:bg-stone-50">
                            <td className="px-4 py-3 text-sm">
                              {r.nombre}
                              {alertasSensibles.some(s => s.nombre === r.nombre) && (
                                <span className="ml-2 text-red-500 text-xs font-bold">⚠️ SENSIBLE</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">{r.cantidad_total} {r.unidad}</td>
                            <td className="px-4 py-3 text-sm">{r.stock_actual}</td>
                            <td className="px-4 py-3 text-sm">
                              {r.suficiente ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">✅ Suficiente</span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">⚠️ Insuficiente</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={generarPedido} 
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md font-medium"
                >
                  ✅ Enviar Solicitud
                </button>
                <button 
                  onClick={() => {
                    setResultado(null);
                    setSelectedPrograma('');
                    setSelectedCompetencia('');
                    setSelectedPractica('');
                    setPracticaDetalle(null);
                    setFranjaSeleccionada('');
                  }} 
                  className="flex-1 border border-stone-200 text-stone-600 px-6 py-3 rounded-xl hover:bg-stone-50 transition-all font-medium"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
        {/* ========== FIN DE LA TARJETA GRANDE ========== */}
      </div>
    </Layout>
  );
};

export default SelectorPractica;