import { useState, useEffect } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import Layout from '../components/Layout';
import PedidoHistorialList from '../components/PedidoHistorialList';
import { getPracticas, getInventarioPracticasInstructor } from '../services/api';

const LabSection = ({ title, children, action, onAction }) => (
  <div className="bg-white border border-[#E0E0E0] rounded-lg overflow-hidden">
    <div className="flex items-center justify-between px-5 py-3 border-b border-[#E0E0E0]">
      <span className="text-xs font-mono font-bold text-[#1FA971] uppercase tracking-wider">{title}</span>
      {action && (
        <button onClick={onAction} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono font-bold text-[#1FA971] bg-[#E8F5F0] border border-[#1FA971]/25 hover:bg-[#E8F5F0] transition-colors">
          {action}
        </button>
      )}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const UsuarioDashboard = () => {
  const [practicas, setPracticas] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [loadingInventario, setLoadingInventario] = useState(true);

  useEffect(() => {
    getPracticas()
      .then(res => {
        if (Array.isArray(res?.data)) setPracticas(res.data);
        else if (Array.isArray(res?.data?.results)) setPracticas(res.data.results);
        else if (Array.isArray(res)) setPracticas(res);
        else setPracticas([]);
      })
      .catch(() => setPracticas([]));

    // Intentar cargar inventario de prácticas abiertas (solo para instructores)
    getInventarioPracticasInstructor()
      .then(res => {
        setInventario(Array.isArray(res.data) ? res.data : []);
        setLoadingInventario(false);
      })
      .catch(err => {
        // Si es 404, significa que no hay prácticas abiertas (es normal)
        if (err.response?.status === 404) {
          setInventario([]);
        } else {
          console.error('Error cargando inventario:', err);
        }
        setLoadingInventario(false);
      });
  }, []);

  return (
    <Layout>
      <div className="space-y-5">
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-[#1FA971] uppercase tracking-wider">PRÁCTICAS REGISTRADAS</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#22c55e] animate-pulse" />
          </div>
          <h1 className="text-xl font-bold font-mono text-stone-700">Listado de Prácticas</h1>
          <p className="text-[10px] font-mono text-stone-500 mt-1">Consulta todas las prácticas registradas en el sistema</p>
        </div>

        {/* Inventario de prácticas abiertas para instructores */}
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-5">
          <ScrollReveal direction="up" delay={0.1}>
            <h2 className="text-lg font-bold mb-2 text-emerald-700">Inventario de Prácticas Abiertas (Instructor)</h2>
            {loadingInventario ? (
              <div className="text-stone-400 text-xs">Cargando inventario...</div>
            ) : inventario.length === 0 ? (
              <div className="text-stone-400 text-xs text-center py-4">
                No tienes prácticas abiertas asignadas.
              </div>
            ) : (
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full text-xs font-mono border">
                  <thead>
                    <tr className="bg-stone-100">
                      <th className="px-2 py-1 border">ID</th>
                      <th className="px-2 py-1 border">Nombre</th>
                      <th className="px-2 py-1 border">Tipo</th>
                      <th className="px-2 py-1 border">Cantidad</th>
                      <th className="px-2 py-1 border">Unidad</th>
                      <th className="px-2 py-1 border">Ubicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventario.map(prod => (
                      <tr key={prod.id} className="border-b">
                        <td className="px-2 py-1 border">{prod.id}</td>
                        <td className="px-2 py-1 border">{prod.nombre}</td>
                        <td className="px-2 py-1 border">{prod.tipo}</td>
                        <td className="px-2 py-1 border">{prod.cantidad}</td>
                        <td className="px-2 py-1 border">{prod.unidad}</td>
                        <td className="px-2 py-1 border">{prod.ubicacion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ScrollReveal>
        </div>

        {/* Listado de prácticas */}
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-5">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs font-mono border">
                <thead>
                  <tr className="bg-stone-100">
                    <th className="px-2 py-1 border">ID</th>
                    <th className="px-2 py-1 border">Nombre</th>
                    <th className="px-2 py-1 border">Fecha</th>
                    <th className="px-2 py-1 border">Instructor</th>
                    <th className="px-2 py-1 border">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {practicas.length === 0 && (
                    <tr><td colSpan="5" className="text-center py-2 text-stone-400">No hay prácticas registradas</td></tr>
                  )}
                  {practicas.map(prac => (
                    <tr key={prac.id} className="border-b">
                      <td className="px-2 py-1 border">{prac.id}</td>
                      <td className="px-2 py-1 border">{prac.nombre}</td>
                      <td className="px-2 py-1 border">{prac.fecha}</td>
                      <td className="px-2 py-1 border">{prac.instructor_nombre || prac.instructor}</td>
                      <td className="px-2 py-1 border">{prac.estado || 'pendiente'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </div>
      {/* Solo mostrar pedidos del usuario con animación y estilo admin */}
      <ScrollReveal direction="up" delay={0.1}>
        <LabSection title="Mis Pedidos (RF-034)">
          <PedidoHistorialList />
        </LabSection>
      </ScrollReveal>
    </Layout>
  );
};

export default UsuarioDashboard;