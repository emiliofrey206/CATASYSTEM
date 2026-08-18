import { useState, useMemo } from 'react';
import { 
  Search, CheckCircle, Clock, 
  User, DollarSign, Package, Check, Loader2, Activity
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

// Normalizador seguro de estados
function normalizeStatus(status?: string): 'PENDIENTE' | 'PAGADO' | 'CANCELADO' {
  const s = (status || '').toLowerCase().trim();
  if (s === 'completed' || s === 'pagado' || s === 'completado') return 'PAGADO';
  if (s === 'cancelled' || s === 'cancelado' || s === 'anulado') return 'CANCELADO';
  return 'PENDIENTE';
}

export function AdminOrders({ activeStore, orders, confirmPayment, cancelOrder }: AdminOrdersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'PENDIENTE' | 'PAGADO' | 'CANCELADO'>('TODOS');
  
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  // Color Dinámico del Sistema
  const accentColor = activeStore?.accentColor || '#38bdf8';

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

  // FUNCIÓN REPARADA: Confirmar Pago
  const handleConfirm = async (e: React.MouseEvent, order: Order) => {
    e.preventDefault();
    e.stopPropagation(); // Evita que el clic se pierda
    try {
      setLoadingOrderId(order.id);
      if (confirmPayment) {
        await confirmPayment(activeStore.id, order.id);
      }
    } catch (error: any) {
      console.error("Error en pago:", error);
      alert("No se pudo procesar el pago: " + (error?.message || "Error de red"));
    } finally {
      setLoadingOrderId(null);
    }
  };

  // FUNCIÓN REPARADA: Anular Pedido
  const handleCancel = async (e: React.MouseEvent, order: Order) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('¿Seguro que deseas anular este pedido?')) return;
    try {
      setLoadingOrderId(order.id);
      if (cancelOrder) {
        await cancelOrder(activeStore.id, order.id);
      }
    } catch (error: any) {
      console.error("Error al anular:", error);
      alert("No se pudo anular el pedido.");
    } finally {
      setLoadingOrderId(null);
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 font-sans">
      
      {/* 1. MÉTRICAS (ESTILO BENTO BOX / HELIOS INVESTMENTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
        
        {/* Tarjeta Principal Brillante: Ingresos */}
        <div className="relative p-6 sm:p-8 rounded-[2rem] bg-white/90 dark:bg-[#151821]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/5 shadow-xl overflow-hidden group">
          {/* Resplandor Dinámico con Color del Sistema */}
          <div 
            className="absolute -right-16 -top-16 w-48 h-48 blur-[60px] opacity-20 dark:opacity-15 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none" 
            style={{ backgroundColor: accentColor }} 
          />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Ingresos Totales</span>
            <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-black/5 dark:bg-white/10 flex items-center gap-1 text-slate-700 dark:text-slate-300">
              Pagados
            </div>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white relative z-10 mb-6">
            ${stats.revenue.toFixed(2)}
          </h2>

          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 relative z-10 uppercase tracking-widest">
            <Activity className="w-4 h-4" style={{ color: accentColor }} />
            <span>Balance de Tienda</span>
          </div>
        </div>

        {/* Tarjetas Secundarias: Pendientes y Completados */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Pedidos Pendientes */}
          <div className="p-6 sm:p-8 rounded-[2rem] bg-white/90 dark:bg-[#151821]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/5 shadow-lg flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-inner">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-full border border-amber-200/50 dark:border-amber-500/20">
                  En Proceso
                </span>
             </div>
             <div>
               <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{stats.pendingCount}</h3>
               <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">Pedidos Pendientes</p>
             </div>
          </div>

          {/* Ventas Completadas */}
          <div className="p-6 sm:p-8 rounded-[2rem] bg-white/90 dark:bg-[#151821]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/5 shadow-lg flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-500/20">
                  Exitosos
                </span>
             </div>
             <div>
               <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{stats.completedCount}</h3>
               <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">Ventas Completadas</p>
             </div>
          </div>

        </div>
      </div>

      {/* 2. BARRA DE BÚSQUEDA Y PÍLDORAS (HELIO STYLE) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 w-full">
        
        {/* Píldoras de Navegación (Tabs) */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-[#11141D]/80 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200/60 dark:border-white/5 overflow-x-auto no-scrollbar shadow-inner">
          {(['TODOS', 'PENDIENTE', 'PAGADO', 'CANCELADO'] as const).map(tab => {
            const isActive = statusFilter === tab;
            return (
              <button
                type="button"
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`relative px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  isActive 
                    ? 'text-white shadow-md' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                }`}
                style={isActive ? { backgroundColor: accentColor } : {}}
              >
                {tab}
              </button>
            )
          })}
        </div>

        {/* Buscador de Píldora */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar pedido o cliente..." 
            className="w-full bg-white/80 dark:bg-[#151821]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/5 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all shadow-sm focus:ring-1"
            style={{ '--tw-ring-color': accentColor } as any}
          />
        </div>
      </div>

      {/* 3. GRID DE PEDIDOS (Elegante y Limpio) */}
      {filteredOrders.length === 0 ? (
        <div className="p-16 text-center rounded-[2rem] bg-white/80 dark:bg-[#151821]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/5 shadow-sm">
          <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4 opacity-50" />
          <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">No hay pedidos en esta sección</h4>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5 sm:gap-6 w-full">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => {
              const status = normalizeStatus(order.status);
              const isPending = status === 'PENDIENTE';
              const isCompleted = status === 'PAGADO';
              const isProcessingThis = loadingOrderId === order.id;

              return (
                <motion.div 
                  key={order.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-[2rem] p-5 sm:p-6 bg-white/95 dark:bg-[#181B26]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/5 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Cabecera del Pedido */}
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-white/5">
                      <div>
                        <span className="font-black text-sm text-slate-900 dark:text-white tracking-wider">{order.id}</span>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                          <User className="w-3.5 h-3.5" style={{ color: accentColor }} />
                          <span className="truncate max-w-[120px]">{order.customerName || 'Cliente'}</span>
                        </div>
                      </div>

                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        isPending 
                          ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' 
                          : isCompleted 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                          : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                      }`}>
                        {status}
                      </span>
                    </div>

                    {/* Lista de Productos (Scroll Interno Elegante) */}
                    <div className="space-y-2 my-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-[#11141D] border border-slate-100 dark:border-white/5 group-hover:border-slate-200 dark:group-hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.productName}</p>
                              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                                {item.quantity}x {item.color ? `• ${item.color}` : ''}
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

                  {/* Footer del Pedido: Total y Botones Activos */}
                  <div className="pt-5 mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Total a Cobrar</span>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">${Number(order.totalAmount).toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <>
                          <button 
                            type="button"
                            disabled={isProcessingThis}
                            onClick={(e) => handleCancel(e, order)}
                            className="px-4 py-2.5 rounded-xl text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                          >
                            Anular
                          </button>
                          
                          {/* BOTÓN DE PAGADO REPARADO */}
                          <button 
                            type="button"
                            disabled={isProcessingThis}
                            onClick={(e) => handleConfirm(e, order)}
                            className="px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-400 hover:shadow-emerald-500/40 disabled:opacity-50 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            {isProcessingThis ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <DollarSign className="w-4 h-4" />
                            )}
                            <span>Pagado</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
