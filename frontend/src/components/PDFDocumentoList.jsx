import { useEffect, useState, useContext } from "react";
import { getPDFDocumentos, deletePDFDocumento, updatePDFDocumento } from "../services/pdfDocumento";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";

export default function PDFDocumentoList() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const { role } = useContext(UserContext);

  useEffect(() => {
    getPDFDocumentos().then(res => setData(res.data));
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
        await updatePDFDocumento(selected.id, form);
        setData(data.map(d => d.id === selected.id ? { ...d, ...form } : d));
        setShowModal(false);
        setEditMode(false);
        toast.success("PDF actualizado correctamente");
      } catch (err) {
        toast.error("Error al actualizar PDF");
      }
    };
  const handleDelete = async (item) => {
    if(window.confirm('¿Seguro que deseas eliminar el PDF #' + item.id + '?')){
      try {
        await deletePDFDocumento(item.id);
        setData(data.filter(d => d.id !== item.id));
      } catch (e) {
        alert('Error al eliminar el PDF');
      }
    }
  };

  return (
    <div className="rf-block">
      <h2 className="rf-title">PDFs Almacenados</h2>
      <div className="rf-list">
        {data.map(item => (
          <div key={item.id} className="rf-card">
            <div className="rf-card-row">
              <span>Tipo: <b>{item.tipo}</b></span>
              <span>Referencia: {item.referencia}</span>
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
                <h3>Editar PDF #{selected.id}</h3>
                <div style={{marginBottom:8}}>
                  <label>Tipo:</label>
                  <input name="tipo" value={form.tipo || ''} onChange={handleFormChange} style={{width:'100%'}} />
                </div>
                <div style={{marginBottom:8}}>
                  <label>Referencia:</label>
                  <input name="referencia" value={form.referencia || ''} onChange={handleFormChange} style={{width:'100%'}} />
                </div>
                <div style={{marginBottom:8}}>
                  <label>Usuario:</label>
                  <input name="usuario" value={form.usuario || ''} onChange={handleFormChange} style={{width:'100%'}} />
                </div>
                {/* Agrega más campos si es necesario */}
                <button type="submit" style={{marginTop:12, marginRight:8}}>Guardar</button>
                <button type="button" onClick={()=>{setShowModal(false);setEditMode(false);}} style={{marginTop:12}}>Cancelar</button>
              </form>
            ) : (
              <>
                <h3>Detalle del PDF #{selected.id}</h3>
                <p><b>Tipo:</b> {selected.tipo}</p>
                <p><b>Referencia:</b> {selected.referencia}</p>
                <p><b>Usuario:</b> {selected.usuario}</p>
                <button onClick={()=>setShowModal(false)} style={{marginTop:12}}>Cerrar</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
