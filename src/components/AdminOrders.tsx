import { useState, useMemo } from 'react';
import { 
  Search, CheckCircle, Clock, 
  User, DollarSign, Package, Check, Loader2, X, Phone, Hash, CreditCard
} from 'lucide-react';
import { Order, Product, Store } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AdminOrdersProps {
  activeStore: Store;
  orders: Order[];
  products: Product[];
  addOrder?: any;
  confirmPayment?: Function;
  cancelOrder?: Function;
}

// Normalizador seguro de estados para leer tu base de datos sin errores
function normalizeStatus(status?: string): 'PENDIENTE' | 'PAGADO' | 'CANCELADO' {
  const s = (status || '').toLowerCase().trim();
  if (s === 'completed' || s === 'pagado' || s === 'completado') return 'PAGADO';
  if (s === 'cancelled' || s === 'cancelado' || s === 'anulado') return 'CANCELADO';
  return 'PENDIENTE';
}

export function AdminOrders({ activeStore, orders, confirmPayment, cancelOrder }: AdminOrdersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'PENDIENTE' | 'PAGADO' | 'CANCELADO'>('TODOS');
  
  // Estado para mostrar el círculo de carga
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  // --- ESTADOS PARA EL MODAL DE PAGO ---
  const [paymentModalOpen, setPaymentModalOpen] = useState<Order | null>(null);
  const [paymentData, setPaymentData] = useState({ clientName: '', phone: '', reference: '' });

  // Cálculo de Métricas en tiempo real
  const stats = useMemo(() => {
    let revenue = 0;
    let pendingCount = 0;
    let completedCount = 0;

    orders.forEach(o => {
      const st = normalizeStatus(o.status);
      if (st === 'PAGADO') {
        revenue += Number(o.totalAmount) || 0;
        completedCount += 1;
      } else if (st === 'PENDIENTE') {
        pendingCount += 1;
      }
    });

    return { revenue, pendingCount, completedCount };
  }, [orders]);

  // Filtro de lista
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch = 
        (order.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase());

      const orderStatus = normalizeStatus(order.status);
      const matchStatus = statusFilter === 'TODOS' || orderStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // ABRIR EL MODAL PRECARGANDO EL NOMBRE DEL CLIENTE
  const handleOpenPaymentModal = (order: Order) => {
    setPaymentData({ 
      clientName: order.customerName || '', 
      phone: '', 
      reference: '' 
    });
    setPaymentModalOpen(order);
  };

  // FUNCIÓN BLINDADA PARA CONFIRMAR PAGO (DESDE EL MODAL)
  const submitPayment = async () => {
    if (!paymentModalOpen) return;
    try {
      setLoadingOrderId(paymentModalOpen.id);
      if (confirmPayment) {
        // Enviamos el pago confirmando tienda, pedido y los datos extra recogidos
        await confirmPayment(activeStore.id, paymentModalOpen.id, paymentData);
      }
      // Cerramos el modal limpiando datos
      setPaymentModalOpen(null);
      setPaymentData({ clientName: '', phone: '', reference: '' });
    } catch (error: any) {
      console.error("Error en pago:", error);
      alert("No se pudo procesar el pago: " + (error?.message || "Error de red"));
    } finally {
      setLoadingOrderId(null);
    }
  };

  // FUNCIÓN BLINDADA PARA ANULAR PEDIDO
  const handleCancel = async (order: Order) => {
    if (!window.confirm('¿Seguro que deseas anular este pedido?')) return;
    try {
      setLoadingOrderId(order.id);
      if (cancelOrder) {
        await cancelOrder(activeStore.id, order.id);
      }
    } catch (error: any) {
      console.error("Error al anular:", error);
      alert("No se pudo anular el pedido: " + (error?.message || "Error de red"));
    } finally {
      setLoadingOrderId(null);
    }
  };

  return (
    <div className="w-full space-y-5">
      
      {/* 1. TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
        
        <div className="p-5 rounded-3xl bg-white dark:bg-[#151821] border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Ingresos (Pagados)</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              ${stats.revenue.toFixed(2)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#151821] border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Pedidos Pendientes</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.pendingCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#151821] border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-sm sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Ventas Completadas</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.completedCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. BARRA DE BÚSQUEDA Y SELECTOR DE ESTADOS */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#151821] p-3 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
        
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Nº de Pedido o Cliente..." 
            className="w-full bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-white/5 rounded-xl sm:rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#11131A] p-1 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar">
          {(['TODOS', 'PENDIENTE', 'PAGADO', 'CANCELADO'] as const).map(tab => (
            <button
              type="button"
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                statusFilter === tab 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

      </div>

      {/* 3. GRID DE PEDIDOS */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-[2.5rem] bg-white dark:bg-[#151821] border border-slate-200 dark:border-white/5">
          <Package className="w-12 h-12 mx-auto text-slate-400 mb-3 opacity-40" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No hay pedidos en esta sección</h4>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-5 w-full">
          {filteredOrders.map((order) => {
            const status = normalizeStatus(order.status);
            const isPending = status === 'PENDIENTE';
            const isCompleted = status === 'PAGADO';
            const isProcessingThis = loadingOrderId === order.id;

            return (
              <motion.div 
                key={order.id} 
                layout
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[2rem] p-5 sm:p-6 bg-white dark:bg-[#151821] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-white/5">
                    <div>
                      <span className="font-black text-sm text-slate-900 dark:text-white tracking-wider">{order.id}</span>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        <span className="truncate max-w-[120px]">{order.customerName || 'Cliente'}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      isPending 
                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' 
                        : isCompleted 
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                        : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                    }`}>
                      {status}
                    </span>
                  </div>

                  <div className="space-y-2 my-4 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#11131A] border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-white/5 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.productName}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {item.quantity}x {item.color ? `• Color: ${item.color}` : ''}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-4 sm:gap-0">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total</span>
                    <p className="text-xl font-black text-slate-900 dark:text-white">${Number(order.totalAmount).toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {isPending && (
                      <>
                        <button 
                          type="button"
                          disabled={isProcessingThis}
                          onClick={() => handleCancel(order)}
                          className="flex-1 sm:flex-none px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 disabled:opacity-50 transition-all text-center"
                        >
                          Anular
                        </button>
                        
                        {/* --- EL BOTÓN QUE AHORA ABRE EL MODAL --- */}
                        <button 
                          type="button"
                          disabled={isProcessingThis}
                          onClick={() => handleOpenPaymentModal(order)}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                        >
                          {isProcessingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span>Pagado</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL PARA REGISTRAR DATOS DE PAGO (GLASSMORPHISM)        */}
      {/* ========================================================= */}
      <AnimatePresence>
        {paymentModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#151821] rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
            >
              {/* Cabecera del Modal */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-[#11131A]">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Confirmar Pago</h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => setPaymentModalOpen(null)} 
                  className="p-2 rounded-full bg-slate-200 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Formulario del Modal */}
              <div className="p-6 space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                    <User className="w-3.5 h-3.5" /> Nombre del Cliente
                  </label>
                  <input 
                    type="text" 
                    value={paymentData.clientName} 
                    onChange={(e) => setPaymentData({ ...paymentData, clientName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="Ej. Marbelis Bravo"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                    <Phone className="w-3.5 h-3.5" /> Número de Teléfono
                  </label>
                  <input 
                    type="tel" 
                    value={paymentData.phone} 
                    onChange={(e) => setPaymentData({ ...paymentData, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="Ej. 0414-1234567"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                    <Hash className="w-3.5 h-3.5" /> Número de Referencia
                  </label>
                  <input 
                    type="text" 
                    value={paymentData.reference} 
                    onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="Ej. 0001928374"
                  />
                </div>
              </div>
              
              {/* Botones del Modal */}
              <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#11131A] flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setPaymentModalOpen(null)} 
                  className="flex-1 py-3.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  onClick={submitPayment}
                  disabled={loadingOrderId !== null}
                  className="flex-[2] py-3.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loadingOrderId === paymentModalOpen.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Guardar y Aprobar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
