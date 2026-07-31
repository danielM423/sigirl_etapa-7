import { useEffect, useState } from "react";
import { getPedidoHistorial } from "../services/pedidoHistorial";

export default function PedidoHistorialList() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getPedidoHistorial().then(res => setData(res.data));
  }, []);

  const handleView = (item) => {
    setSelected(item);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    alert('Funcionalidad de edición pendiente para el pedido #' + item.id);
  };

  const handleDelete = (item) => {
    if(window.confirm('¿Seguro que deseas eliminar el pedido #' + item.id + '?')){
      alert('Funcionalidad de borrado pendiente para el pedido #' + item.id);
    }
  };

  return (
    <div className="rf-block">
      <h2 className="rf-title">Historial de Pedidos</h2>
      <div className="rf-list">
        {data.map(item => (
          <div key={item.id} className="rf-card">
            <div className="rf-card-row">
              <span>Estado: <b>{item.estado}</b></span>
              <span>Fecha: {item.fecha}</span>
            </div>
            <div className="rf-card-row rf-card-actions">
              <button className="rf-btn" onClick={() => handleView(item)}>Ver</button>
              <button className="rf-btn" onClick={() => handleEdit(item)}>Editar</button>
              <button className="rf-btn rf-btn-danger" onClick={() => handleDelete(item)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de detalle */}
      {showModal && selected && (
        <div className="rf-modal-bg">
          <div className="rf-modal">
            <h3>Detalle del Pedido #{selected.id}</h3>
            <p><b>Estado:</b> {selected.estado}</p>
            <p><b>Fecha:</b> {selected.fecha}</p>
            <p><b>Usuario modificador:</b> {selected.usuario_modificador}</p>
            <p><b>Comentario:</b> {selected.comentario}</p>
            <p><b>ID Pedido:</b> {selected.pedido}</p>
            <button className="rf-btn" onClick={()=>setShowModal(false)} style={{marginTop:12}}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
