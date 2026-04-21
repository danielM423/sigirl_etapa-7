// Vista dedicada al inventario.
// Permite listar, filtrar y mantener productos del laboratorio.
import { useState, useEffect, useMemo, useContext } from 'react';
import { toast } from 'react-toastify';
import { Search, ChevronDown, Plus, Edit2, Trash2, Download, Eye, Package, AlertCircle, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';
import { UserContext } from '../context/AuthContext';
import { exportToExcel } from '../utils/reportExport';
import { loadSigirlCollections, saveSigirlCollections } from '../utils/sigirlStorage';

const Inventario = () => {
  const { user, role } = useContext(UserContext);
  const normalizedRole = role === 'jefe_superior' ? 'jefe' : role;
  const canManageInventory = normalizedRole === 'admin' || normalizedRole === 'jefe';

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('todas');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formProducto, setFormProducto] = useState({
    nombre: '',
    categoria: 'Solventes',
    ubicacion: '',
    cantidad: '',
    umbral_minimo: ''
  });

  useEffect(() => {
    const hydrate = () => {
      const { productos: productosStore } = loadSigirlCollections();
      setProductos(productosStore);
      setLoading(false);
    };

    hydrate();
    window.addEventListener('sigirl-data-updated', hydrate);
    return () => window.removeEventListener('sigirl-data-updated', hydrate);
  }, []);

  const getEstadoBadge = (estado) => {
    const styles = {
      ok: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      bajo_stock: 'bg-amber-100 text-amber-700 border border-amber-300',
      agotado: 'bg-rose-100 text-rose-700 border border-rose-300'
    };
    
    const icons = {
      ok: '✅',
      bajo_stock: '⚠️',
      agotado: '❌'
    };

    const labels = {
      ok: 'OK',
      bajo_stock: 'Bajo Stock',
      agotado: 'Agotado'
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${styles[estado]}`}>
        {icons[estado]}
        {labels[estado]}
      </span>
    );
  };

  const normalizedProducts = useMemo(() => productos.map((producto, index) => ({
    id: Number(producto.id ?? index + 1),
    nombre: producto.nombre || 'Producto sin nombre',
    categoria: typeof producto.categoria === 'string'
      ? producto.categoria
      : producto.categoria?.nombre || producto.categoria_nombre || 'General',
    cantidad: Number(producto.cantidad ?? 0),
    umbral_minimo: Number(producto.umbral_minimo ?? producto.minimo ?? 0),
    ubicacion: producto.ubicacion || 'Sin ubicación',
    estado: producto.estado || (Number(producto.cantidad ?? 0) <= 0 ? 'agotado' : Number(producto.cantidad ?? 0) <= Number(producto.umbral_minimo ?? producto.minimo ?? 0) ? 'bajo_stock' : 'ok'),
    ultima_actualizacion: producto.ultima_actualizacion || new Date().toISOString().split('T')[0],
  })), [productos]);

  const categories = useMemo(() => ['todas', ...new Set(normalizedProducts.map((producto) => producto.categoria).filter(Boolean))], [normalizedProducts]);

  const filteredProducts = normalizedProducts.filter((producto) => {
    const text = searchTerm.toLowerCase();
    const matchesSearch = producto.nombre.toLowerCase().includes(text)
      || producto.categoria.toLowerCase().includes(text)
      || producto.ubicacion.toLowerCase().includes(text);
    const matchesFilter = filterStatus === 'todos' || producto.estado === filterStatus;
    const matchesCategory = filterCategory === 'todas' || producto.categoria === filterCategory;
    return matchesSearch && matchesFilter && matchesCategory;
  });

  const stats = {
    total: normalizedProducts.length,
    ok: normalizedProducts.filter((p) => p.estado === 'ok').length,
    bajoStock: normalizedProducts.filter((p) => p.estado === 'bajo_stock').length,
    agotado: normalizedProducts.filter((p) => p.estado === 'agotado').length
  };

  const showDetalleToast = (title, lines) => {
    toast.info(
      <div className="text-sm">
        <p className="font-semibold mb-2">{title}</p>
        <div className="space-y-1">
          {lines.filter(Boolean).map((line, index) => (
            <p key={`${title}-${index}`}>{line}</p>
          ))}
        </div>
      </div>,
      { autoClose: 7000, closeOnClick: false }
    );
  };

  const handleGuardarProducto = () => {
    if (!canManageInventory) {
      toast.error('Tu rol solo puede visualizar el inventario.');
      return;
    }

    if (!formProducto.nombre || !formProducto.cantidad || !formProducto.umbral_minimo || !formProducto.ubicacion) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (selectedProduct) {
      const nuevosProductos = productos.map(p =>
        p.id === selectedProduct.id
          ? {
              ...p,
              nombre: formProducto.nombre,
              categoria: formProducto.categoria,
              ubicacion: formProducto.ubicacion,
              cantidad: parseInt(formProducto.cantidad),
              umbral_minimo: parseInt(formProducto.umbral_minimo),
              estado: parseInt(formProducto.cantidad) <= parseInt(formProducto.umbral_minimo) ? 'bajo_stock' : (parseInt(formProducto.cantidad) === 0 ? 'agotado' : 'ok'),
              ultima_actualizacion: new Date().toISOString().split('T')[0]
            }
          : p
      );
      setProductos(nuevosProductos);
      saveSigirlCollections({ productos: nuevosProductos });
      toast.success('Producto actualizado exitosamente');
    } else {
      const nuevoProducto = {
        id: Math.max(...productos.map(p => p.id), 0) + 1,
        nombre: formProducto.nombre,
        categoria: formProducto.categoria,
        ubicacion: formProducto.ubicacion,
        cantidad: parseInt(formProducto.cantidad),
        umbral_minimo: parseInt(formProducto.umbral_minimo),
        estado: parseInt(formProducto.cantidad) <= parseInt(formProducto.umbral_minimo) ? 'bajo_stock' : (parseInt(formProducto.cantidad) === 0 ? 'agotado' : 'ok'),
        ultima_actualizacion: new Date().toISOString().split('T')[0]
      };
      const nuevosProductos = [...productos, nuevoProducto];
      setProductos(nuevosProductos);
      saveSigirlCollections({ productos: nuevosProductos });
      toast.success('Producto creado exitosamente');
    }
    
    setShowModal(false);
    setSelectedProduct(null);
    setFormProducto({
      nombre: '',
      categoria: 'Solventes',
      ubicacion: '',
      cantidad: '',
      umbral_minimo: ''
    });
  };

  const handleEliminarProducto = (id) => {
    if (!canManageInventory) {
      toast.error('Tu rol no tiene permiso para eliminar productos.');
      return;
    }

    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este producto?');
    if (confirmDelete) {
      const nuevosProductos = productos.filter(p => p.id !== id);
      setProductos(nuevosProductos);
      saveSigirlCollections({ productos: nuevosProductos });
      toast.success('Producto eliminado exitosamente');
    }
  };

  const handleExportarInventario = () => {
    if (!canManageInventory) {
      toast.info('El inventario para usuarios es solo de consulta.');
      return;
    }

    const rows = filteredProducts.map((producto) => ({
      Nombre: producto.nombre,
      Cantidad: producto.cantidad,
      Categoria: producto.categoria,
      Estado: producto.estado,
      Ubicacion: producto.ubicacion,
      'Umbral minimo': producto.umbral_minimo,
      'Ultima actualizacion': producto.ultima_actualizacion,
    }));

    exportToExcel(rows, `inventario-sigirl-${new Date().toISOString().slice(0, 10)}.xlsx`, 'Inventario');
    toast.success('Inventario exportado correctamente.');
  };

  return (
    <Layout>
      <div>
          {!canManageInventory && (
            <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
              Estás en modo consulta: solo puedes visualizar el inventario y ver detalles de los productos.
            </div>
          )}

          <div className="mb-10 rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_12px_35px_rgba(34,197,94,0.10)] backdrop-blur-xl md:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-[34px] font-bold text-slate-800">Inventario general PRO</h1>
                <p className="text-slate-500 text-base">Consulta, filtra y administra todos los productos del laboratorio desde una vista común para todos los roles.</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    {stats.total} productos
                  </span>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                    {stats.bajoStock} bajo stock
                  </span>
                  <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
                    {stats.agotado} agotados
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <div className="rounded-[20px] bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/90">Productos Totales</p>
                  <p className="text-4xl font-bold mt-2">{stats.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/15">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="rounded-[20px] bg-gradient-to-r from-red-500 to-rose-500 text-white p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/90">Agotados</p>
                  <p className="text-4xl font-bold mt-2">{stats.agotado}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/15">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="rounded-[20px] bg-gradient-to-r from-amber-400 to-orange-500 text-white p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/90">Bajo stock</p>
                  <p className="text-4xl font-bold mt-2">{stats.bajoStock}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/15">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="rounded-[20px] bg-gradient-to-r from-lime-500 to-green-600 text-white p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/90">Stock OK</p>
                  <p className="text-4xl font-bold mt-2">{stats.ok}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/15">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-emerald-100 shadow-[0_10px_30px_rgba(34,197,94,0.08)] p-5 md:p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, categoría o ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#f8fff7] border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 text-sm transition-all"
                  />
                </div>
                
                <div className="relative w-full sm:w-48">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none bg-[#f8fff7] border border-emerald-100 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer text-sm w-full transition-all"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="ok">Stock OK</option>
                    <option value="bajo_stock">Bajo Stock</option>
                    <option value="agotado">Agotado</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative w-full sm:w-48">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="appearance-none bg-[#f8fff7] border border-emerald-100 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer text-sm w-full transition-all"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === 'todas' ? 'Todas las categorías' : category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {canManageInventory && (
                <div className="flex gap-3">
                  <button
                    onClick={handleExportarInventario}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-emerald-100 text-slate-700 rounded-xl transition-all font-semibold shadow-sm text-sm whitespace-nowrap hover:bg-emerald-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </button>
                  <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#78d64b] to-[#43bb52] text-white rounded-xl transition-all font-semibold shadow-md shadow-emerald-500/20 text-sm whitespace-nowrap"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Nuevo</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-emerald-100 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f6fff2] border-b border-emerald-100">
                  <tr>
                    <th className="text-left py-4 px-5 font-bold text-xs uppercase tracking-wider text-emerald-700\">Producto</th>
                    <th className="text-left py-4 px-5 font-bold text-xs uppercase tracking-wider text-emerald-700\">Categoría</th>
                    <th className="text-center py-4 px-5 font-bold text-xs uppercase tracking-wider text-emerald-700\">Cant.</th>
                    <th className="text-center py-4 px-5 font-bold text-xs uppercase tracking-wider text-emerald-700\">Mín.</th>
                    <th className="text-left py-4 px-5 font-bold text-xs uppercase tracking-wider text-emerald-700\">Ubicación</th>
                    <th className="text-center py-4 px-5 font-bold text-xs uppercase tracking-wider text-emerald-700\">Estado</th>
                    <th className="text-center py-4 px-5 font-bold text-xs uppercase tracking-wider text-emerald-700\">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-16 text-center text-slate-500">
                        <div className="flex justify-center items-center gap-2">
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"></div>
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-200/30 to-teal-200/20 flex items-center justify-center text-3xl">
                            📦
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700 text-sm">No se encontraron productos</p>
                            <p className="text-xs text-slate-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((producto) => (
                      <tr key={producto.id} className="group hover:bg-emerald-500/5 transition-all duration-200 border-b border-emerald-500/10 hover:border-emerald-500/30 last:border-b-0">
                        <td className="py-5 px-5">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{producto.nombre}</p>
                            <p className="text-xs text-slate-500 mt-0.5">ID: #{producto.id.toString().padStart(4, '0')}</p>
                          </div>
                        </td>
                        <td className="py-5 px-5">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-300">
                            {producto.categoria}
                          </span>
                        </td>
                        <td className="py-5 px-5 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${producto.cantidad <= producto.umbral_minimo ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {producto.cantidad}
                          </span>
                        </td>
                        <td className="py-5 px-5 text-center font-semibold text-slate-700 text-sm">{producto.umbral_minimo}</td>
                        <td className="py-5 px-5 text-slate-700 text-sm">{producto.ubicacion}</td>
                        <td className="py-5 px-5 text-center">{getEstadoBadge(producto.estado)}</td>
                        <td className="py-5 px-5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => showDetalleToast('Detalle del producto', [
                                `Nombre: ${producto.nombre}`,
                                `Categoría: ${producto.categoria}`,
                                `Ubicación: ${producto.ubicacion}`,
                                `Cantidad disponible: ${producto.cantidad}`,
                                `Umbral mínimo: ${producto.umbral_minimo}`,
                                `Estado: ${producto.estado}`,
                              ])}
                              className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors hover:text-sky-700"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canManageInventory && (
                              <>
                                <button 
                                  onClick={() => {
                                    setSelectedProduct(producto);
                                    setFormProducto({
                                      nombre: producto.nombre,
                                      categoria: producto.categoria,
                                      ubicacion: producto.ubicacion,
                                      cantidad: producto.cantidad.toString(),
                                      umbral_minimo: producto.umbral_minimo.toString()
                                    });
                                    setShowModal(true);
                                  }}
                                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors hover:text-indigo-700"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleEliminarProducto(producto.id)}
                                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors hover:text-rose-700"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
              <p className="text-sm text-slate-500">
                Mostrando {filteredProducts.length} de {productos.length} productos
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50" disabled>
                  Anterior
                </button>
                <button className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50" disabled>
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Modal para agregar/editar producto */}
      {showModal && canManageInventory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="sigirl-form-surface rounded-[28px] max-w-2xl w-full max-h-[92vh] overflow-y-auto animate-in zoom-in duration-300">
            <div className="p-6 md:p-8 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg text-white shadow-lg shadow-emerald-500/40">
                  {selectedProduct ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 mt-0.5">Complete el formulario para {selectedProduct ? 'actualizar' : 'crear'} un producto</p>
                </div>
              </div>
            </div>
            <div className="p-7 md:p-10 space-y-6">
              <div>
                <label className="sigirl-form-label">Nombre del producto</label>
                <input 
                  type="text" 
                  value={formProducto.nombre}
                  onChange={(e) => setFormProducto({...formProducto, nombre: e.target.value})}
                  className="sigirl-form-control" 
                  placeholder="Ej: Alcohol etílico" 
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="sigirl-form-label">Categoría</label>
                  <select 
                    value={formProducto.categoria}
                    onChange={(e) => setFormProducto({...formProducto, categoria: e.target.value})}
                    className="sigirl-form-control"
                  >
                    <option>Solventes</option>
                    <option>Ácidos</option>
                    <option>EPP</option>
                    <option>Vidrio</option>
                  </select>
                </div>
                <div>
                  <label className="sigirl-form-label">Ubicación</label>
                  <input 
                    type="text" 
                    value={formProducto.ubicacion}
                    onChange={(e) => setFormProducto({...formProducto, ubicacion: e.target.value})}
                    className="sigirl-form-control" 
                    placeholder="Ej: Almacén A" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="sigirl-form-label">Cantidad</label>
                  <input 
                    type="number" 
                    value={formProducto.cantidad}
                    onChange={(e) => setFormProducto({...formProducto, cantidad: e.target.value})}
                    className="sigirl-form-control" 
                    placeholder="0" 
                    min="0" 
                  />
                </div>
                <div>
                  <label className="sigirl-form-label">Umbral mín.</label>
                  <input 
                    type="number" 
                    value={formProducto.umbral_minimo}
                    onChange={(e) => setFormProducto({...formProducto, umbral_minimo: e.target.value})}
                    className="sigirl-form-control" 
                    placeholder="5" 
                    min="0" 
                  />
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50 rounded-b-[28px] flex flex-col-reverse sm:flex-row gap-3 justify-end">
              <button 
                onClick={() => {
                  setShowModal(false);
                  setSelectedProduct(null);
                  setFormProducto({
                    nombre: '',
                    categoria: 'Solventes',
                    ubicacion: '',
                    cantidad: '',
                    umbral_minimo: ''
                  });
                }}
                className="sigirl-btn-secondary text-sm w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button 
                onClick={handleGuardarProducto}
                className="sigirl-btn-primary text-sm w-full sm:w-auto"
              >
                {selectedProduct ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Inventario;