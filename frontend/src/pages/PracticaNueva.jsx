import React, { useState, useEffect } from 'react';
import { createPractica } from '../services/api';

const PracticaNueva = () => {
  // Estado para encabezado
  const [encabezado, setEncabezado] = useState({
    fichaa: '',
    nombre: '',
    fecha: '',
    grupos_trabajo: '',
    instructor: '',
  });
  // Catálogos
  const [reactivosCatalogo, setReactivosCatalogo] = useState([]);
  const [equiposCatalogo, setEquiposCatalogo] = useState([]);
  const [unidadesCatalogo, setUnidadesCatalogo] = useState([]);
  const [instructores, setInstructores] = useState([]);

  // Cargar catálogos al montar
  useEffect(() => {
    fetch('/api/reactivos/')
      .then(res => res.json())
      .then(data => setReactivosCatalogo(data));
    fetch('/api/equipos/')
      .then(res => res.json())
      .then(data => setEquiposCatalogo(data));
    fetch('/api/unidades-medida/')
      .then(res => res.json())
      .then(data => setUnidadesCatalogo(data));
    fetch('/api/instructores/')
      .then(res => res.json())
      .then(data => setInstructores(data));
  }, []);

  // Estado para reactivos, materiales y equipos
  const [reactivos, setReactivos] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [equipos, setEquipos] = useState([]);

  // Funciones para agregar filas
  const addReactivo = () => setReactivos([...reactivos, { nombre: '', cantidad: '', unidad: '' }]);
  const addMaterial = () => setMateriales([...materiales, { nombre: '', cantidad_por_grupo: '', cantidad_total: '' }]);
  const addEquipo = () => setEquipos([...equipos, { nombre: '', cantidad: '' }]);

  // Función para manejar cambios en los arrays
  const handleArrayChange = (setter, arr, idx, field, value) => {
    const copy = [...arr];
    copy[idx][field] = value;
    setter(copy);
  };

  // Función para enviar el formulario (POST a la API)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...encabezado,
      grupos_trabajo: parseInt(encabezado.grupos_trabajo),
      instructor: encabezado.instructor,
      reactivos: reactivos.map(r => ({
        reactivo: r.reactivo,
        cantidad: parseFloat(r.cantidad),
        unidad: r.unidad,
        es_sensible: r.es_sensible || false
      })),
      equipos: equipos.map(eq => ({
        equipo: eq.equipo,
        tiempo_uso_min: parseInt(eq.tiempo_uso_min) || 0,
        desgaste_estimado: parseFloat(eq.desgaste_estimado) || 0,
        mantenimiento_requerido: eq.mantenimiento_requerido || false
      })),
    };
    try {
      await createPractica(payload);
      alert('¡Práctica guardada exitosamente!');
    } catch (err) {
      const error = err.response?.data || err.message;
      alert('Error al guardar: ' + (typeof error === 'object' ? JSON.stringify(error) : error));
    }
  };

  return (
    <ScrollReveal direction="up" delay={0.1}>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Nueva Práctica</h2>
      {/* Encabezado */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input placeholder="Ficha" value={encabezado.ficha || ''} onChange={e => setEncabezado({ ...encabezado, ficha: e.target.value })} className="input" />
        <input placeholder="Nombre de la práctica" value={encabezado.nombre || ''} onChange={e => setEncabezado({ ...encabezado, nombre: e.target.value })} className="input" />
        <input type="date" placeholder="Fecha" value={encabezado.fecha || ''} onChange={e => setEncabezado({ ...encabezado, fecha: e.target.value })} className="input" />
        <input placeholder="Grupos de trabajo" value={encabezado.grupos_trabajo || ''} onChange={e => setEncabezado({ ...encabezado, grupos_trabajo: e.target.value })} className="input" />
        <select value={encabezado.instructor || ''} onChange={e => setEncabezado({ ...encabezado, instructor: e.target.value })} className="input">
          <option value="">Selecciona instructor</option>
          {instructores.map(inst => (
            <option key={inst.id} value={inst.id}>{inst.username || inst.nombre}</option>
          ))}
        </select>
      </div>

      {/* Reactivos */}
      <h3 className="font-bold mt-6 mb-2">Reactivos</h3>
      <button type="button" onClick={addReactivo} className="mb-2 btn">Agregar reactivo</button>
      {reactivos.map((r, i) => (
        <div key={i} className="grid grid-cols-5 gap-2 mb-2">
          <select value={r.reactivo || ''} onChange={e => handleArrayChange(setReactivos, reactivos, i, 'reactivo', e.target.value)} className="input">
            <option value="">Selecciona reactivo</option>
            {reactivosCatalogo.map(prod => (
              <option key={prod.id} value={prod.id}>{prod.nombre}</option>
            ))}
          </select>
          <input placeholder="Cantidad" value={r.cantidad || ''} onChange={e => handleArrayChange(setReactivos, reactivos, i, 'cantidad', e.target.value)} className="input" />
          <select value={r.unidad || ''} onChange={e => handleArrayChange(setReactivos, reactivos, i, 'unidad', e.target.value)} className="input">
            <option value="">Unidad</option>
            {unidadesCatalogo.map(u => (
              <option key={u.id} value={u.id}>{u.nombre} ({u.simbolo})</option>
            ))}
          </select>
          <label className="flex items-center"><input type="checkbox" checked={!!r.es_sensible} onChange={e => handleArrayChange(setReactivos, reactivos, i, 'es_sensible', e.target.checked)} /> Sensible</label>
        </div>
      ))}

      {/* Materiales */}
      <h3 className="font-bold mt-6 mb-2">Materiales</h3>
      <button type="button" onClick={addMaterial} className="mb-2 btn">Agregar material</button>
      {materiales.map((m, i) => (
        <div key={i} className="grid grid-cols-3 gap-2 mb-2">
          <input placeholder="Nombre" value={m.nombre || ''} onChange={e => handleArrayChange(setMateriales, materiales, i, 'nombre', e.target.value)} className="input" />
          <input placeholder="Cantidad por grupo" value={m.cantidad_por_grupo || ''} onChange={e => handleArrayChange(setMateriales, materiales, i, 'cantidad_por_grupo', e.target.value)} className="input" />
          <input placeholder="Cantidad total" value={m.cantidad_total || ''} onChange={e => handleArrayChange(setMateriales, materiales, i, 'cantidad_total', e.target.value)} className="input" />
        </div>
      ))}

      {/* Equipos */}
      <h3 className="font-bold mt-6 mb-2">Equipos</h3>
      <button type="button" onClick={addEquipo} className="mb-2 btn">Agregar equipo</button>
      {equipos.map((eq, i) => (
        <div key={i} className="grid grid-cols-4 gap-2 mb-2">
          <select value={eq.equipo || ''} onChange={e => handleArrayChange(setEquipos, equipos, i, 'equipo', e.target.value)} className="input">
            <option value="">Selecciona equipo</option>
            {equiposCatalogo.map(prod => (
              <option key={prod.id} value={prod.id}>{prod.nombre}</option>
            ))}
          </select>
          <input placeholder="Tiempo uso (min)" value={eq.tiempo_uso_min || ''} onChange={e => handleArrayChange(setEquipos, equipos, i, 'tiempo_uso_min', e.target.value)} className="input" />
          <input placeholder="Desgaste estimado" value={eq.desgaste_estimado || ''} onChange={e => handleArrayChange(setEquipos, equipos, i, 'desgaste_estimado', e.target.value)} className="input" />
          <label className="flex items-center"><input type="checkbox" checked={!!eq.mantenimiento_requerido} onChange={e => handleArrayChange(setEquipos, equipos, i, 'mantenimiento_requerido', e.target.checked)} /> Mantenimiento</label>
        </div>
      ))}

      <button type="submit" className="mt-6 btn-primary">Guardar práctica</button>
    </form>
    </ScrollReveal>
  );
};

export default PracticaNueva;