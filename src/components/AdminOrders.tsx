import { useState } from 'react';
import { CheckCircle2, Clock, X, DollarSign, User, Phone, CreditCard, FileText, Image as ImageIcon, Ban, Search, Receipt } from 'lucide-react';
import { Order, Store } from '../types';

interface AdminOrdersProps {
  activeStore: Store;
  orders: Order[];
  confirmPayment: (orderId: string, data: { customerName: string, customerPhone: string, paymentMethod: string, referenceNumber: string }) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
}

export function AdminOrders({ activeStore, orders, confirmPayment, cancelOrder }: AdminOrdersProps) {
  const [filter, setFilter] = useState<'todos' | 'pendiente' | 'pagado' | 'cancelado'>('pendiente');
  const [search, setSearch] = useState('');
  
  // Estados para el Modal de Pago
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState({ customerName: '', customerPhone: '', paymentMethod: 'Pago Móvil', referenceNumber: '' });
  const [isSaving, setIsSaving] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchFilter = filter === 'todos' || order.status === filter;
    const matchSearch = search === '' || 
      order.id.toLowerCase().includes(search.toLowerCase()) || 
      (order.customerName && order.customerName.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const openPaymentModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setPaymentData({ customerName: '', customerPhone: '', paymentMethod: 'Pago Móvil', referenceNumber: '' });
    setIsModalOpen(true);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    setIsSaving(true);
    try {
      await confirmPayment(selectedOrderId, paymentData);
      setIsModalOpen(false);
    } catch (error) {
      alert("Error al confirmar el pago");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1"><Clock className="w-3 h-3"/> Pendiente</span>;
      case 'pagado': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Pagado</span>;
      case 'cancelado': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1"><Ban className="w-3 h-3"/> Cancelado</span>;
      default: return null;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase">Pedidos y Ventas</h2>
          <p className="text-sm text-slate-500 mt-1 hidden sm:block">Historial de clientes e inventario de {activeStore.name}.</p>
        </div>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div>
          <input type="text" placeholder="Buscar por N° de Pedido o Cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex bg-slate-200/50 p-1 rounded-xl overflow-x-auto">
          {['pendiente', 'pagado', 'cancelado', 'todos'].map((f) => (
            <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-2 rounded-lg text-sm font-bold uppercase whitespace-nowrap transition-colors ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA DE PEDIDOS */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No hay pedidos en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
              
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-slate-900">{order.id}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(order.created_at || '').toLocaleString()}</p>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="p-4 flex-1 space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-50">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-slate-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{item.productName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-black">x{item.quantity}</span>
                        {item.color && <span className="text-[10px] text-slate-500 uppercase">Color: {item.color}</span>}
                      </div>
                    </div>
                    <span className="font-black text-slate-900 text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {order.status === 'pagado' && (
                <div className="p-4 bg-blue-50/50 border-t border-blue-100 grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-[10px] font-black text-slate-500 uppercase mb-0.5">Cliente</p><p className="font-bold text-slate-900">{order.customerName}</p></div>
                  <div><p className="text-[10px] font-black text-slate-500 uppercase mb-0.5">Teléfono</p><p className="font-bold text-slate-900">{order.customerPhone || 'N/A'}</p></div>
                  <div><p className="text-[10px] font-black text-slate-500 uppercase mb-0.5">Método</p><p className="font-bold text-slate-900">{order.paymentMethod}</p></div>
                  <div><p className="text-[10px] font-black text-slate-500 uppercase mb-0.5">Referencia</p><p className="font-bold text-slate-900">{order.referenceNumber || 'N/A'}</p></div>
                </div>
              )}

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase">Total del Pedido</p>
                  <p className="text-2xl font-black text-slate-900">${order.totalAmount.toFixed(2)}</p>
                </div>
                
                {order.status === 'pendiente' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => { if(confirm('¿Cancelar este pedido? No se descontará inventario.')) cancelOrder(order.id); }} className="px-3 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">Cancelar</button>
                    <button onClick={() => openPaymentModal(order.id)} className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-sm flex items-center gap-2"><DollarSign className="w-4 h-4" /> Cobrar</button>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL PARA CONFIRMAR PAGO Y CLIENTE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleConfirmPayment} className="bg-white rounded-[2rem] w-full max-w-md shadow-xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-green-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-200 text-green-700 rounded-full flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Confirmar Pago</h3>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                Al confirmar este pago, <b>el inventario se descontará automáticamente</b> y el pedido pasará al historial de ventas.
              </p>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-1"><User className="w-3.5 h-3.5" /> Nombre del Cliente</label>
                <input required type="text" value={paymentData.customerName} onChange={(e) => setPaymentData({...paymentData, customerName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" placeholder="Ej. Emilio Frey" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-1"><Phone className="w-3.5 h-3.5" /> Teléfono (Opcional)</label>
                <input type="text" value={paymentData.customerPhone} onChange={(e) => setPaymentData({...paymentData, customerPhone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" placeholder="Ej. 0412-1234567" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-1"><CreditCard className="w-3.5 h-3.5" /> Método</label>
                  <select value={paymentData.paymentMethod} onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 appearance-none">
                    <option>Pago Móvil</option>
                    <option>Transferencia</option>
                    <option>Zelle</option>
                    <option>Binance</option>
                    <option>Efectivo</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-1"><FileText className="w-3.5 h-3.5" /> Referencia</label>
                  <input required={paymentData.paymentMethod !== 'Efectivo'} type="text" value={paymentData.referenceNumber} onChange={(e) => setPaymentData({...paymentData, referenceNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" placeholder="Últimos 4 dígitos..." />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200">Cancelar</button>
              <button type="submit" disabled={isSaving} className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 shadow-sm flex items-center gap-2">
                {isSaving ? 'Guardando...' : 'Confirmar y Descontar Stock'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
