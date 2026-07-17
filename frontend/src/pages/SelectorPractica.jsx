import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

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
  
  // NUEVOS ESTADOS PARA BUSCADOR
  const [filtroPrograma, setFiltroPrograma] = useState('');
  const [filtroCompetencia, setFiltroCompetencia] = useState('');
  const [filtroPractica, setFiltroPractica] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // NUEVOS ESTADOS PARA FECHA Y HORA
  const [fechaPractica, setFechaPractica] = useState(new Date().toISOString().split('T')[0]);
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
      // ✅ Verificar que sea un array
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setProgramas(data);
    } catch (err) { 
      console.error('Error cargando programas:', err);
      setProgramas([]);
    }
  };

  const cargarCompetencias = async (programaId) => {
    try {
      const res = await api.get(`competencias/?programa=${programaId}`);
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setCompetencias(data);
    } catch (err) { 
      console.error('Error cargando competencias:', err);
      setCompetencias([]);
    }
  };

  const cargarPracticas = async (competenciaId) => {
    try {
      const res = await api.get(`practicas/?competencia=${competenciaId}`);
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setPracticas(data);
    } catch (err) { 
      console.error('Error cargando prácticas:', err);
      setPracticas([]);
    }
  };

  const cargarDetallePractica = async (practicaId) => {
    try {
      const res = await api.get(`practicas/${practicaId}/`);
      setPracticaDetalle(res.data);
    } catch (err) { 
      console.error('Error cargando detalle:', err);
      setPracticaDetalle(null);
    }
  };

  // ✅ FILTROS CON VERIFICACIÓN DE ARRAY
  const programasLista = Array.isArray(programas) ? programas : [];
  const competenciasLista = Array.isArray(competencias) ? competencias : [];
  const practicasLista = Array.isArray(practicas) ? practicas : [];

  const programasFiltrados = programasLista.filter(p => 
    p.nombre?.toLowerCase().includes(filtroPrograma.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(filtroPrograma.toLowerCase())
  );

  const competenciasFiltradas = competenciasLista.filter(c => 
    c.nombre?.toLowerCase().includes(filtroCompetencia.toLowerCase()) ||
    c.codigo?.toLowerCase().includes(filtroCompetencia.toLowerCase())
  );

  const practicasFiltradas = practicasLista.filter(p => 
    p.nombre?.toLowerCase().includes(filtroPractica.toLowerCase())
  );

  const verificarReactivosSensibles = async (reactivos) => {
    const sensiblesEncontrados = [];
    if (!Array.isArray(reactivos)) return sensiblesEncontrados;
    
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
    if (!fechaPractica) {
      toast.warning('⚠️ Por favor seleccione una fecha para la práctica');
      return;
    }
    const obs = prompt('Observaciones (opcional):', observaciones);
    try {
      const res = await api.post('calculo-pedido/generar_pedido/', {
        practica_id: selectedPractica,
        numero_grupos: numeroGrupos,
        observaciones: obs || '',
        franja: franjaSeleccionada,
        fecha: fechaPractica,
        hora_inicio: horaInicio,
        hora_fin: horaFin
      });
      toast.success(`✅ Pedido generado exitosamente! Solicitud ID: ${res.data.solicitud_id}`);
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
      setFiltroPrograma('');
      setFiltroCompetencia('');
      setFiltroPractica('');
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
          observaciones: observaciones || '',
          fecha: fechaPractica,
          franja: franjaSeleccionada,
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

        {/* TARJETA PRINCIPAL */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-stone-800 flex items-center gap-2">
              <span>📋</span> Nueva Solicitud
            </h2>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              {mostrarFiltros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* FILTROS DE BÚSQUEDA */}
          {mostrarFiltros && (
            <div className="mb-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <h3 className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Buscar por nombre o código
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar programa..."
                    value={filtroPrograma}
                    onChange={(e) => setFiltroPrograma(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-400"
                  />
                  {filtroPrograma && (
                    <button
                      onClick={() => setFiltroPrograma('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar competencia..."
                    value={filtroCompetencia}
                    onChange={(e) => setFiltroCompetencia(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-400"
                  />
                  {filtroCompetencia && (
                    <button
                      onClick={() => setFiltroCompetencia('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar práctica..."
                    value={filtroPractica}
                    onChange={(e) => setFiltroPractica(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-emerald-400"
                  />
                  {filtroPractica && (
                    <button
                      onClick={() => setFiltroPractica('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-stone-400 mt-2">
                {programasFiltrados.length} programas encontrados
              </p>
            </div>
          )}

          {/* Fila 1: Programa */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Programa de formación
              {filtroPrograma && (
                <span className="ml-2 text-xs text-emerald-600 font-normal">
                  ({programasFiltrados.length} resultados)
                </span>
              )}
            </label>
            <select 
              value={selectedPrograma} 
              onChange={(e) => setSelectedPrograma(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
            >
              <option value="">Seleccione un programa</option>
              {programasFiltrados.map(p => (
                <option key={p.id} value={p.id}>
                  {p.codigo} - {p.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Fila 2: Competencia */}
          {selectedPrograma && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Competencia
                {filtroCompetencia && (
                  <span className="ml-2 text-xs text-emerald-600 font-normal">
                    ({competenciasFiltradas.length} resultados)
                  </span>
                )}
              </label>
              <select 
                value={selectedCompetencia} 
                onChange={(e) => setSelectedCompetencia(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
                disabled={competenciasFiltradas.length === 0}
              >
                <option value="">Seleccione una competencia</option>
                {competenciasFiltradas.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} - {c.nombre}
                  </option>
                ))}
              </select>
              {competenciasFiltradas.length === 0 && filtroCompetencia && (
                <p className="text-sm text-amber-600 mt-1">No hay competencias que coincidan con tu búsqueda</p>
              )}
            </div>
          )}

          {/* Fila 3: Práctica */}
          {selectedCompetencia && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Práctica / Actividad
                {filtroPractica && (
                  <span className="ml-2 text-xs text-emerald-600 font-normal">
                    ({practicasFiltradas.length} resultados)
                  </span>
                )}
              </label>
              <select 
                value={selectedPractica} 
                onChange={(e) => setSelectedPractica(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
                disabled={practicasFiltradas.length === 0}
              >
                <option value="">Seleccione una práctica</option>
                {practicasFiltradas.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              {practicasFiltradas.length === 0 && filtroPractica && (
                <p className="text-sm text-amber-600 mt-1">No hay prácticas que coincidan con tu búsqueda</p>
              )}
            </div>
          )}

          {/* Detalles adicionales */}
          {practicaDetalle && (
            <>
              {/* Fila 4: Fecha y Franja */}
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">🕐 Franja Horaria</label>
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
                </div>
              </div>

              {/* Fila 5: Hora Inicio y Hora Fin */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">⏰ Hora de inicio</label>
                  <input 
                    type="time" 
                    value={horaInicio} 
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">⏰ Hora de fin</label>
                  <input 
                    type="time" 
                    value={horaFin} 
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-stone-700"
                  />
                </div>
              </div>

              {/* Fila 6: Número de grupos y botón calcular */}
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

              {/* Fila 7: Observaciones */}
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
            </>
          )}

          {/* Resultado del cálculo */}
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
                  <p className="text-sm text-stone-500">📅 Fecha</p>
                  <p className="font-medium text-stone-800">{fechaPractica || 'No definida'}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">🕐 Franja</p>
                  <p className="font-medium text-stone-800">{franjaSeleccionada || 'No definida'}</p>
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

              <div className="mt-6 flex flex-wrap gap-3">
                <button 
                  onClick={generarPedido} 
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md font-medium"
                >
                  ✅ Enviar Solicitud
                </button>
                <button 
                  onClick={generarPDF} 
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium flex items-center justify-center gap-2"
                >
                  📄 Generar PDF
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
                    setHoraFin('12:00');
                    setFiltroPrograma('');
                    setFiltroCompetencia('');
                    setFiltroPractica('');
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