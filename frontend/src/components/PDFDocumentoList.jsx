import { useEffect, useState } from "react";
import { getPedidoHistorial } from "../services/pedidoHistorial";

export default function PedidoHistorialList() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const res = await getPedidoHistorial();
      
      // 🔥 CORREGIDO: Procesar datos de forma segura
      let historialData = [];
      if (res && res.data) {
        if (Array.isArray(res.data)) {
          historialData = res.data;
        } else if (res.data.results && Array.isArray(res.data.results)) {
          historialData = res.data.results;
        }
      } else if (Array.isArray(res)) {
        historialData = res;
      }
      
      setData(historialData);
    } catch (error) {
      console.error('Error cargando historial:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="rf-block">
        <h2 className="rf-title">Historial de Pedidos</h2>
        <div className="text-center py-4 text-stone-400">Cargando historial...</div>
      </div>
    );
  }

  return (
    <div className="rf-block">
      <h2 className="rf-title">Historial de Pedidos</h2>
      <div className="rf-list">
        {data.length === 0 ? (
          <div className="text-center py-4 text-stone-400">No hay registros en el historial</div>
        ) : (
          data.map(item => (
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
          ))
        )}
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