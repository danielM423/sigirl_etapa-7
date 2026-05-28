import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

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
  // Dentro de calcularPedido, después de recibir data
setResultado(data);
if (!data.tiene_stock_suficiente) {
  alert("⚠️ Algunos productos no tienen stock suficiente. El pedido requerirá aprobación del Jefe.");
}


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
    }
  }, [selectedPrograma]);

  useEffect(() => {
    if (selectedCompetencia) {
      cargarPracticas(selectedCompetencia);
      setSelectedPractica('');
      setPracticaDetalle(null);
      setResultado(null);
    }
  }, [selectedCompetencia]);

  useEffect(() => {
    if (selectedPractica) {
      cargarDetallePractica(selectedPractica);
      setResultado(null);
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

  const calcularPedido = async () => {
    if (!selectedPractica || numeroGrupos < 1) {
      alert('Seleccione una práctica y un número válido de grupos');
      return;
    }

    setCalculando(true);
    try {
      const res = await api.post('calculo-pedido/calcular/', {
        practica_id: selectedPractica,
        numero_grupos: numeroGrupos
      });
      setResultado(res.data);
    } catch (err) {
      console.error('Error calculando:', err);
      alert('Error al calcular el pedido');
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
      alert(`✅ Pedido generado exitosamente!\nSolicitud ID: ${res.data.solicitud_id}\nPedidos creados: ${res.data.pedidos_ids.length}`);
      setSelectedPrograma('');
      setSelectedCompetencia('');
      setSelectedPractica('');
      setResultado(null);
      setPracticaDetalle(null);
    } catch (err) {
      console.error('Error generando pedido:', err);
      alert('Error al generar el pedido');
    }
  };

  const generarPDF = async () => {
    if (!selectedPractica) {
      alert('Primero seleccione una práctica');
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
      } else {
        const error = await response.json();
        alert('Error al generar PDF: ' + (error.error || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al generar el PDF');
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Generar Solicitud de Práctica</h1>
        <p className="text-gray-500 mb-6">Seleccione programa, competencia y práctica para generar el pedido automáticamente</p>

        {/* Paso 1: Programa */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">1. Seleccione Programa</h2>
          <select
            value={selectedPrograma}
            onChange={(e) => setSelectedPrograma(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="">-- Seleccione un programa --</option>
            {programas.map(p => (
              <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
            ))}
          </select>
        </div>

        {/* Paso 2: Competencia */}
        {selectedPrograma && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">2. Seleccione Competencia</h2>
            <select
              value={selectedCompetencia}
              onChange={(e) => setSelectedCompetencia(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              disabled={competencias.length === 0}
            >
              <option value="">-- Seleccione una competencia --</option>
              {competencias.map(c => (
                <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {/* Paso 3: Práctica */}
        {selectedCompetencia && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">3. Seleccione Práctica</h2>
            <select
              value={selectedPractica}
              onChange={(e) => setSelectedPractica(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              disabled={practicas.length === 0}
            >
              <option value="">-- Seleccione una práctica --</option>
              {practicas.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {/* Detalle de la práctica */}
        {practicaDetalle && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Detalle de la Práctica</h2>
            <p><strong>Nombre:</strong> {practicaDetalle.nombre}</p>
            <p><strong>Ficha:</strong> {practicaDetalle.ficha}</p>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Número de grupos:</label>
              <input
                type="number"
                min="1"
                value={numeroGrupos}
                onChange={(e) => setNumeroGrupos(parseInt(e.target.value) || 1)}
                className="w-32 border rounded-lg px-3 py-2"
              />
              <button
                onClick={calcularPedido}
                disabled={calculando}
                className="ml-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {calculando ? 'Calculando...' : 'Calcular Cantidades'}
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Observaciones:</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                rows="3"
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>
        )}

        {/* Resultado del cálculo */}
        {resultado && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Resumen del Pedido</h2>
            <p><strong>Práctica:</strong> {resultado.practica?.nombre}</p>
            <p><strong>Grupos:</strong> {resultado.numero_grupos}</p>
            
            {resultado.reactivos && resultado.reactivos.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Reactivos a solicitar:</h3>
                <table className="min-w-full border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Reactivo</th>
                      <th className="px-3 py-2 text-left">Cantidad Total</th>
                      <th className="px-3 py-2 text-left">Stock Actual</th>
                      <th className="px-3 py-2 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.reactivos.map((r, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{r.nombre}</td>
                        <td className="px-3 py-2">{r.cantidad_total} {r.unidad}</td>
                        <td className="px-3 py-2">{r.stock_actual}</td>
                        <td className="px-3 py-2">
                          {r.suficiente ? (
                            <span className="text-green-600">✅ Suficiente</span>
                          ) : (
                            <span className="text-red-600">⚠️ Insuficiente</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {resultado.materiales && resultado.materiales.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Materiales a solicitar:</h3>
                <table className="min-w-full border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Material</th>
                      <th className="px-3 py-2 text-left">Cantidad Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.materiales.map((m, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{m.nombre}</td>
                        <td className="px-3 py-2">{m.cantidad_total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={generarPedido}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
              >
                Confirmar y Generar Pedido
              </button>
              <button
                onClick={generarPDF}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                📄 Generar PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SelectorPractica;