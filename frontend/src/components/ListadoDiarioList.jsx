import { useEffect, useState, useContext } from "react";
import { getListadosDiarios, deleteListadoDiario, updateListadoDiario } from "../services/listadoDiario";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";

export default function ListadoDiarioList() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const { role } = useContext(UserContext);

  useEffect(() => {
    getListadosDiarios().then(res => setData(res.data));
  }, []);

  const handleView = (item) => {
    setSelected(item);
    setShowModal(true);
  };
  const handleEdit = (item) => {
    setForm({ ...item });
    setSelected(item);
    setEditMode(true);
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateListadoDiario(selected.id, form);
      setData(data.map(d => d.id === selected.id ? { ...d, ...form } : d));
      setShowModal(false);
      setEditMode(false);
      toast.success("Listado diario actualizado correctamente");
    } catch (err) {
      toast.error("Error al actualizar listado diario");
    }
  };
  const handleDelete = async (item) => {
    if(window.confirm('¿Seguro que deseas eliminar el listado diario #' + item.id + '?')){
      try {
        await deleteListadoDiario(item.id);
        setData(data.filter(d => d.id !== item.id));
      } catch (e) {
        alert('Error al eliminar el listado diario');
      }
    }
  };

  return (
    <div className="rf-block">
      <h2 className="rf-title">Listados Diarios</h2>
      <div className="rf-list">
        {data.map(item => (
          <div key={item.id} className="rf-card">
            <div className="rf-card-row">
              <span>Fecha: <b>{item.fecha}</b></span>
              <span>Observaciones: {item.observaciones}</span>
            </div>
            <div className="rf-card-row rf-card-actions">
              <button className="rf-btn" onClick={() => handleView(item)}>Ver</button>
              {(role === 'jefe' || role === 'jefe_superior') && (
                <>
                  <button className="rf-btn" onClick={() => handleEdit(item)}>Editar</button>
                  <button className="rf-btn rf-btn-danger" onClick={() => handleDelete(item)}>Eliminar</button>
                </>
              )}
              {(role === 'admin') && (
                <button className="rf-btn rf-btn-danger" onClick={() => handleDelete(item)}>Eliminar</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de detalle/edición */}
      {showModal && selected && (
        <div className="rf-modal-bg">
          <div className="rf-modal">
            {editMode ? (
              <form onSubmit={handleFormSubmit}>
                <h3>Editar Listado Diario #{selected.id}</h3>
                <div style={{marginBottom:8}}>
                  <label>Fecha:</label>
                  <input name="fecha" value={form.fecha || ''} onChange={handleFormChange} style={{width:'100%'}} />
                </div>
                <div style={{marginBottom:8}}>
                  <label>Observaciones:</label>
                  <input name="observaciones" value={form.observaciones || ''} onChange={handleFormChange} style={{width:'100%'}} />
                </div>
                <div style={{marginBottom:8}}>
                  <label>Práctica:</label>
                  <input name="practica" value={form.practica || ''} onChange={handleFormChange} style={{width:'100%'}} />
                </div>
                <div style={{marginBottom:8}}>
                  <label>Creado por:</label>
                  <input name="creado_por" value={form.creado_por || ''} onChange={handleFormChange} style={{width:'100%'}} />
                </div>
                {/* Agrega más campos si es necesario */}
                <button type="submit" style={{marginTop:12, marginRight:8}}>Guardar</button>
                <button type="button" onClick={()=>{setShowModal(false);setEditMode(false);}} style={{marginTop:12}}>Cancelar</button>
              </form>
            ) : (
              <>
                <h3>Detalle del Listado Diario #{selected.id}</h3>
                <p><b>Fecha:</b> {selected.fecha}</p>
                <p><b>Observaciones:</b> {selected.observaciones}</p>
                <p><b>Práctica:</b> {selected.practica}</p>
                <p><b>Creado por:</b> {selected.creado_por}</p>
                <button onClick={()=>setShowModal(false)} style={{marginTop:12}}>Cerrar</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
