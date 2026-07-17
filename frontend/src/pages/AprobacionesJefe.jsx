// src/pages/AprobacionesJefe.jsx
import React, { useState, useEffect, Fragment } from 'react';
import { 
    Search, Eye, CheckCircle, XCircle, Clock, 
    Download, RefreshCw, History, FileText,
    AlertCircle, User, Calendar, Package, X,
    Shield, Filter, ChevronDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';

const AprobacionesJefe = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroPrioridad, setFiltroPrioridad] = useState('todas');
    const [aprobacionesVisibles, setAprobacionesVisibles] = useState({});
    const [error, setError] = useState(null);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [mostrarMotivo, setMostrarMotivo] = useState(false);
    const [aprobando, setAprobando] = useState(null);

    const token = localStorage.getItem('access_token');

    useEffect(() => {
        cargarPedidos();
    }, []);

    const cargarPedidos = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/pedidos-requieren-aprobacion/', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    const pedidosConAprobaciones = data.map(p => {
                        const productoData = p.producto || {};
                        return {
                            ...p,
                            producto_nombre: productoData.nombre || p.producto_nombre || 'Producto sin nombre',
                            producto_unidad: productoData.unidad_medida?.nombre || p.producto_unidad || '',
                            producto_stock: productoData.stock || p.producto_stock || 0,
                            aprobaciones: p.aprobaciones || []
                        };
                    });
                    setPedidos(pedidosConAprobaciones);
                    toast.success(`✅ ${data.length} pedidos cargados`);
                } else {
                    setPedidos([]);
                    toast.info('📋 No hay pedidos pendientes de aprobación');
                }
            } else if (response.status === 401) {
                setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
                toast.error('❌ Sesión expirada');
            } else {
                setError(`Error ${response.status}: ${response.statusText}`);
                toast.error(`❌ Error al cargar pedidos: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            setError('Error de conexión con el servidor');
            toast.error('❌ Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = async (pedidoId) => {
        setAprobando(pedidoId);
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/pedidos/${pedidoId}/aprobar/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                toast.success('✅ Pedido aprobado correctamente');
                setPedidos(prev => prev.filter(p => p.id !== pedidoId));
                setAprobacionesVisibles(prev => ({ ...prev, [pedidoId]: false }));
                cargarPedidos();
            } else if (response.status === 403) {
                toast.warning('⚠️ No tienes permisos para aprobar este pedido.');
            } else {
                const errorData = await response.json();
                toast.error(`❌ Error al aprobar: ${errorData.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('❌ Error al aprobar el pedido');
        } finally {
            setAprobando(null);
        }
    };

    const handleRechazar = async (pedidoId) => {
        if (!motivoRechazo.trim()) {
            toast.warning('⚠️ Debes ingresar un motivo de rechazo');
            return;
        }
        
        setAprobando(pedidoId);
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/pedidos/${pedidoId}/rechazar/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ motivo: motivoRechazo.trim() })
            });
            
            if (response.ok) {
                toast.success('❌ Pedido rechazado correctamente');
                setPedidos(prev => prev.filter(p => p.id !== pedidoId));
                setAprobacionesVisibles(prev => ({ ...prev, [pedidoId]: false }));
                setModalAbierto(false);
                setPedidoSeleccionado(null);
                cargarPedidos();
            } else if (response.status === 403) {
                toast.warning('⚠️ No tienes permisos para rechazar este pedido.');
            } else {
                const errorData = await response.json();
                toast.error(`❌ Error al rechazar: ${errorData.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('❌ Error al rechazar el pedido');
        } finally {
            setAprobando(null);
        }
    };

    const handleInspeccionar = (pedido) => {
        setPedidoSeleccionado(pedido);
        setModalAbierto(true);
        setMostrarMotivo(false);
        setMotivoRechazo('');
    };

    const generarPDF = async (pedido) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/pedidos/generar-pdf/${pedido.id}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `pedido_${pedido.codigo}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('✅ PDF descargado correctamente');
            } else {
                generarPDFLocal(pedido);
            }
        } catch (error) {
            console.error('Error:', error);
            generarPDFLocal(pedido);
        }
    };

    const generarPDFLocal = (pedido) => {
        const ventana = window.open('', '_blank');
        ventana.document.write(`
            <html>
            <head>
                <title>Pedido ${pedido.codigo}</title>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                    .header { border-bottom: 3px solid #0F7A53; padding-bottom: 15px; margin-bottom: 20px; }
                    .header h1 { color: #0F7A53; margin: 0; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
                    .label { font-weight: 600; color: #555; }
                    .value { margin-top: 3px; color: #333; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th { background: #0F7A53; color: white; padding: 10px; text-align: left; }
                    td { padding: 10px; border-bottom: 1px solid #ddd; }
                    .footer { margin-top: 30px; border-top: 2px solid #333; padding-top: 15px; font-size: 12px; color: #666; }
                    .badge { display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 12px; }
                    .badge-warning { background: #FEF3C7; color: #92400E; }
                    .badge-success { background: #D1FAE5; color: #065F46; }
                    .badge-danger { background: #FEE2E2; color: #991B1B; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📋 Detalle del Pedido</h1>
                    <p><strong>Código:</strong> ${pedido.codigo}</p>
                </div>
                <div class="grid">
                    <div><div class="label">Solicitante</div><div class="value">${pedido.solicitante || 'N/A'}</div></div>
                    <div><div class="label">Producto</div><div class="value">${pedido.producto_nombre || 'N/A'}</div></div>
                    <div><div class="label">Cantidad</div><div class="value">${pedido.cantidad || 0} ${pedido.producto_unidad || ''}</div></div>
                    <div><div class="label">Stock</div><div class="value">${pedido.producto_stock || 0} ${pedido.producto_unidad || ''}</div></div>
                </div>
                ${pedido.observaciones ? `
                <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong>Observaciones:</strong><br>
                    ${pedido.observaciones.replace(/\n/g, '<br>')}
                </div>
                ` : ''}
                <h3>📜 Historial de Aprobaciones</h3>
                <table>
                    <thead><tr><th>#</th><th>Aprobado por</th><th>Fecha</th><th>Estado</th></tr></thead>
                    <tbody>
                        ${pedido.aprobaciones?.length > 0 ? pedido.aprobaciones.map((a, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${a.aprobado_por || 'N/A'}</td>
                                <td>${a.fecha || 'N/A'}</td>
                                <td><span class="badge ${a.estado === 'aprobado' ? 'badge-success' : a.estado === 'rechazado' ? 'badge-danger' : 'badge-warning'}">${a.estado?.toUpperCase() || 'PENDIENTE'}</span></td>
                            </tr>
                        `).join('') : `
                            <tr><td colspan="4" style="text-align:center;color:#888;">Sin aprobaciones registradas</td></tr>
                        `}
                    </tbody>
                </table>
                <div class="footer">
                    <p>📅 Generado el: ${new Date().toLocaleString()}</p>
                </div>
                <script>window.onload = function() { window.print(); }<\/script>
            </body>
            </html>
        `);
        ventana.document.close();
        toast.success('✅ PDF generado correctamente');
    };

    const toggleAprobaciones = (pedidoId) => {
        setAprobacionesVisibles(prev => ({
            ...prev,
            [pedidoId]: !prev[pedidoId]
        }));
    };

    const getPrioridadColor = (prioridad) => {
        const colores = {
            'alta': 'bg-red-50 text-red-700 border-red-200',
            'media': 'bg-amber-50 text-amber-700 border-amber-200',
            'baja': 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
        return colores[prioridad] || 'bg-stone-50 text-stone-600 border-stone-200';
    };

    const getEstadoAprobacion = (estado) => {
        switch(estado?.toLowerCase()) {
            case 'aprobado': 
                return { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />, text: 'Aprobado', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            case 'rechazado': 
                return { icon: <XCircle className="w-3.5 h-3.5 text-red-600" />, text: 'Rechazado', class: 'bg-red-50 text-red-700 border-red-200' };
            default: 
                return { icon: <Clock className="w-3.5 h-3.5 text-amber-600" />, text: 'Pendiente', class: 'bg-amber-50 text-amber-700 border-amber-200' };
        }
    };

    // Filtros
    const pedidosFiltrados = pedidos.filter(p => {
        const matchSearch = p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.solicitante?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchPrioridad = filtroPrioridad === 'todas' || p.prioridad === filtroPrioridad;
        
        return matchSearch && matchPrioridad;
    });

    // ============================================================
    // MODAL DE DETALLE
    // ============================================================
    const DetallePedidoModal = ({ pedido, isOpen, onClose, onAprobar, onRechazar }) => {
        if (!isOpen || !pedido) return null;

        const getEstadoColor = (estado) => {
            const colores = {
                'pendiente': 'bg-amber-100 text-amber-700 border-amber-200',
                'requiere_aprobacion': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                'aprobado': 'bg-emerald-100 text-emerald-700 border-emerald-200',
                'rechazado': 'bg-red-100 text-red-700 border-red-200'
            };
            return colores[estado] || 'bg-stone-100 text-stone-700 border-stone-200';
        };

        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-stone-200 p-5 flex justify-between items-center z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                                <FileText className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-stone-800">Detalle del Pedido</h2>
                                <p className="text-sm text-stone-500 font-mono">
                                    Código: <span className="font-bold text-stone-700">{pedido.codigo}</span>
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5 text-stone-400" />
                        </button>
                    </div>

                    {/* Contenido */}
                    <div className="p-6">
                        {/* Estado y prioridad */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getEstadoColor(pedido.estado)}`}>
                                {pedido.estado?.toUpperCase() || 'PENDIENTE'}
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getPrioridadColor(pedido.prioridad)}`}>
                                Prioridad: {pedido.prioridad?.toUpperCase() || 'MEDIA'}
                            </span>
                            {pedido.requiere_aprobacion_jefe && (
                                <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    ⚠️ Requiere aprobación
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-stone-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-stone-400 font-medium uppercase">Solicitante</p>
                                    <p className="font-medium text-stone-700">{pedido.solicitante || pedido.usuario_nombre}</p>
                                    <p className="text-sm text-stone-500">@{pedido.usuario_username}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-stone-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-stone-400 font-medium uppercase">Fecha de solicitud</p>
                                    <p className="font-medium text-stone-700">
                                        {pedido.fecha_solicitud ? new Date(pedido.fecha_solicitud).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Producto */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                                <Package className="w-4 h-4 text-emerald-600" />
                                Producto solicitado
                            </h3>
                            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-stone-400 font-medium uppercase">Producto</p>
                                        <p className="font-bold text-stone-800">{pedido.producto_nombre}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-400 font-medium uppercase">Cantidad</p>
                                        <p className="font-bold text-emerald-600">{pedido.cantidad} {pedido.producto_unidad}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-stone-400 font-medium uppercase">Stock actual</p>
                                        <p className={`font-bold ${pedido.producto_stock < pedido.cantidad ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {pedido.producto_stock} {pedido.producto_unidad}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Observaciones */}
                        {pedido.observaciones && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-stone-700 mb-2">Observaciones</h3>
                                <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                                    <p className="text-sm text-stone-600 whitespace-pre-wrap">{pedido.observaciones}</p>
                                </div>
                            </div>
                        )}

                        {/* Motivo de rechazo */}
                        {pedido.motivo_rechazo && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                                    <XCircle className="w-4 h-4" />
                                    Motivo de rechazo
                                </h3>
                                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                                    <p className="text-sm text-red-600">{pedido.motivo_rechazo}</p>
                                </div>
                            </div>
                        )}

                        {/* Acciones */}
                        <div className="border-t border-stone-200 pt-4 mt-4">
                            {pedido.estado === 'requiere_aprobacion' ? (
                                mostrarMotivo ? (
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-stone-700">
                                            Motivo de rechazo *
                                        </label>
                                        <textarea
                                            value={motivoRechazo}
                                            onChange={(e) => setMotivoRechazo(e.target.value)}
                                            rows="3"
                                            className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-colors"
                                            placeholder="Describe el motivo del rechazo..."
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    if (!motivoRechazo.trim()) {
                                                        toast.warning('Debes ingresar un motivo de rechazo');
                                                        return;
                                                    }
                                                    onRechazar(pedido.id);
                                                }}
                                                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                                            >
                                                Confirmar rechazo
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setMostrarMotivo(false);
                                                    setMotivoRechazo('');
                                                }}
                                                className="px-5 py-2.5 bg-stone-200 text-stone-700 rounded-xl hover:bg-stone-300 transition-colors font-medium"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => {
                                                onAprobar(pedido.id);
                                                onClose();
                                            }}
                                            disabled={aprobando === pedido.id}
                                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            {aprobando === pedido.id ? 'Aprobando...' : '✅ Aprobar pedido'}
                                        </button>
                                        <button
                                            onClick={() => setMostrarMotivo(true)}
                                            className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            ❌ Rechazar pedido
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="px-6 py-2.5 bg-stone-200 text-stone-700 rounded-xl hover:bg-stone-300 transition-colors font-medium"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                )
                            ) : (
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-stone-200 text-stone-700 rounded-xl hover:bg-stone-300 transition-colors font-medium"
                                >
                                    Cerrar
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };

    // ============================================================
    // RENDER PRINCIPAL
    // ============================================================
    return (
        <Layout>
            <div className="p-4 sm:p-6 max-w-7xl mx-auto">
                {/* ===== HEADER ===== */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                            <Shield className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest">
                            SIGIRL · APROBACIONES
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold font-mono text-stone-700 flex items-center gap-2">
                        Aprobación de Pedidos
                    </h1>
                    <p className="text-sm text-stone-500 mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            {pedidos.length} pendientes
                        </span>
                        Revisa y aprueba las solicitudes de reactivos y equipos
                    </p>
                </div>

                {/* ===== FILTROS ===== */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Buscar por producto, código o solicitante..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-sm"
                        />
                    </div>
                    
                    <div className="relative w-full sm:w-48">
                        <select
                            value={filtroPrioridad}
                            onChange={(e) => setFiltroPrioridad(e.target.value)}
                            className="w-full appearance-none bg-white border border-stone-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer"
                        >
                            <option value="todas">Todas las prioridades</option>
                            <option value="alta">🔴 Alta</option>
                            <option value="media">🟡 Media</option>
                            <option value="baja">🟢 Baja</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    </div>

                    <button
                        onClick={cargarPedidos}
                        className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 whitespace-nowrap text-sm font-medium shadow-sm hover:shadow-md"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Actualizar
                    </button>
                </div>

                {/* ===== ERROR ===== */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm">{error}</span>
                        <button 
                            onClick={cargarPedidos}
                            className="ml-auto text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded-lg transition-colors"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* ===== TABLA ===== */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-stone-500 font-mono">Cargando pedidos...</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-stone-50 border-b border-stone-200">
                                        <th className="px-4 py-3 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Código</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Producto</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Cant.</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Solicitante</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Stock</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Prioridad</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {pedidosFiltrados.length > 0 ? (
                                        pedidosFiltrados.map((pedido) => (
                                            <Fragment key={pedido.id}>
                                                <tr className="hover:bg-emerald-50/40 transition-colors">
                                                    <td className="px-4 py-3 font-mono text-sm font-medium text-stone-700">
                                                        {pedido.codigo}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-stone-700">
                                                        <div className="max-w-[180px] truncate">
                                                            {pedido.producto_nombre}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-bold text-stone-700">
                                                        {pedido.cantidad} {pedido.producto_unidad}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-700">
                                                                {pedido.solicitante?.charAt(0).toUpperCase() || 'U'}
                                                            </div>
                                                            <span className="text-sm text-stone-700">
                                                                {pedido.solicitante || pedido.usuario_nombre}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`${pedido.producto_stock < pedido.cantidad ? 'text-red-600 font-bold' : 'text-stone-600'}`}>
                                                            {pedido.producto_stock} {pedido.producto_unidad}
                                                        </span>
                                                        {pedido.producto_stock < pedido.cantidad && (
                                                            <span className="ml-1 text-red-500 text-xs">⚠️</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getPrioridadColor(pedido.prioridad)}`}>
                                                            {pedido.prioridad?.toUpperCase() || 'MEDIA'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            {/* Historial */}
                                                            <button
                                                                onClick={() => toggleAprobaciones(pedido.id)}
                                                                className={`p-1.5 rounded-lg transition-colors ${
                                                                    aprobacionesVisibles[pedido.id] 
                                                                    ? 'text-emerald-600 bg-emerald-50' 
                                                                    : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                                                                }`}
                                                                title="Ver historial de aprobaciones"
                                                            >
                                                                <History className="w-4 h-4" />
                                                            </button>
                                                            
                                                            {/* Inspeccionar */}
                                                            <button
                                                                onClick={() => handleInspeccionar(pedido)}
                                                                className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Inspeccionar"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            
                                                            {/* Aprobar */}
                                                            <button
                                                                onClick={() => handleAprobar(pedido.id)}
                                                                disabled={aprobando === pedido.id}
                                                                className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                                                title="Aprobar"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>

                                                            {/* PDF */}
                                                            <button
                                                                onClick={() => generarPDF(pedido)}
                                                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                                                title="Descargar PDF"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                
                                                {/* FILA EXPANDIDA DE APROBACIONES */}
                                                {aprobacionesVisibles[pedido.id] && (
                                                    <tr>
                                                        <td colSpan="7" className="px-4 py-3 bg-stone-50">
                                                            <div className="border border-stone-200 rounded-lg overflow-hidden">
                                                                <div className="bg-white px-4 py-2.5 border-b border-stone-200 flex items-center justify-between">
                                                                    <h4 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                                                                        <History className="w-4 h-4 text-emerald-600" />
                                                                        Historial de Aprobaciones
                                                                        <span className="text-xs font-normal text-stone-400 ml-2">
                                                                            ({pedido.aprobaciones?.length || 0} registros)
                                                                        </span>
                                                                    </h4>
                                                                    <button
                                                                        onClick={() => toggleAprobaciones(pedido.id)}
                                                                        className="text-stone-400 hover:text-stone-600"
                                                                    >
                                                                        <XCircle className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                                
                                                                <div className="p-4">
                                                                    {pedido.aprobaciones?.length > 0 ? (
                                                                        <>
                                                                            <table className="w-full text-sm">
                                                                                <thead>
                                                                                    <tr className="text-left text-[10px] text-stone-500 font-mono font-bold uppercase tracking-wider border-b border-stone-200">
                                                                                        <th className="px-3 py-2">#</th>
                                                                                        <th className="px-3 py-2">Aprobado por</th>
                                                                                        <th className="px-3 py-2">Fecha</th>
                                                                                        <th className="px-3 py-2">Estado</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-stone-100">
                                                                                    {pedido.aprobaciones.map((aprobacion, index) => {
                                                                                        const estado = getEstadoAprobacion(aprobacion.estado);
                                                                                        return (
                                                                                            <tr key={aprobacion.id || index} className="hover:bg-white transition-colors">
                                                                                                <td className="px-3 py-2 text-stone-500 text-sm">{index + 1}</td>
                                                                                                <td className="px-3 py-2 font-medium text-stone-700 text-sm">
                                                                                                    {aprobacion.aprobado_por || aprobacion.usuario_nombre || 'N/A'}
                                                                                                </td>
                                                                                                <td className="px-3 py-2 text-stone-600 text-sm">
                                                                                                    {aprobacion.fecha || aprobacion.fecha_aprobacion || 'N/A'}
                                                                                                </td>
                                                                                                <td className="px-3 py-2">
                                                                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${estado.class}`}>
                                                                                                        {estado.icon}
                                                                                                        {estado.text}
                                                                                                    </span>
                                                                                                </td>
                                                                                            </tr>
                                                                                        );
                                                                                    })}
                                                                                </tbody>
                                                                            </table>
                                                                            <div className="mt-3 text-xs text-stone-500 flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                                                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                                                Última aprobación: <strong>{pedido.aprobaciones[0]?.aprobado_por || 'N/A'}</strong>
                                                                                <span className={`ml-auto inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getEstadoAprobacion(pedido.aprobaciones[0]?.estado).class}`}>
                                                                                    {getEstadoAprobacion(pedido.aprobaciones[0]?.estado).icon}
                                                                                    {getEstadoAprobacion(pedido.aprobaciones[0]?.estado).text}
                                                                                </span>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="text-center py-6 text-stone-400">
                                                                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                                            <p className="text-sm">No hay aprobaciones registradas</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                                                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                                                    </div>
                                                    <p className="text-lg font-medium text-stone-700">No hay pedidos pendientes de aprobación</p>
                                                    <p className="text-sm text-stone-400">Todos los pedidos han sido procesados</p>
                                                    <button
                                                        onClick={cargarPedidos}
                                                        className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors inline-flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                        Actualizar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ===== MODAL ===== */}
                <DetallePedidoModal
                    pedido={pedidoSeleccionado}
                    isOpen={modalAbierto}
                    onClose={() => {
                        setModalAbierto(false);
                        setPedidoSeleccionado(null);
                        setMostrarMotivo(false);
                        setMotivoRechazo('');
                    }}
                    onAprobar={handleAprobar}
                    onRechazar={handleRechazar}
                />
            </div>
        </Layout>
    );
};

export default AprobacionesJefe;