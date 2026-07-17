// src/pages/DetallePedidoModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Calendar, User, Package, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const DetallePedidoModal = ({ pedido, isOpen, onClose, onAprobar, onRechazar }) => {
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [mostrarMotivo, setMostrarMotivo] = useState(false);

    console.log('📱 Modal abierto:', isOpen, 'Pedido:', pedido);

    if (!isOpen || !pedido) {
        console.log('❌ Modal cerrado o sin pedido');
        return null;
    }

    const getEstadoColor = (estado) => {
        const colores = {
            'pendiente': 'bg-amber-100 text-amber-700 border-amber-200',
            'requiere_aprobacion': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'aprobado': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'rechazado': 'bg-red-100 text-red-700 border-red-200'
        };
        return colores[estado] || 'bg-stone-100 text-stone-700 border-stone-200';
    };

    const getPrioridadColor = (prioridad) => {
        const colores = {
            'alta': 'text-red-600 bg-red-50',
            'media': 'text-amber-600 bg-amber-50',
            'baja': 'text-emerald-600 bg-emerald-50'
        };
        return colores[prioridad] || 'text-stone-600 bg-stone-50';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-stone-200 p-4 flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-emerald-600" />
                        <div>
                            <h2 className="text-xl font-bold text-stone-800">Detalle del Pedido</h2>
                            <p className="text-sm text-stone-500">
                                Código: <span className="font-mono font-bold">{pedido.codigo}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-stone-400" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6">
                    <div className="flex flex-wrap gap-3 mb-6">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getEstadoColor(pedido.estado)}`}>
                            {pedido.estado?.toUpperCase() || 'PENDIENTE'}
                        </span>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getPrioridadColor(pedido.prioridad)}`}>
                            Prioridad: {pedido.prioridad?.toUpperCase() || 'MEDIA'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-stone-50 rounded-xl">
                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-stone-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-stone-400">Solicitante</p>
                                <p className="font-medium text-stone-700">{pedido.solicitante || pedido.usuario_nombre || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-stone-400 mt-0.5" />
                            <div>
                                <p className="text-xs text-stone-400">Fecha de solicitud</p>
                                <p className="font-medium text-stone-700">
                                    {pedido.fecha_solicitud ? new Date(pedido.fecha_solicitud).toLocaleDateString('es-CO') : '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Producto solicitado
                        </h3>
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-stone-400">Producto</p>
                                    <p className="font-bold text-stone-800">{pedido.producto_nombre || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-stone-400">Cantidad</p>
                                    <p className="font-bold text-emerald-600">{pedido.cantidad} {pedido.producto_unidad || ''}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-stone-400">Stock actual</p>
                                    <p className={`font-bold ${pedido.producto_stock < pedido.cantidad ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {pedido.producto_stock || 0} {pedido.producto_unidad || ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {pedido.observaciones && (
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-stone-700 mb-2">Observaciones</h3>
                            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                                <p className="text-sm text-stone-600 whitespace-pre-wrap">{pedido.observaciones}</p>
                            </div>
                        </div>
                    )}

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
                                        className="w-full border border-stone-200 rounded-lg px-4 py-2 focus:outline-none focus:border-red-400"
                                        placeholder="Describe el motivo del rechazo..."
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                if (!motivoRechazo.trim()) {
                                                    toast.warning('⚠️ Debes ingresar un motivo de rechazo');
                                                    return;
                                                }
                                                onRechazar(pedido.id, motivoRechazo);
                                                setMostrarMotivo(false);
                                                setMotivoRechazo('');
                                                onClose();
                                            }}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            Confirmar rechazo
                                        </button>
                                        <button
                                            onClick={() => setMostrarMotivo(false)}
                                            className="px-4 py-2 bg-stone-200 text-stone-600 rounded-lg hover:bg-stone-300"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => {
                                            console.log('✅ Aprobando desde modal:', pedido.id);
                                            onAprobar(pedido.id);
                                            onClose();
                                        }}
                                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        ✅ Aprobar pedido
                                    </button>
                                    <button
                                        onClick={() => setMostrarMotivo(true)}
                                        className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        ❌ Rechazar pedido
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2.5 bg-stone-200 text-stone-600 rounded-lg hover:bg-stone-300"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            )
                        ) : (
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-stone-200 text-stone-600 rounded-lg hover:bg-stone-300"
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

export default DetallePedidoModal;