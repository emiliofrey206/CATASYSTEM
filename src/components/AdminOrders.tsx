import { useState, useMemo } from 'react';
import { 
  Search, Plus, CheckCircle, Clock, XCircle, 
  User, DollarSign, Calendar, Package, ArrowUpRight, Check, X, AlertCircle
} from 'lucide-react';
import { Order, Product, Store } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AdminOrdersProps {
  activeStore: Store;
  orders: Order[];
  products: Product[];
  addOrder: (order: Omit<Order, 'id' | 'status' | 'created_at'>) => Promise<Order>;
  confirmPayment?: (orderId: string) => Promise<void> | void;
  cancelOrder?: (orderId: string) => Promise<void> | void;
}

export function AdminOrders({ activeStore, orders, products, addOrder, confirmPayment, cancelOrder }: AdminOrdersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'PENDIENTE' | 'PAGADO' | 'CANCELADO'>('TODOS');
  const accentColor = activeStore?.accentColor || '#38bdf8';

  // Métricas Financieras (KPIs)
  const stats = useMemo(() => {
    const paidOrders = orders.filter(o => o.status === 'completed' || (o.status as string) === 'PAGADO');
    const pendingOrders = orders.filter(o => o.status === 'pending' || (o.status as string) === 'PENDIENTE');
    const totalRevenue = paidOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);

    return {
      revenue: totalRevenue,
      pendingCount: pendingOrders.length,
      completedCount: paidOrders.length,
    };
  }, [orders]);

  // Filtrado de Pedidos
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch = 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

      const statusUpper = (order.status || '').toUpperCase();
      let matchStatus = true;
      if (statusFilter === 'PENDIENTE') matchStatus = statusUpper === 'PENDING' || statusUpper === 'PENDIENTE';
      if (statusFilter === 'PAGADO') matchStatus = statusUpper === 'COMPLETED' || statusUpper === 'PAGADO';
      if (statusFilter === 'CANCELADO') matchStatus = statusUpper === 'CANCELLED' || statusUpper === 'CANCELADO';

      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleConfirm = (orderId: string) => {
    if (confirmPayment) confirmPayment(orderId);
  };

  const handleCancel = (orderId: string) => {
    if (window.confirm('¿Seguro que deseas anular este pedido?')) {
      if (cancelOrder) cancelOrder(orderId);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* ========================================== */}
      {/* 1. TARJETAS DE MÉTRICAS BENTO (KPIs)       */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
        
        {/* KPI 1: Ingresos */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-100 dark:bg-[#161B28] border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-sm transition-all">
          <div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Ingresos (Pagados)</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              ${stats.revenue.toFixed(2)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Pendientes */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-100 dark:bg-[#161B28] border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-sm transition-all">
          <div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Pedidos Pendientes</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.pendingCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Completados */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-100 dark:bg-[#161B28] border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-sm transition-all sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Ventas Completadas</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats.completedCount}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 2. BARRA DE BÚSQUEDA Y FILTROS EN PÍLDORAS */}
      {/* ========================================== */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-100 dark:bg-[#161B28] p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/5">
        
        {/* Input de Búsqueda */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por Nº de Pedido o Cliente..." 
            className="w-full bg-white dark:bg-[#111522] border border-slate-200 dark:border-white/5 rounded-xl sm:rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
          />
        </div>

        {/* Píldoras de Estado */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#111522] p-1 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/5 overflow-x-auto">
          {(['TODOS', 'PENDIENTE', 'PAGADO', 'CANCELADO'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                statusFilter === tab 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

      </div>

      {/* ========================================== */}
      {/* 3. GRID FLUIDO DE PEDIDOS (1, 2 O 3 COL)   */}
      {/* ========================================== */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-100 dark:bg-[#161B28] border border-slate-200 dark:border-white/5">
          <Package className="w-12 h-12 mx-auto text-slate-400 mb-3 opacity-40" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No se encontraron pedidos</h4>
          <p className="text-xs text-slate-400 mt-1">Los nuevos pedidos registrados aparecerán aquí automáticamente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-5 w-full">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'pending' || (order.status as string) === 'PENDIENTE';
            const isCompleted = order.status === 'completed' || (order.status as string) === 'PAGADO';
            const isCancelled = order.status === 'cancelled' || (order.status as string) === 'CANCELADO';

            return (
              <motion.div 
                key={order.id} 
                layout
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl p-5 sm:p-6 bg-slate-100 dark:bg-[#161B28] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                
                {/* Cabecera de la Tarjeta */}
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-white/5">
                    <div>
                      <span className="font-black text-sm text-slate-900 dark:text-white tracking-wider">{order.id}</span>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        <span>{order.customerName}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      isPending 
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' 
                        : isCompleted 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}>
                      {isPending ? 'Pendiente' : isCompleted ? 'Pagado' : 'Cancelado'}
                    </span>
                  </div>

                  {/* Lista de Productos del Pedido */}
                  <div className="space-y-2.5 my-4 max-h-48 overflow-y-auto pr-1">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#111522] border border-slate-200/60 dark:border-white/5">
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
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

                {/* Pie de la Tarjeta (Total y Botones) */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between mt-2">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total</span>
                    <p className="text-xl font-black text-slate-900 dark:text-white">${Number(order.totalAmount).toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button 
                          onClick={() => handleCancel(order.id)}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                        >
                          Anular
                        </button>
                        <button 
                          onClick={() => handleConfirm(order.id)}
                          className="px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" /> Pagado
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

    </div>
  );
}
