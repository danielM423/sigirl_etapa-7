import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HojaVidaEquipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMantModal, setShowMantModal] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'preventivo',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    tecnico: '',
    costo: 0,
    observaciones: ''
  });

  useEffect(() => {
    cargarEquipos();
  }, []);

  const cargarEquipos = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('❌ No hay sesión activa');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://127.0.0.1:8000/api/reporte-equipos/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Equipos cargados:', data);
        setEquipos(data);
      } else {
        toast.error('❌ Error al cargar los equipos');
      }
    } catch (err) {
      console.error('Error cargando equipos:', err);
      toast.error('❌ Error al cargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  const cargarMantenimientos = async (equipoId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/mantenimientos-equipo/?equipo=${equipoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMantenimientos(data);
      } else {
        toast.error('❌ Error al cargar el historial');
      }
    } catch (err) {
      console.error('Error cargando mantenimientos:', err);
      toast.error('❌ Error al cargar el historial');
    }
  };

  const verDetalle = async (equipo) => {
    setSelectedEquipo(equipo);
    await cargarMantenimientos(equipo.id);
    setShowModal(true);
  };

  const registrarMantenimiento = async () => {
    if (!formData.descripcion) {
      toast.warning('⚠️ La descripción es obligatoria');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('❌ No hay sesión activa');
        return;
      }

      const data = {
        equipo: selectedEquipo.id,
        tipo: formData.tipo,
        fecha: formData.fecha,
        descripcion: formData.descripcion,
        tecnico: formData.tecnico || '',
        costo: parseFloat(formData.costo) || 0,
        observaciones: formData.observaciones || ''
      };

      console.log('Enviando mantenimiento:', data);

      const response = await fetch('http://127.0.0.1:8000/api/mantenimientos-equipo/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Mantenimiento registrado:', result);
        toast.success('✅ Mantenimiento registrado correctamente');
        setShowMantModal(false);
        setFormData({
          tipo: 'preventivo',
          fecha: new Date().toISOString().split('T')[0],
          descripcion: '',
          tecnico: '',
          costo: 0,
          observaciones: ''
        });
        cargarMantenimientos(selectedEquipo.id);
        cargarEquipos();
      } else {
        const error = await response.json();
        console.error('Error del servidor:', error);
        toast.error('❌ Error al registrar el mantenimiento');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('❌ Error al registrar el mantenimiento');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center">Cargando equipos...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ToastContainer />
      <div className="p-6 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-stone-800">
            🔧 Hoja de Vida de Equipos
          </h1>
          <p className="text-stone-500 mt-2">Historial de mantenimientos y estado de equipos de laboratorio</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-stone-50 rounded-xl border border-stone-200 overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-stone-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-600">Equipo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-600">Ubicación</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-600">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-600">Último Mant.</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-600">Total Mant.</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {equipos.map((e) => (
                  <tr key={e.id} className="hover:bg-stone-100 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-stone-700">{e.nombre}</td>
                    <td className="px-6 py-4 text-sm text-stone-600">{e.ubicacion || '-'}</td>
                    <td className="px-6 py-4 text-sm text-stone-600">{e.cantidad} uds.</td>
                    <td className="px-6 py-4 text-sm text-stone-600">{e.ultimo_mantenimiento || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        {e.total_mantenimientos} mantenimientos
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => verDetalle(e)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
                      >
                        Ver Hoja de Vida
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {equipos.length === 0 && (
            <div className="text-center py-8 text-stone-500">
              No hay equipos registrados en el inventario
            </div>
          )}
        </motion.div>

        {showModal && selectedEquipo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4"
            >
              <div className="sticky top-0 bg-white border-b border-stone-200 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-stone-800">
                  Hoja de Vida: {selectedEquipo.nombre}
                </h2>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="text-stone-400 hover:text-stone-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-stone-50 rounded-lg">
                  <div>
                    <label className="text-xs text-stone-400 uppercase">Ubicación</label>
                    <p className="font-medium text-stone-700">{selectedEquipo.ubicacion || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 uppercase">Stock actual</label>
                    <p className="font-medium text-stone-700">{selectedEquipo.cantidad} unidades</p>
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 uppercase">Último mantenimiento</label>
                    <p className="font-medium text-stone-700">{selectedEquipo.ultimo_mantenimiento || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 uppercase">Total mantenimientos</label>
                    <p className="font-medium text-stone-700">{selectedEquipo.total_mantenimientos}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-stone-700">Historial de Mantenimientos</h3>
                  <button
                    onClick={() => setShowMantModal(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
                  >
                    + Registrar Mantenimiento
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-stone-200 rounded-lg overflow-hidden">
                    <thead className="bg-stone-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-stone-600">Fecha</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-stone-600">Tipo</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-stone-600">Descripción</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-stone-600">Técnico</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-stone-600">Costo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {mantenimientos.map((m) => (
                        <tr key={m.id} className="hover:bg-stone-50">
                          <td className="px-4 py-3 text-sm">{m.fecha}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              m.tipo === 'preventivo' ? 'bg-blue-100 text-blue-700' :
                              m.tipo === 'correctivo' ? 'bg-amber-100 text-amber-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {m.tipo}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{m.descripcion}</td>
                          <td className="px-4 py-3 text-sm">{m.tecnico || '-'}</td>
                          <td className="px-4 py-3 text-sm">${m.costo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {mantenimientos.length === 0 && (
                    <div className="text-center py-8 text-stone-500">
                      No hay mantenimientos registrados para este equipo
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showMantModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md m-4"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-stone-800 mb-4">Registrar Mantenimiento</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Tipo *</label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                      className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-400"
                    >
                      <option value="preventivo">Preventivo</option>
                      <option value="correctivo">Correctivo</option>
                      <option value="calibracion">Calibración</option>
                      <option value="predictivo">Predictivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Fecha *</label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                      className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Descripción *</label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      rows="3"
                      className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-400"
                      placeholder="Describa el mantenimiento realizado..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Técnico</label>
                    <input
                      type="text"
                      value={formData.tecnico}
                      onChange={(e) => setFormData({...formData, tecnico: e.target.value})}
                      className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-400"
                      placeholder="Nombre del técnico"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Costo</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costo}
                      onChange={(e) => setFormData({...formData, costo: parseFloat(e.target.value)})}
                      className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-400"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Observaciones</label>
                    <textarea
                      value={formData.observaciones}
                      onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                      rows="2"
                      className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-400"
                      placeholder="Observaciones adicionales..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowMantModal(false)}
                    className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={registrarMantenimiento}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Guardar Mantenimiento
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HojaVidaEquipos;