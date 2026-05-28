import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const AprobacionesJefe = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aprobando, setAprobando] = useState(null);

  const cargarPedidos = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/pedidos-requieren-aprobacion/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPedidos(data);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const aprobarPedido = async (pedidoId) => {
    setAprobando(pedidoId);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/aprobar-excepcion-pedido/${pedidoId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${data.mensaje}`);
        cargarPedidos();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al aprobar el pedido');
    } finally {
      setAprobando(null);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center">Cargando pedidos pendientes...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Aprobación de Pedidos Excepcionales</h1>
          <p className="text-gray-500 text-sm mt-1">Pedidos que requieren aprobación por falta de stock</p>
        </div>

        {pedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            ✅ No hay pedidos pendientes de aprobación
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pedidos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{p.codigo}</td>
                    <td className="px-6 py-4 text-sm">{p.producto}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="font-bold text-red-600">{p.cantidad}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">{p.stock_actual}</td>
                    <td className="px-6 py-4 text-sm">{p.solicitante}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => aprobarPedido(p.id)}
                        disabled={aprobando === p.id}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {aprobando === p.id ? 'Aprobando...' : '✅ Aprobar Excepción'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AprobacionesJefe;