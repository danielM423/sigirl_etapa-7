import React, { useState, useEffect } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import { createPractica } from '../services/api';

const PracticaNueva = () => {
  const [encabezado, setEncabezado] = useState({
    ficha: '',
    nombre: '',
    fecha: '',
    grupos_trabajo: '1',
    instructor: '',
  });
  
  const [cantidadGeneral, setCantidadGeneral] = useState('2');
  const [prioridad, setPrioridad] = useState('alta');
  const [observaciones, setObservaciones] = useState('');
  
  const [reactivosCatalogo, setReactivosCatalogo] = useState([]);
  const [equiposCatalogo, setEquiposCatalogo] = useState([]);
  const [unidadesCatalogo, setUnidadesCatalogo] = useState([]);
  const [instructores, setInstructores] = useState([]);
  const [loadingInstructores, setLoadingInstructores] = useState(true);

  useEffect(() => {
    const cargarInstructores = async () => {
      try {
        let response = await fetch('/api/instructores/');
        
        if (!response.ok) {
          response = await fetch('/instructores/');
        }
        
        if (response.ok) {
          const data = await response.json();
          const instructoresData = Array.isArray(data) ? data : (data.results || []);
          setInstructores(instructoresData);
        } else {
          const usersRes = await fetch('/api/usuarios/');
          if (usersRes.ok) {
            const usersData = await usersRes.json();
            const users = usersData.results || usersData;
            const instructoresFiltrados = users.filter(u => u.is_staff === true);
            setInstructores(instructoresFiltrados);
          } else {
            setInstructores([
              { id: 1, username: 'cesar', first_name: 'Cesar' },
              { id: 2, username: 'admin', first_name: 'Admin' },
              { id: 4, username: 'jefe', first_name: 'Jefe' },
              { id: 6, username: 'testuser', first_name: 'Test' },
              { id: 9, username: 'instructor1', first_name: 'Instructor' },
            ]);
          }
        }
      } catch (err) {
        console.error('Error cargando instructores:', err);
        setInstructores([
          { id: 1, username: 'cesar', first_name: 'Cesar' },
          { id: 2, username: 'admin', first_name: 'Admin' },
          { id: 4, username: 'jefe', first_name: 'Jefe' },
          { id: 6, username: 'testuser', first_name: 'Test' },
          { id: 9, username: 'instructor1', first_name: 'Instructor' },
        ]);
      } finally {
        setLoadingInstructores(false);
      }
    };

    cargarInstructores();
    
    fetch('/api/reactivos/')
      .then(res => res.json())
      .then(data => setReactivosCatalogo(data))
      .catch(err => console.error('Error cargando reactivos:', err));
    
    fetch('/api/equipos/')
      .then(res => res.json())
      .then(data => setEquiposCatalogo(data))
      .catch(err => console.error('Error cargando equipos:', err));
    
    fetch('/api/unidades-medida/')
      .then(res => res.json())
      .then(data => setUnidadesCatalogo(data))
      .catch(err => console.error('Error cargando unidades:', err));
  }, []);

  const [reactivos, setReactivos] = useState([]);

  const addReactivo = () => setReactivos([...reactivos, { reactivo: '', cantidad: '', unidad: '', es_sensible: false }]);

  const handleArrayChange = (setter, arr, idx, field, value) => {
    const copy = [...arr];
    copy[idx][field] = value;
    setter(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("🚀 === FORMULARIO ENVIADO ===");
    console.log("📝 encabezado:", encabezado);
    
    // Validaciones
    if (!encabezado.ficha) {
      console.log("❌ FALTA: ficha");
      alert('Complete el campo FICHA');
      return;
    }
    if (!encabezado.nombre) {
      console.log("❌ FALTA: nombre");
      alert('Complete el campo NOMBRE DE LA PRÁCTICA');
      return;
    }
    if (!encabezado.fecha) {
      console.log("❌ FALTA: fecha");
      alert('Complete el campo FECHA');
      return;
    }
    if (!encabezado.instructor) {
      console.log("❌ FALTA: instructor");
      alert('Seleccione un INSTRUCTOR');
      return;
    }
    
    const instructorId = parseInt(encabezado.instructor);
    console.log("🔢 instructorId parseado:", instructorId);
    
    if (isNaN(instructorId)) {
      alert('Seleccione un instructor válido');
      return;
    }
    
    const payload = {
      ficha: encabezado.ficha,
      nombre: encabezado.nombre,
      fecha: encabezado.fecha,
      grupos_trabajo: parseInt(encabezado.grupos_trabajo) || 1,
      instructor: instructorId,
      estado: "pendiente",
      requiere_doble_aprobacion: false,
      observaciones: observaciones || '',
      reactivos: reactivos.filter(r => r.reactivo && r.cantidad).map(r => ({
        reactivo: parseInt(r.reactivo),
        cantidad: parseFloat(r.cantidad) || 0,
        unidad: r.unidad ? parseInt(r.unidad) : null,
        es_sensible: r.es_sensible || false
      })),
      materiales: [],
      equipos: []
    };
    
    console.log("📦 PAYLOAD FINAL:", payload);
    
    try {
      const response = await createPractica(payload);
      console.log("✅ RESPUESTA EXITOSA:", response);
      
      if (response.data && response.data.id) {
        alert('✅ Práctica creada con ID: ' + response.data.id);
        // Limpiar formulario
        setEncabezado({ ficha: '', nombre: '', fecha: '', grupos_trabajo: '1', instructor: '' });
        setCantidadGeneral('2');
        setPrioridad('alta');
        setObservaciones('');
        setReactivos([]);
      } else {
        alert('❌ Error: ' + JSON.stringify(response.data));
      }
    } catch (err) {
      console.error("❌ ERROR EN CATCH:", err);
      const errorMsg = err.response?.data?.detail || err.message;
      alert('Error al guardar: ' + errorMsg);
    }
  };

  return (
    <ScrollReveal direction="up" delay={0.1}>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-2">NUEVA PRÁCTICA</h2>
        <p className="text-sm text-stone-500 mb-4">Registrar una nueva práctica y solicitud de reactivos</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-mono font-bold text-stone-500 mb-1">FICHA</label>
            <input 
              value={encabezado.ficha} 
              onChange={e => setEncabezado({ ...encabezado, ficha: e.target.value })} 
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="Ej: 123456"
            />
          </div>
          <div>
            <label className="block text-xs font-mono font-bold text-stone-500 mb-1">NOMBRE DE LA PRÁCTICA</label>
            <input 
              value={encabezado.nombre} 
              onChange={e => setEncabezado({ ...encabezado, nombre: e.target.value })} 
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="Nombre de la práctica"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-mono font-bold text-stone-500 mb-1">FECHA</label>
            <input 
              type="date" 
              value={encabezado.fecha} 
              onChange={e => setEncabezado({ ...encabezado, fecha: e.target.value })} 
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-mono font-bold text-stone-500 mb-1">GRUPOS DE TRABAJO</label>
            <input 
              value={encabezado.grupos_trabajo} 
              onChange={e => setEncabezado({ ...encabezado, grupos_trabajo: e.target.value })} 
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="Número de grupos"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-mono font-bold text-stone-500 mb-1">INSTRUCTOR</label>
          {loadingInstructores ? (
            <div className="text-sm text-stone-400">Cargando instructores...</div>
          ) : (
            <select 
              value={encabezado.instructor} 
              onChange={e => setEncabezado({ ...encabezado, instructor: e.target.value })} 
              className="border rounded px-3 py-2 text-sm w-full"
            >
              <option value="">-- Selecciona un instructor --</option>
              {instructores.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.username || inst.first_name || `Instructor ${inst.id}`}
                </option>
              ))}
            </select>
          )}
        </div>

        <h3 className="font-bold mt-6 mb-2">PRODUCTOS Y CANTIDADES</h3>
        
        {reactivos.map((r, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
            <select 
              value={r.reactivo} 
              onChange={e => handleArrayChange(setReactivos, reactivos, i, 'reactivo', e.target.value)} 
              className="border rounded px-2 py-1 text-sm col-span-6"
            >
              <option value="">Selecciona reactivo</option>
              {reactivosCatalogo.map(prod => (
                <option key={prod.id} value={prod.id}>{prod.nombre}</option>
              ))}
            </select>
            <input 
              placeholder="Cantidad" 
              value={r.cantidad} 
              onChange={e => handleArrayChange(setReactivos, reactivos, i, 'cantidad', e.target.value)} 
              className="border rounded px-2 py-1 text-sm col-span-3"
            />
            <button
              type="button"
              onClick={() => setReactivos(reactivos.filter((_, idx) => idx !== i))}
              className="text-red-500 text-sm col-span-3"
            >
              Quitar
            </button>
          </div>
        ))}
        
        <button type="button" onClick={addReactivo} className="mb-4 text-emerald-600 text-sm">
          + Agregar producto
        </button>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-mono font-bold text-stone-500 mb-1">CANTIDAD</label>
            <input 
              type="number" 
              min="1"
              value={cantidadGeneral} 
              onChange={e => setCantidadGeneral(e.target.value)} 
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-mono font-bold text-stone-500 mb-1">PRIORIDAD</label>
            <select 
              value={prioridad} 
              onChange={e => setPrioridad(e.target.value)} 
              className="border rounded px-3 py-2 text-sm w-full"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-mono font-bold text-stone-500 mb-1">OBSERVACIONES</label>
          <textarea 
            value={observaciones} 
            onChange={e => setObservaciones(e.target.value)} 
            className="border rounded px-3 py-2 text-sm w-full"
            rows="3"
            placeholder="Observaciones..."
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button 
            type="button" 
            onClick={() => {
              setEncabezado({ ficha: '', nombre: '', fecha: '', grupos_trabajo: '1', instructor: '' });
              setCantidadGeneral('2');
              setPrioridad('alta');
              setObservaciones('');
              setReactivos([]);
            }}
            className="px-4 py-2 border border-stone-300 rounded text-sm hover:bg-stone-50"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="bg-emerald-600 text-white px-4 py-2 rounded text-sm hover:bg-emerald-700"
          >
            Crear pedido
          </button>
        </div>
      </form>
    </ScrollReveal>
  );
};

export default PracticaNueva;