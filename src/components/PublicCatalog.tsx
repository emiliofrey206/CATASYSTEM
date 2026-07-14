import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ShoppingBag, X, Image as ImageIcon, Menu, ShoppingCart, Plus, Minus, Trash2, MessageCircle } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product, Category, Store } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PublicCatalogProps {
  store: Store;
  products: Product[];
  categories: Category[];
}

interface CartItem {
  id: string;
  product: Product;
  color: string | null;
  quantity: number;
}

export function PublicCatalog({ store, products, categories }: PublicCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Inicio');
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isSearchMobileOpen, setIsSearchMobileOpen] = useState(false);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const uiState = useRef({ category: selectedCategory, menu: isMobileFiltersOpen, search: isSearchMobileOpen, cart: isCartOpen });

  useEffect(() => {
    uiState.current = { category: selectedCategory, menu: isMobileFiltersOpen, search: isSearchMobileOpen, cart: isCartOpen };
  }, [selectedCategory, isMobileFiltersOpen, isSearchMobileOpen, isCartOpen]);

  useEffect(() => {
    window.history.pushState({ view: 'home' }, '');
    const handleBack = () => {
      if (document.body.dataset.galleryOpen === 'true') { window.history.pushState({ view: 'catalog' }, ''); return; }
      
      const { category, menu, search, cart: cartOpen } = uiState.current;

      if (cartOpen) { setIsCartOpen(false); window.history.pushState({ view: 'catalog' }, ''); return; }
      if (menu) { setIsMobileFiltersOpen(false); window.history.pushState({ view: 'catalog' }, ''); return; }
      if (search) { setIsSearchMobileOpen(false); window.history.pushState({ view: 'catalog' }, ''); return; }
      if (category !== 'Inicio') { setSelectedCategory('Inicio'); window.history.pushState({ view: 'home' }, ''); return; }

      if (window.confirm('¿Seguro que deseas salir del catálogo?')) {
        window.history.back();
      } else {
        window.history.pushState({ view: 'home' }, '');
      }
    };
    window.addEventListener('popstate', handleBack);
    return () => window.removeEventListener('popstate', handleBack);
  }, []);

  const handleSelectCategory = (catName: string) => {
    if (catName !== selectedCategory) window.history.pushState({ view: 'category' }, '');
    setSelectedCategory(catName);
    setSearchQuery('');
    setIsMobileFiltersOpen(false);
    setIsSearchMobileOpen(false);
  };

  // --- LÓGICA DEL CARRITO ---
  const handleAddToCart = (product: Product, color: string | null) => {
    setCart(prevCart => {
      const cartItemId = `${product.id}-${color || 'default'}`;
      const existingItem = prevCart.find(item => item.id === cartItemId);
      if (existingItem) {
        return prevCart.map(item => item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prevCart, { id: cartItemId, product, color, quantity: 1 }];
    });
    setIsCartOpen(true); 
    if (!isCartOpen) window.history.pushState({ view: 'cart' }, '');
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeCartItem = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  // NUEVO: Función maestra para limpiar por completo el carrito
  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar por completo tu lista de compras?')) {
      setCart([]);
      setIsCartOpen(false); // Cierra el menú lateral automáticamente al vaciar
    }
  };

  const cartTotal = cart.reduce((acc, item) => {
    const price = item.product.isOffer && item.product.offerPrice ? item.product.offerPrice : item.product.price;
    return acc + (price * item.quantity);
  }, 0);

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckoutWhatsApp = () => {
    // RECUERDA COLOCAR TU NÚMERO DE TELÉFONO REAL AQUÍ
    const WHATSAPP_NUMBER = "584120000000"; 
    
    let text = `🛍️ *NUEVO PEDIDO - ${store.name}*\n\n`;
    text += `¡Hola! Me gustaría confirmar este pedido:\n\n`;
    
    cart.forEach(item => {
      const price = item.product.isOffer && item.product.offerPrice ? item.product.offerPrice : item.product.price;
      const subtotal = price * item.quantity;
      const colorText = item.color ? ` (Color: ${item.color})` : '';
      text += `▪ ${item.quantity}x ${item.product.name}${colorText} - $${subtotal.toFixed(2)}\n`;
    });
    
    text += `\n*💰 Total a pagar: $${cartTotal.toFixed(2)}*\n\n`;
    text += `¿Tienen disponibilidad y cuáles son los métodos de pago?`;
    
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`, '_blank');
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || selectedCategory === 'Inicio' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const isHomeView = selectedCategory === 'Inicio' && searchQuery === '';

  const CategoryNavigation = () => (
    <nav className="space-y-1.5">
      <button onClick={() => handleSelectCategory('Inicio')} className={`w-full text-left p-3 rounded-xl text-sm font-semibold transition-colors ${selectedCategory === 'Inicio' ? 'bg-black text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Inicio (Categorías)</button>
      <button onClick={() => handleSelectCategory('Todos')} className={`w-full text-left p-3 rounded-xl text-sm font-semibold transition-colors ${selectedCategory === 'Todos' ? 'bg-black text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Todos los productos</button>
      <div className="pt-2 pb-1"><p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3">Explorar</p></div>
      {categories.map((cat) => (
        <button key={cat.id} onClick={() => handleSelectCategory(cat.name)} className={`w-full text-left p-3 rounded-xl text-sm font-semibold transition-colors ${selectedCategory === cat.name ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' : 'text-slate-700 hover:bg-slate-50'}`}>{cat.name}</button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200 relative pb-24 lg:pb-0">
      
      {/* HEADER MÓVIL */}
      <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 sticky top-0 z-40">
        <button onClick={() => { setIsMobileFiltersOpen(true); window.history.pushState({ view: 'menu' }, ''); }} className="p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => handleSelectCategory('Inicio')}>
          {store.logoUrl ? <img src={store.logoUrl} alt={store.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-sm" /> : <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm"><ShoppingBag className="h-4 w-4 text-white" /></div>}
          <h1 className="text-base font-black tracking-tight uppercase text-slate-900 truncate max-w-[120px] sm:max-w-[200px]">{store.name}</h1>
        </div>
        <button onClick={() => { if (!isSearchMobileOpen) window.history.pushState({ view: 'search' }, ''); setIsSearchMobileOpen(!isSearchMobileOpen); if (!isSearchMobileOpen) setTimeout(() => document.getElementById('mobile-search')?.focus(), 100); }} className={`p-2 -mr-2 rounded-full transition-colors ${isSearchMobileOpen ? 'bg-slate-100 text-black' : 'text-slate-700 hover:bg-slate-100'}`}>
          {isSearchMobileOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
        </button>
      </header>

      <AnimatePresence>
        {isSearchMobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 sticky top-16 z-30 overflow-hidden shadow-sm">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div>
              <input id="mobile-search" type="text" placeholder="Buscar productos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER ESCRITORIO */}
      <header className="hidden lg:flex items-center justify-between h-24 px-8 max-w-7xl mx-auto mb-4 shrink-0">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleSelectCategory('Inicio')}>
          {store.logoUrl ? <img src={store.logoUrl} alt={store.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm bg-white" /> : <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-sm"><ShoppingBag className="h-7 w-7 text-white" /></div>}
          <h1 className="text-4xl font-black tracking-tight uppercase text-slate-900 truncate max-w-md">{store.name}</h1>
        </div>
        <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div>
            <input type="text" placeholder="Buscar productos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 h-full">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          
          <aside className="lg:w-72 flex-shrink-0 hidden lg:block">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col gap-6 sticky top-6 shadow-sm"><CategoryNavigation /></div>
          </aside>

          <section className="flex-1">
            {isHomeView ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
                <div className="hidden lg:flex items-center justify-between px-2">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">¿Qué estás buscando?</h2>
                    <p className="text-slate-500 text-sm mt-1">Explora nuestras categorías</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => handleSelectCategory(cat.name)} className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden group shadow-sm border border-slate-100 block w-full bg-white transition-transform active:scale-95">
                      {cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-300" /></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-5 text-left">
                        <h3 className="text-white font-bold text-sm sm:text-lg leading-tight drop-shadow-md">{cat.name}</h3>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => handleSelectCategory('Todos')} className="w-full mt-2 bg-slate-200 text-slate-800 px-5 py-4 rounded-2xl text-sm sm:text-base font-bold hover:bg-slate-300 transition-colors">
                  Mostrar todos los productos
                </button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between px-1 sm:px-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{searchQuery ? 'Resultados' : (selectedCategory === 'Todos' ? 'Todos' : selectedCategory)}</h2>
                    {searchQuery && <p className="text-sm text-slate-500 mt-1">Buscando: "{searchQuery}"</p>}
                  </div>
                </div>
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    <AnimatePresence mode="popLayout">
                      {filteredProducts.map((product) => (
                        <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                          <ProductCard product={product} onAddToCart={handleAddToCart} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4"><Search className="h-8 w-8" /></div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No se encontraron productos</h3>
                    <button onClick={() => handleSelectCategory('Inicio')} className="mt-6 bg-black text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-slate-800 transition-colors">Volver al inicio</button>
                  </div>
                )}
              </motion.div>
            )}
          </section>
        </div>
      </main>

      {/* BOTÓN FLOTANTE DEL CARRITO */}
      <AnimatePresence>
        {cartItemCount > 0 && !isCartOpen && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={() => { setIsCartOpen(true); window.history.pushState({ view: 'cart' }, ''); }}
            className="fixed bottom-6 right-6 z-40 flex items-center justify-center gap-3 rounded-full bg-green-600 text-white pl-4 pr-5 py-3.5 shadow-2xl shadow-green-600/30 hover:bg-green-700 transition-transform active:scale-95 font-bold"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartItemCount}</span>
            </div>
            <span>${cartTotal.toFixed(2)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* MENÚ MÓVIL CATEGORÍAS */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsMobileFiltersOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-white z-50 flex flex-col shadow-2xl lg:hidden">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
                <h3 className="text-lg font-black text-slate-900 uppercase">Menú</h3>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-slate-50 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <div className="overflow-y-auto p-4 flex-1"><CategoryNavigation /></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DRAWER DEL CARRITO DE COMPRAS */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50" onClick={() => setIsCartOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
              
              {/* CABECERA MODIFICADA CON EL BOTÓN DE LIMPIAR/VACIAR */}
              <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><ShoppingCart className="w-5 h-5" /></div>
                  <h3 className="text-xl font-black text-slate-900">Tu Pedido</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <button 
                      onClick={handleClearCart} 
                      className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors mr-1 shadow-sm border border-red-100/50"
                      title="Vaciar todo el carrito"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Limpiar
                    </button>
                  )}
                  <button onClick={() => setIsCartOpen(false)} className="p-2 bg-white rounded-full border border-slate-200 shadow-sm"><X className="w-5 h-5" /></button>
                </div>
              </div>
              
              <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-4 bg-slate-50/50">
                {cart.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Tu carrito está vacío</p>
                  </div>
                ) : (
                  cart.map(item => {
                    const price = item.product.isOffer && item.product.offerPrice ? item.product.offerPrice : item.product.price;
                    
                    let cartItemImage = item.product.imageUrl;
                    if (item.color && item.product.variants) {
                      const variantInfo = item.product.variants.find(v => v.color === item.color);
                      if (variantInfo && variantInfo.imageUrl) {
                        cartItemImage = variantInfo.imageUrl;
                      }
                    }
                    if (!cartItemImage && item.product.variants && item.product.variants.length > 0) {
                      cartItemImage = item.product.variants[0].imageUrl;
                    }

                    return (
                      <div key={item.id} className="bg-white p-3 rounded-2xl border border-slate-200 flex gap-4 items-center shadow-sm relative">
                        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                          {cartItemImage ? <img src={cartItemImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 m-5 text-slate-300" />}
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{item.product.name}</h4>
                          {item.color && <p className="text-xs text-slate-500 mt-0.5">Color: {item.color}</p>}
                          <p className="text-sm font-black text-slate-900 mt-1">${price.toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <button onClick={() => removeCartItem(item.id)} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-200 mt-4">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-700 font-bold"><Minus className="w-3 h-3" /></button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-700 font-bold"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 font-semibold">Total a pagar</span>
                    <span className="text-2xl font-black text-slate-900">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button onClick={handleCheckoutWhatsApp} className="w-full bg-green-600 text-white px-5 py-4 rounded-2xl text-base font-black flex items-center justify-center gap-3 hover:bg-green-700 transition-colors active:scale-95 shadow-lg shadow-green-600/30">
                    <MessageCircle className="w-6 h-6" /> Enviar Pedido por WhatsApp
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
