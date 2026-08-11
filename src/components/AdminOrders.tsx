import { useState } from 'react';
import { CheckCircle2, Clock, X, DollarSign, User, Phone, CreditCard, FileText, Image as ImageIcon, Ban, Search, Receipt, Plus, Minus, Trash2 } from 'lucide-react';
import { Order, Store, Product } from '../types';

interface AdminOrdersProps {
  activeStore: Store;
  orders: Order[];
  products: Product[]; // <-- Recibimos los productos para el pedido manual
  addOrder: (orderData: Omit<Order, 'id' | 'status' | 'created_at'>) => Promise<Order>; // <-- Función para crear pedido
  confirmPayment: (orderId: string, data: { customerName: string, customerPhone: string, paymentMethod: string, referenceNumber: string }) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
}

export function AdminOrders({ activeStore, orders, products, addOrder, confirmPayment, cancelOrder }: AdminOrdersProps) {
  const [filter, setFilter] = useState<'todos' | 'pendiente' | 'pagado' | 'cancelado'>('pendiente');
  const [search, setSearch] = useState('');
  
  // --- Estados para el Modal de Cobro (Pagado) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState({ customerName: '', customerPhone: '', paymentMethod: 'Pago Móvil', referenceNumber: '' });
  const [isSaving, setIsSaving] = useState(false);

  // --- Estados para el Modal de NUEVO PEDIDO MANUAL ---
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [manualCart, setManualCart] = useState<{product: Product, color: string|null, qty: number, imageUrl?: string}[]>([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchFilter = filter === 'todos' || order.status === filter;
    const matchSearch = search === '' || 
      order.id.toLowerCase().includes(search.toLowerCase()) || 
      (order.customerName && order.customerName.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  // --- FUNCIONES DEL MODAL DE COBRO ---
  const openPaymentModal = (order: Order) => {
    setSelectedOrderId(order.id);
    // Si el pedido ya tenía un nombre (ej. del catálogo), lo pre-cargamos
    setPaymentData({ customerName: order.customerName || '', customerPhone: order.customerPhone || '', paymentMethod: 'Pago Móvil', referenceNumber: '' });
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

  // --- FUNCIONES DEL MODAL MANUAL ---
  const activeManualProduct = products.find(p => p.id === selectedProductId);

  const handleAddManualItem = () => {
    if (!activeManualProduct) return;
    
    // Validar si tiene colores y no escogió uno
    if (activeManualProduct.variants && activeManualProduct.variants.length > 0 && !selectedColor) {
      alert("⚠️ Por favor, selecciona un color para este producto.");
      return;
    }

    // Buscar la foto correcta
    let itemImage = activeManualProduct.imageUrl;
    if (selectedColor && activeManualProduct.variants) {
      const variantInfo = activeManualProduct.variants.find(v => v.color === selectedColor);
      if (variantInfo && variantInfo.imageUrl) itemImage = variantInfo.imageUrl;
    }

    setManualCart(prev => {
      const existing = prev.find(i => i.product.id === activeManualProduct.id && i.color === (selectedColor || null));
      if (existing) return prev.map(i => i === existing ? {...i, qty: i.qty + 1} : i);
      return [...prev, { product: activeManualProduct, color: selectedColor || null, qty: 1, imageUrl: itemImage }];
    });

    setSelectedProductId('');
    setSelectedColor('');
  };

  const updateManualQty = (index: number, delta: number) => {
    setManualCart(prev => prev.map((item, i) => {
      if (i === index) { const newQ = item.qty + delta; return newQ > 0 ? { ...item, qty: newQ } : item; }
      return item;
    }));
  };

  const removeManualItem = (index: number) => {
    setManualCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCart.length === 0) { alert("⚠️ Añade al menos un producto al pedido."); return; }
    setIsCreatingOrder(true);

    try {
      const orderItems = manualCart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        color: item.color,
        quantity: item.qty,
        price: item.product.isOffer && item.product.offerPrice ? item.product.offerPrice : item.product.price,
        imageUrl: item.imageUrl
      }));

      const totalAmount = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

      await addOrder({
        storeId: activeStore.id,
        customerName: manualName,
        customerPhone: manualPhone,
        totalAmount,
        items: orderItems
      });

      setIsManualModalOpen(false);
      setManualCart([]);
      setManualName('');
      setManualPhone('');
    } catch (error) {
      alert("Error al crear el pedido manual.");
    } finally {
      setIsCreatingOrder(false);
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
        {/* NUEVO BOTÓN PARA PEDIDOS MANUALES */}
        <button onClick={() => setIsManualModalOpen(true)} className="w-full sm:w-auto bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Nuevo Pedido Manual
        </button>
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
              
              {/* CABECERA DEL PEDIDO CON EL NOMBRE DEL CLIENTE */}
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-slate-900">{order.id}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  {/* AQUÍ ESTÁ LA MEJORA: El nombre siempre visible */}
                  {order.customerName && (
                    <p className="text-sm font-bold text-blue-700 flex items-center gap-1 mt-1">
                      <User className="w-3.5 h-3.5"/> {order.customerName}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{new Date(order.created_at || '').toLocaleString()}</p>
                </div>
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
                  <div><p className="text-[10px] font-black text-slate-500 uppercase mb-0.5">Teléfono</p><p className="font-bold text-slate-900">{order.customerPhone || 'N/A'}</p></div>
                  <div><p className="text-[10px] font-black text-slate-500 uppercase mb-0.5">Método</p><p className="font-bold text-slate-900">{order.paymentMethod}</p></div>
                  <div className="col-span-2"><p className="text-[10px] font-black text-slate-500 uppercase mb-0.5">Referencia</p><p className="font-bold text-slate-900">{order.referenceNumber || 'N/A'}</p></div>
                </div>
              )}

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase">Total del Pedido</p>
                  <p className="text-2xl font-black text-slate-900">${order.totalAmount.toFixed(2)}</p>
                </div>
                
                {order.status === 'pendiente' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => { if(confirm('¿Anular este pedido? No se descontará inventario.')) cancelOrder(order.id); }} className="px-3 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">Anular</button>
                    {/* BOTÓN RENOMBRADO A "PAGADO" */}
                    <button onClick={() => openPaymentModal(order)} className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-sm flex items-center gap-2"><DollarSign className="w-4 h-4" /> Pagado</button>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* --- MODAL PARA CONFIRMAR PAGO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleConfirmPayment} className="bg-white rounded-[2rem] w-full max-w-md shadow-xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-green-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-200 text-green-700 rounded-full flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
                <h3 className="text-lg font-black text-slate-900 uppercase">Registrar Pago</h3>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                Al confirmar este pago, <b>el inventario se descontará automáticamente</b> y el pedido pasará al historial de ventas.
              </p>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-1"><User className="w-3.5 h-3.5" /> Nombre del Cliente</label>
                <input required type="text" value={paymentData.customerName} onChange={(e) => setPaymentData({...paymentData, customerName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 font-semibold" placeholder="Ej. Emilio Frey" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-1"><Phone className="w-3.5 h-3.5" /> Teléfono (Opcional)</label>
                <input type="text" value={paymentData.customerPhone} onChange={(e) => setPaymentData({...paymentData, customerPhone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" placeholder="Ej. 0412-1234567" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-1"><CreditCard className="w-3.5 h-3.5" /> Método</label>
                  <select value={paymentData.paymentMethod} onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 appearance-none font-semibold">
                    <option>Pago Móvil</option>
                    <option>Transferencia</option>
                    <option>Zelle</option>
                    <option>Binance</option>
                    <option>Efectivo</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-1"><FileText className="w-3.5 h-3.5" /> Referencia</label>
                  <input required={paymentData.paymentMethod !== 'Efectivo'} type="text" value={paymentData.referenceNumber} onChange={(e) => setPaymentData({...paymentData, referenceNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 font-bold" placeholder="Últimos 4 dígitos..." />
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

      {/* --- MODAL DE NUEVO PEDIDO MANUAL (PUNTO DE VENTA) --- */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleCreateManualOrder} className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5" />
                <h3 className="text-lg font-black uppercase">Crear Pedido Manual</h3>
              </div>
              <button type="button" onClick={() => setIsManualModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-1"><User className="w-3.5 h-3.5" /> Nombre del Cliente</label>
                  <input required type="text" value={manualName} onChange={(e) => setManualName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900" placeholder="Ej. Emilio Frey" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-1"><Phone className="w-3.5 h-3.5" /> Teléfono (Opcional)</label>
                  <input type="text" value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-900" placeholder="Ej. 0412-1234567" />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Añadir Productos al Pedido</h4>
                <div className="flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Producto</label>
                    <select value={selectedProductId} onChange={(e) => { setSelectedProductId(e.target.value); setSelectedColor(''); }} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-slate-900 appearance-none">
                      <option value="">Buscar producto...</option>
                      {products.filter(p => !p.isHidden).map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price.toFixed(2)}</option>)}
                    </select>
                  </div>
                  
                  {activeManualProduct && activeManualProduct.variants && activeManualProduct.variants.length > 0 && (
                    <div className="w-full sm:w-1/3">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Color Variante</label>
                      <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-slate-900 appearance-none">
                        <option value="">Selecciona...</option>
                        {activeManualProduct.variants.map(v => <option key={v.color} value={v.color}>{v.color}</option>)}
                      </select>
                    </div>
                  )}

                  <button type="button" onClick={handleAddManualItem} className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                    Añadir
                  </button>
                </div>
              </div>

              {manualCart.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-2 border-b border-slate-100 pb-2">Lista de Compra</h4>
                  {manualCart.map((item, idx) => {
                    const price = item.product.isOffer && item.product.offerPrice ? item.product.offerPrice : item.product.price;
                    return (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                          {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 m-3 text-slate-300"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{item.product.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase">{item.color ? `Color: ${item.color}` : 'Sin variante'}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg p-0.5 border border-slate-200">
                          <button type="button" onClick={() => updateManualQty(idx, -1)} className="w-7 h-7 bg-white rounded shadow-sm flex items-center justify-center font-bold text-slate-600 hover:text-black"><Minus className="w-3 h-3"/></button>
                          <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                          <button type="button" onClick={() => updateManualQty(idx, 1)} className="w-7 h-7 bg-white rounded shadow-sm flex items-center justify-center font-bold text-slate-600 hover:text-black"><Plus className="w-3 h-3"/></button>
                        </div>
                        <p className="font-black text-sm w-16 text-right">${(price * item.qty).toFixed(2)}</p>
                        <button type="button" onClick={() => removeManualItem(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase">Monto Total</p>
                <p className="text-2xl font-black text-slate-900">
                  ${manualCart.reduce((acc, item) => acc + ((item.product.isOffer && item.product.offerPrice ? item.product.offerPrice : item.product.price) * item.qty), 0).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsManualModalOpen(false)} className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200">Cancelar</button>
                <button type="button" onClick={handleCreateManualOrder} disabled={isCreatingOrder || manualCart.length === 0} className="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 shadow-md">
                  {isCreatingOrder ? 'Creando...' : 'Crear Pedido'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
