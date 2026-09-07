import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api, { asArray } from '../services/api';
import { motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showSuccess, showWarning, showError, showInfo } from '../utils/toastHelpers';

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
  const [errorCronograma, setErrorCronograma] = useState(null);
  
  // ====== FECHA Y HORA ======
  const [fechaPractica, setFechaPractica] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('12:00');

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
      setErrorCronograma(null);
    }
  }, [selectedPrograma]);

  useEffect(() => {
    if (selectedCompetencia) {
      cargarPracticas(selectedCompetencia);
      setSelectedPractica('');
      setPracticaDetalle(null);
      setResultado(null);
      setAlertasSensibles([]);
      setErrorCronograma(null);
    }
  }, [selectedCompetencia]);

  useEffect(() => {
    if (selectedPractica) {
      cargarDetallePractica(selectedPractica);
      setResultado(null);
      setAlertasSensibles([]);
      setErrorCronograma(null);
    }
  }, [selectedPractica]);

  const cargarProgramas = async () => {
    try {
      const res = await api.get('programas/');
      setProgramas(asArray(res.data));
    } catch (err) { console.error('Error cargando programas:', err); }
  };

  const cargarCompetencias = async (programaId) => {
    try {
      const res = await api.get(`competencias/?programa=${programaId}`);
      setCompetencias(asArray(res.data));
    } catch (err) { console.error('Error cargando competencias:', err); }
  };

  const cargarPracticas = async (competenciaId) => {
    try {
      const res = await api.get(`practicas/?competencia=${competenciaId}`);
      setPracticas(asArray(res.data));
      if (res.data.length === 0) {
        showInfo('📋 No hay prácticas disponibles para esta competencia');
      }
    } catch (err) { console.error('Error cargando prácticas:', err); }
  };

  const cargarDetallePractica = async (practicaId) => {
    console.log('🔍 1. Iniciando carga de práctica ID:', practicaId);
    
    try {
      console.log('🔍 2. Haciendo fetch a practicas/' + practicaId + '/');
      const res = await api.get(`practicas/${practicaId}/`);
      
      console.log('🔍 3. Respuesta completa:', res);
      console.log('🔍 4. Datos de la práctica:', res.data);
      console.log('🔍 5. Reactivos en la respuesta:', res.data.reactivos);
      console.log('🔍 6. Equipos en la respuesta:', res.data.equipos);
      console.log('🔍 7. Materiales en la respuesta:', res.data.materiales);
      
      const practica = res.data;
      
      if (!practica.reactivos || practica.reactivos.length === 0) {
        console.log('⚠️ 8. No hay reactivos en la respuesta, intentando cargar por separado...');
        try {
          const reactivosRes = await api.get(`practicas/${practicaId}/reactivos/`);
          console.log('📦 9. Reactivos cargados por separado:', reactivosRes.data);
          practica.reactivos = reactivosRes.data || [];
        } catch (e) {
          console.warn('❌ 10. Error cargando reactivos por separado:', e);
          practica.reactivos = [];
        }
      }
      
      if (!practica.equipos || practica.equipos.length === 0) {
        console.log('⚠️ 11. No hay equipos en la respuesta, intentando cargar por separado...');
        try {
          const equiposRes = await api.get(`practicas/${practicaId}/equipos/`);
          console.log('📦 12. Equipos cargados por separado:', equiposRes.data);
          practica.equipos = equiposRes.data || [];
        } catch (e) {
          console.warn('❌ 13. Error cargando equipos por separado:', e);
          practica.equipos = [];
        }
      }
      
      if (!practica.reactivos) practica.reactivos = [];
      if (!practica.equipos) practica.equipos = [];
      if (!practica.materiales) practica.materiales = [];
      
      console.log('✅ 14. Datos finales de la práctica:', {
        id: practica.id,
        nombre: practica.nombre,
        reactivos: practica.reactivos.length,
        equipos: practica.equipos.length,
        materiales: practica.materiales.length,
        reactivos_data: practica.reactivos,
        equipos_data: practica.equipos,
        materiales_data: practica.materiales
      });
      
      setPracticaDetalle(practica);
      console.log('✅ 15. Estado practicaDetalle actualizado');
      
    } catch (err) {
      console.error('❌ 16. Error en cargarDetallePractica:', err);
      showError('❌ Error al cargar los detalles de la práctica');
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
      } catch (error) { console.error('Error verificando reactivo:', error); }
    }
    setAlertasSensibles(sensiblesEncontrados);
    return sensiblesEncontrados;
  };

  const calcularPedido = async () => {
    if (!selectedPractica || numeroGrupos < 1) {
      showWarning('⚠️ Seleccione una práctica y un número válido de grupos');
      return;
    }
    setCalculando(true);
    setErrorCronograma(null);
    try {
      const res = await api.post('calculo-pedido/calcular/', {
        practica_id: selectedPractica,
        numero_grupos: numeroGrupos
      });
      
      const data = res.data;
      let reactivos = data.reactivos || [];
      let equipos = data.equipos || [];
      
      if (equipos.length === 0 && reactivos.length > 0) {
        const palabrasEquipo = ['Analizador', 'Balanza', 'Microscopio', 'Cabina', 'pH-metro', 'Conductímetro', 'Sottec', 'Refractómetro', 'Horno', 'Centrífuga', 'Campana', 'Flujo', 'Electroforesis', 'Turbidímetro', 'Nevera', 'Erlenmeyer'];
        
        equipos = reactivos.filter(r => 
          palabrasEquipo.some(palabra => r.nombre.includes(palabra))
        );
        reactivos = reactivos.filter(r => 
          !palabrasEquipo.some(palabra => r.nombre.includes(palabra))
        );
      }
      
      setResultado({
        ...data,
        reactivos: reactivos,
        equipos: equipos
      });
      
      if (reactivos && reactivos.length > 0) {
        await verificarReactivosSensibles(reactivos);
      }
      
      const tieneStockSuficiente = reactivos.every(r => r.suficiente) && equipos.every(e => e.suficiente);
      
      if (!tieneStockSuficiente) {
        showInfo('⚠️ Algunos productos no tienen stock suficiente. El pedido requerirá aprobación del Jefe.');
      } else {
        showSuccess('✅ Cálculo completado. Revise los detalles del pedido.');
      }
    } catch (err) {
      console.error('Error calculando:', err);
      showError('❌ Error al calcular el pedido. Intente nuevamente.');
    } finally {
      setCalculando(false);
    }
  };

  const generarPedido = async () => {
    if (!resultado) return;
    if (!franjaSeleccionada) {
      showWarning('⚠️ Por favor seleccione una franja horaria para la programación');
      return;
    }
    if (!fechaPractica) {
      showWarning('⚠️ Por favor seleccione una fecha para la práctica');
      return;
    }
    if (!horaInicio) {
      showWarning('⚠️ Por favor seleccione una hora de inicio');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/calculo-pedido/generar_pedido/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          practica_id: selectedPractica,
          numero_grupos: numeroGrupos,
          observaciones: observaciones || '',
          franja: franjaSeleccionada,
          fecha: fechaPractica,
          hora_inicio: horaInicio,
          hora_fin: horaFin || null,
          ambiente: 'TOC 501'
        })
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('✅ Pedido generado exitosamente!');
        showInfo(`📅 Programado para: ${fechaPractica} - ${horaInicio}${horaFin ? ` a ${horaFin}` : ''}`);
        
        setErrorCronograma(null);
        setSelectedPrograma('');
        setSelectedCompetencia('');
        setSelectedPractica('');
        setResultado(null);
        setPracticaDetalle(null);
        setAlertasSensibles([]);
        setFranjaSeleccionada('');
        setFechaPractica(new Date().toISOString().split('T')[0]);
        setHoraInicio('08:00');
        setHoraFin('12:00');
        setObservaciones('');
      } else {
        const error = await response.json();
        
        if (error.error && error.error.includes('Cronograma completo')) {
          showError(`⚠️ ${error.error}`);
          showInfo(`📊 ${error.detalle}`);
          setErrorCronograma({
            mensaje: error.error,
            detalle: error.detalle,
            programaciones: error.programaciones_existentes,
            limite: error.limite,
            fecha: error.fecha,
            ambiente: error.ambiente
          });
        } else {
          showError('❌ Error al generar el pedido: ' + (error.error || 'Error desconocido'));
        }
      }
    } catch (err) {
      console.error('Error generando pedido:', err);
      showError('❌ Error al generar el pedido');
    }
  };

  const generarPDF = async () => {
    if (!selectedPractica) {
      showWarning('⚠️ Primero seleccione una práctica');
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
          observaciones: observaciones || '',
          fecha: fechaPractica,
          hora_inicio: horaInicio,
          hora_fin: horaFin
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
        showSuccess('📄 PDF generado exitosamente');
      } else {
        const error = await response.json();
        showError('❌ Error al generar PDF: ' + (error.error || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error:', err);
      showError('❌ Error al generar el PDF');
    }
  };

  return (
    <Layout>
      <ToastContainer 
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={true}
        limit={1}
        closeButton={true}
        style={{ width: '400px' }}
        toastClassName="custom-toast"
        progressClassName="custom-progress"
      />
      <div className="p-6 max-w-4xl mx-auto animate-fade-in">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📋</span>
            <div>
              <h1 className="text-3xl font-bold text-stone-800">Generar Solicitud</h1>
              <p className="text-stone-500 text-sm mt-1">Solicita reactivos, materiales o equipos para tus prácticas</p>
            </div>
          </div>
        </div>

        {errorCronograma && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚫</span>
              <div>
                <p className="font-bold">{errorCronograma.mensaje}</p>
                <p className="text-sm">{errorCronograma.detalle}</p>
                <p className="text-xs mt-1">
                  Prácticas actuales: <strong>{errorCronograma.programaciones}</strong> de <strong>{errorCronograma.limite}</strong> disponibles
                </p>
                <button
                  onClick={() => {
                    setErrorCronograma(null);
                    setFechaPractica(new Date().toISOString().split('T')[0]);
                  }}
                  className="mt-2 text-sm bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Seleccionar otra fecha
                </button>
              </div>
            </div>
          </div>
        )}

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

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          <h2 className="text-xl font-semibold text-stone-800 mb-6 flex items-center gap-2">
            <span>📋</span> Nueva Solicitud
          </h2>

          <div className="mb-5">
            <label className="block text-sm font-medium text-stone-700 mb-2">📚 Programa de formación</label>
            <select 
              value={selectedPrograma} 
              onChange={(e) => setSelectedPrograma(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
            >
              <option value="">Seleccione un programa</option>
              {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          {selectedPrograma && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-stone-700 mb-2">🎯 Competencia</label>
              <select 
                value={selectedCompetencia} 
                onChange={(e) => setSelectedCompetencia(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
                disabled={competencias.length === 0}
              >
                <option value="">Seleccione una competencia</option>
                {competencias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              {competencias.length === 0 && selectedPrograma && (
                <p className="text-xs text-amber-500 mt-1">No hay competencias disponibles para este programa</p>
              )}
            </div>
          )}

          {selectedCompetencia && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-stone-700 mb-2">🧪 Práctica / Actividad</label>
              <select 
                value={selectedPractica} 
                onChange={(e) => setSelectedPractica(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
                disabled={practicas.length === 0}
              >
                <option value="">Seleccione una práctica</option>
                {practicas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              {practicas.length > 0 && (
                <p className="text-xs text-stone-400 mt-1">
                  {practicas.length} práctica{practicas.length !== 1 ? 's' : ''} disponible{practicas.length !== 1 ? 's' : ''}
                </p>
              )}
              {practicas.length === 0 && selectedCompetencia && (
                <p className="text-xs text-amber-500 mt-1">No hay prácticas disponibles para esta competencia</p>
              )}
            </div>
          )}

          {practicaDetalle && (
            <>
              {practicaDetalle.reactivos && practicaDetalle.reactivos.length > 0 && (
                <div className="mb-5 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                    <span>🧪</span> Reactivos de esta práctica
                    <span className="text-xs font-normal text-emerald-600 ml-2">
                      ({practicaDetalle.reactivos.length})
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {practicaDetalle.reactivos.map((r, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-lg text-sm shadow-sm border border-emerald-100">
                        <div className="font-medium text-stone-800">
                          {r.reactivo_nombre || r.reactivo?.nombre || 'Reactivo'}
                        </div>
                        <div className="text-stone-500 text-xs flex items-center gap-2 mt-0.5">
                          <span>Cantidad: {r.cantidad} {r.unidad?.simbolo || r.unidad || ''}</span>
                          {r.es_sensible && <span className="text-red-500 font-bold">⚠️ SENSIBLE</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {practicaDetalle.equipos && practicaDetalle.equipos.length > 0 && (
                <div className="mb-5 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <span>🔧</span> Equipos de esta práctica
                    <span className="text-xs font-normal text-blue-600 ml-2">
                      ({practicaDetalle.equipos.length})
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {practicaDetalle.equipos.map((e, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-lg text-sm shadow-sm border border-blue-100">
                        <div className="font-medium text-stone-800">
                          {e.equipo_nombre || e.equipo?.nombre || 'Equipo'}
                        </div>
                        <div className="text-stone-500 text-xs mt-0.5">
                          Tiempo: {e.tiempo_uso_min || e.tiempo_uso || 0} min
                          {e.mantenimiento_requerido && ' 🔧 Mantenimiento'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {practicaDetalle.materiales && practicaDetalle.materiales.length > 0 && (
                <div className="mb-5 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <span>📦</span> Materiales de esta práctica
                    <span className="text-xs font-normal text-purple-600 ml-2">
                      ({practicaDetalle.materiales.length})
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {practicaDetalle.materiales.map((m, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-lg text-sm shadow-sm border border-purple-100">
                        <div className="font-medium text-stone-800">{m.nombre}</div>
                        <div className="text-stone-500 text-xs mt-0.5">
                          {m.cantidad_por_grupo} por grupo | Total: {m.cantidad_total}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">👥 Número de grupos</label>
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
                    className="w-full bg-[#1FA971] text-white px-6 py-3 rounded-xl hover:bg-[#157A55] disabled:opacity-50 transition-all shadow-sm hover:shadow-md font-medium"
                  >
                    {calculando ? '⏳ Calculando...' : '📊 Calcular Cantidades'}
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-stone-700 mb-2">📝 Observaciones</label>
                <textarea 
                  value={observaciones} 
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
                  rows="3" 
                  placeholder="Escribir el motivo de la solicitud..." 
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-stone-700 mb-2">⏰ Franja Horaria</label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">📅 Fecha de la práctica</label>
                  <input
                    type="date"
                    value={fechaPractica}
                    onChange={(e) => setFechaPractica(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
                  />
                  <p className="text-xs text-stone-400 mt-1">Selecciona la fecha para la práctica</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">⏰ Hora de inicio</label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
                  />
                  <p className="text-xs text-stone-400 mt-1">Hora de inicio de la práctica</p>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-stone-700 mb-2">⏰ Hora de finalización (opcional)</label>
                <input
                  type="time"
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
                />
                <p className="text-xs text-stone-400 mt-1">Hora de finalización de la práctica</p>
              </div>

              <button 
                onClick={generarPDF} 
                className="w-full bg-blue-50 text-blue-600 border border-blue-200 px-6 py-3 rounded-xl hover:bg-blue-100 transition-all font-medium flex items-center justify-center gap-2 mb-4"
              >
                📄 Generar PDF de Solicitud
              </button>
            </>
          )}

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
                <div>
                  <p className="text-sm text-stone-500">Fecha</p>
                  <p className="font-medium text-stone-800">{fechaPractica}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">Hora</p>
                  <p className="font-medium text-stone-800">{horaInicio}{horaFin ? ` - ${horaFin}` : ''}</p>
                </div>
              </div>

              {resultado.reactivos && resultado.reactivos.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                    <span>🧪</span> Reactivos a solicitar
                    <span className="text-xs text-stone-400 font-normal">
                      ({resultado.reactivos.length})
                    </span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-emerald-200 rounded-xl overflow-hidden">
                      <thead className="bg-emerald-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase">Reactivo</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase">Cantidad</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase">Stock</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-emerald-700 uppercase">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100">
                        {resultado.reactivos.map((r, i) => (
                          <tr key={i} className="hover:bg-emerald-50/50">
                            <td className="px-4 py-3 text-sm font-medium text-stone-700">
                              {r.nombre}
                              {alertasSensibles.some(s => s.nombre === r.nombre) && (
                                <span className="ml-2 text-red-500 text-xs font-bold">⚠️ SENSIBLE</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-stone-600">
                              {r.cantidad_total} {r.unidad || 'ml'}
                            </td>
                            <td className="px-4 py-3 text-sm text-stone-600">{r.stock_actual}</td>
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

              {resultado.equipos && resultado.equipos.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <span>🔧</span> Equipos a solicitar
                    <span className="text-xs text-stone-400 font-normal">
                      ({resultado.equipos.length})
                    </span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-blue-200 rounded-xl overflow-hidden">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase">Equipo</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase">Cantidad</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase">Stock</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-blue-700 uppercase">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-100">
                        {resultado.equipos.map((e, i) => (
                          <tr key={i} className="hover:bg-blue-50/50">
                            <td className="px-4 py-3 text-sm font-medium text-stone-700">
                              {e.nombre}
                            </td>
                            <td className="px-4 py-3 text-sm text-stone-600">
                              {e.cantidad_total} {e.unidad || 'ud'}
                            </td>
                            <td className="px-4 py-3 text-sm text-stone-600">{e.stock_actual}</td>
                            <td className="px-4 py-3 text-sm">
                              {e.suficiente ? (
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
                  className="flex-1 bg-[#1FA971] text-white px-6 py-3 rounded-xl hover:bg-[#157A55] transition-all shadow-sm hover:shadow-md font-medium"
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
                    setFechaPractica(new Date().toISOString().split('T')[0]);
                    setHoraInicio('08:00');
                    setHoraFin('10:00');
                    setObservaciones('');
                    setErrorCronograma(null);
                  }} 
                  className="flex-1 border border-stone-200 text-stone-600 px-6 py-3 rounded-xl hover:bg-stone-50 transition-all font-medium"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SelectorPractica;