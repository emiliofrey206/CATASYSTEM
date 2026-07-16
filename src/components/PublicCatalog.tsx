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
  const headerColor = store.headerColor || '#ffffff';
  const bgColor = store.bgColor || '#f8fafc';
  const cardColor = store.cardColor || '#ffffff';
  const accentColor = store.accentColor || '#16a34a';
  const textColor = store.textColor || '#0f172a';
  
  const checkoutBtnColor = store.checkoutBtnColor || '#16a34a';
  const checkoutBtnTextColor = store.checkoutBtnTextColor || '#ffffff';
  const cartItemBgColor = store.cartItemBgColor || '#ffffff';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Inicio');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isSearchMobileOpen, setIsSearchMobileOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const uiState = useRef({ category: selectedCategory, menu: isMobileFiltersOpen, search: isSearchMobileOpen, cart: isCartOpen });

  useEffect(() => { uiState.current = { category: selectedCategory, menu: isMobileFiltersOpen, search: isSearchMobileOpen, cart: isCartOpen }; }, [selectedCategory, isMobileFiltersOpen, isSearchMobileOpen, isCartOpen]);

  useEffect(() => {
    window.history.pushState({ view: 'home' }, '');
    const handleBack = () => {
      if (document.body.dataset.galleryOpen === 'true') { window.history.pushState({ view: 'catalog' }, ''); return; }
      const { category, menu, search, cart: cartOpen } = uiState.current;
      if (cartOpen) { setIsCartOpen(false); window.history.pushState({ view: 'catalog' }, ''); return; }
      if (menu) { setIsMobileFiltersOpen(false); window.history.pushState({ view: 'catalog' }, ''); return; }
      if (search) { setIsSearchMobileOpen(false); window.history.pushState({ view: 'catalog' }, ''); return; }
      if (category !== 'Inicio') { setSelectedCategory('Inicio'); window.history.pushState({ view: 'home' }, ''); return; }
      if (window.confirm('¿Seguro que deseas salir del catálogo?')) window.history.back();
      else window.history.pushState({ view: 'home' }, '');
    };
    window.addEventListener('popstate', handleBack);
    return () => window.removeEventListener('popstate', handleBack);
  }, []);

  const handleSelectCategory = (catName: string) => {
    if (catName !== selectedCategory) window.history.pushState({ view: 'category' }, '');
    setSelectedCategory(catName); setSearchQuery(''); setIsMobileFiltersOpen(false); setIsSearchMobileOpen(false);
  };

  const handleAddToCart = (product: Product, color: string | null) => {
    setCart(prevCart => {
      const cartItemId = `${product.id}-${color || 'default'}`;
      const existingItem = prevCart.find(item => item.id === cartItemId);
      if (existingItem) return prevCart.map(item => item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prevCart, { id: cartItemId, product, color, quantity: 1 }];
    });
    setIsCartOpen(true); 
    if (!isCartOpen) window.history.pushState({ view: 'cart' }, '');
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) { const newQ = item.quantity + delta; return newQ > 0 ? { ...item, quantity: newQ } : item; }
      return item;
    }));
  };

  const removeCartItem = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  const handleClearCart = () => { if (window.confirm('¿Estás seguro de que deseas vaciar por completo tu lista de compras?')) { setCart([]); setIsCartOpen(false); } };

  const cartTotal = cart.reduce((acc, item) => {
    const price = item.product.isOffer && item.product.offerPrice ? item.product.offerPrice : item.product.price;
    return acc + (price * item.quantity);
  }, 0);

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckoutWhatsApp = () => {
    const WHATSAPP_NUMBER = "584120000000"; 
    let text = `🛍️ *NUEVO PEDIDO - ${store.name}*\n\n¡Hola! Me gustaría confirmar este pedido:\n\n`;
    cart.forEach(item => {
      const price = item.product.isOffer && item.product.offerPrice ? item.product.offerPrice : item.product.price;
      const colorText = item.color ? ` (Color: ${item.color})` : '';
      text += `▪ ${item.quantity}x ${item.product.name}${colorText} - $${(price * item.quantity).toFixed(2)}\n`;
    });
    text += `\n*💰 Total a pagar: $${cartTotal.toFixed(2)}*\n\n¿Tienen disponibilidad y cuáles son los métodos de pago?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
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
      <button onClick={() => handleSelectCategory('Inicio')} className="w-full text-left p-3 rounded-xl text-sm font-semibold transition-colors" style={{ backgroundColor: selectedCategory === 'Inicio' ? accentColor : 'transparent', color: selectedCategory === 'Inicio' ? '#fff' : textColor }}>Inicio (Categorías)</button>
      <button onClick={() => handleSelectCategory('Todos')} className="w-full text-left p-3 rounded-xl text-sm font-semibold transition-colors" style={{ backgroundColor: selectedCategory === 'Todos' ? accentColor : 'transparent', color: selectedCategory === 'Todos' ? '#fff' : textColor }}>Todos los productos</button>
      <div className="pt-2 pb-1"><p className="text-[10px] uppercase font-bold tracking-widest opacity-50 px-3" style={{ color: textColor }}>Explorar</p></div>
      {categories.map((cat) => (
        <button key={cat.id} onClick={() => handleSelectCategory(cat.name)} className="w-full text-left p-3 rounded-xl text-sm font-semibold transition-colors border border-transparent" style={{ backgroundColor: selectedCategory === cat.name ? `${accentColor}20` : 'transparent', color: selectedCategory === cat.name ? accentColor : textColor, borderColor: selectedCategory === cat.name ? accentColor : 'transparent' }}>{cat.name}</button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen font-sans selection:bg-black/10 relative pb-24 lg:pb-0 transition-colors duration-500" style={{ backgroundColor: bgColor, color: textColor }}>
      
      {/* HEADER MÓVIL */}
      <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-black/5 sticky top-0 z-40 shadow-sm transition-colors duration-500" style={{ backgroundColor: headerColor }}>
        <button onClick={() => { setIsMobileFiltersOpen(true); window.history.pushState({ view: 'menu' }, ''); }} className="p-2 -ml-2 rounded-full transition-colors opacity-80" style={{ color: textColor }}><Menu className="w-6 h-6" /></button>
        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => handleSelectCategory('Inicio')}>
          {store.logoUrl ? <img src={store.logoUrl} alt={store.name} className="w-8 h-8 rounded-lg object-cover shadow-sm" /> : <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: accentColor }}><ShoppingBag className="h-4 w-4 text-white" /></div>}
          <h1 className="text-base font-black tracking-tight uppercase truncate max-w-[120px] sm:max-w-[200px]" style={{ color: textColor }}>{store.name}</h1>
        </div>
        <button onClick={() => { if (!isSearchMobileOpen) window.history.pushState({ view: 'search' }, ''); setIsSearchMobileOpen(!isSearchMobileOpen); if (!isSearchMobileOpen) setTimeout(() => document.getElementById('mobile-search')?.focus(), 100); }} className="p-2 -mr-2 rounded-full transition-colors opacity-80" style={{ color: textColor }}>
          {isSearchMobileOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
        </button>
      </header>

      {/* BUSCADOR DESPLEGABLE MÓVIL */}
      <AnimatePresence>
        {isSearchMobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden px-4 py-3 sticky top-16 z-30 overflow-hidden shadow-sm" style={{ backgroundColor: cardColor }}>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Search className="h-4 w-4 opacity-50" style={{ color: textColor }} /></div>
              <input id="mobile-search" type="text" placeholder="Buscar productos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none border border-black/10" style={{ backgroundColor: bgColor, color: textColor }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER ESCRITORIO */}
      <header className="hidden lg:flex items-center justify-between h-24 px-8 max-w-7xl mx-auto mb-4 shrink-0 rounded-b-3xl shadow-sm transition-colors duration-500" style={{ backgroundColor: headerColor }}>
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleSelectCategory('Inicio')}>
          {store.logoUrl ? <img src={store.logoUrl} alt={store.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm" /> : <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: accentColor }}><ShoppingBag className="h-7 w-7 text-white" /></div>}
          <h1 className="text-4xl font-black tracking-tight uppercase truncate max-w-md" style={{ color: textColor }}>{store.name}</h1>
        </div>
        <div className="flex items-center gap-4 flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Search className="h-4 w-4 opacity-50" style={{ color: textColor }} /></div>
            <input type="text" placeholder="Buscar productos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none border border-black/10 shadow-sm" style={{ backgroundColor: bgColor, color: textColor }} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 h-full">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          
          <aside className="lg:w-72 flex-shrink-0 hidden lg:block">
            <div className="rounded-3xl p-5 flex flex-col gap-6 sticky top-6 shadow-sm border border-black/5 transition-colors duration-500" style={{ backgroundColor: cardColor }}><CategoryNavigation /></div>
          </aside>

          <section className="flex-1">
            {isHomeView ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
                
                {/* TÍTULO CON BARRA DE FONDO PARA EL SUBTÍTULO (VISTA INICIO) */}
                <div className="hidden lg:flex items-center justify-between px-2 mb-4">
                  <div className="flex flex-col items-start gap-2.5">
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight" style={{ color: textColor }}>¿Qué estás buscando?</h2>
                    
                    {/* Esta es la barra que envuelve al texto y usa el color del Banner (headerColor) */}
                    <div className="px-4 py-1.5 rounded-xl shadow-sm border border-black/5" style={{ backgroundColor: headerColor }}>
                      <p className="text-sm font-bold" style={{ color: textColor }}>Explora nuestras categorías</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => handleSelectCategory(cat.name)} className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden group shadow-sm border border-black/5 block w-full transition-transform active:scale-95" style={{ backgroundColor: cardColor }}>
                      {cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><ImageIcon className="w-8 h-8" style={{ color: textColor }} /></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 sm:p-5 text-left"><h3 className="text-white font-bold text-sm sm:text-lg leading-tight drop-shadow-md">{cat.name}</h3></div>
                    </button>
                  ))}
                </div>
                <button onClick={() => handleSelectCategory('Todos')} className="w-full mt-2 px-5 py-4 rounded-2xl text-sm sm:text-base font-bold transition-colors shadow-sm" style={{ backgroundColor: cardColor, color: textColor }}>Mostrar todos los productos</button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-6">
                
                {/* TÍTULO CON BARRA DE FONDO PARA EL SUBTÍTULO (VISTA CATEGORÍAS/TODOS) */}
                <div className="flex items-center justify-between px-1 sm:px-2 mb-5">
                  <div className="flex flex-col items-start gap-2.5">
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight" style={{ color: textColor }}>
                      {searchQuery ? 'Resultados' : (selectedCategory === 'Todos' ? 'Todos los productos' : selectedCategory)}
                    </h2>
                    
                    {/* Barra de fondo usando el color del Header */}
                    <div className="px-4 py-1.5 rounded-xl shadow-sm border border-black/5" style={{ backgroundColor: headerColor }}>
                      <p className="text-sm font-bold" style={{ color: textColor }}>
                        {searchQuery ? `Buscando: "${searchQuery}"` : 'Explorando catálogo'}
                      </p>
                    </div>
                  </div>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    <AnimatePresence mode="popLayout">
                      {filteredProducts.map((product) => (
                        <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                          <ProductCard product={product} store={store} onAddToCart={handleAddToCart} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center rounded-[2rem] shadow-sm border border-black/5" style={{ backgroundColor: cardColor }}>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4 opacity-20" style={{ backgroundColor: textColor }}><Search className="h-8 w-8" style={{ color: bgColor }} /></div>
                    <h3 className="text-lg font-bold mb-1" style={{ color: textColor }}>No se encontraron productos</h3>
                    <button onClick={() => handleSelectCategory('Inicio')} className="mt-6 text-white px-6 py-3 rounded-2xl text-sm font-semibold transition-colors shadow-md" style={{ backgroundColor: checkoutBtnColor, color: checkoutBtnTextColor }}>Volver al inicio</button>
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
            className="fixed bottom-6 right-6 z-40 flex items-center justify-center gap-3 rounded-full pl-4 pr-5 py-3.5 shadow-2xl transition-transform active:scale-95 font-bold"
            style={{ backgroundColor: checkoutBtnColor, color: checkoutBtnTextColor }}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartItemCount}</span>
            </div>
            <span>${cartTotal.toFixed(2)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsMobileFiltersOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="fixed inset-y-0 left-0 w-[80%] max-w-sm z-50 flex flex-col shadow-2xl lg:hidden" style={{ backgroundColor: cardColor }}>
              <div className="flex justify-between items-center p-6 border-b border-black/5 shrink-0">
                <h3 className="text-lg font-black uppercase" style={{ color: textColor }}>Menú</h3>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 rounded-full opacity-70" style={{ backgroundColor: bgColor, color: textColor }}><X className="w-5 h-5" /></button>
              </div>
              <div className="overflow-y-auto p-4 flex-1"><CategoryNavigation /></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setIsCartOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="fixed inset-y-0 right-0 w-full max-w-md z-50 flex flex-col shadow-2xl" style={{ backgroundColor: cardColor }}>
              
              <div className="flex justify-between items-center p-6 border-b border-black/5 shrink-0" style={{ backgroundColor: headerColor }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: accentColor }}><ShoppingCart className="w-5 h-5" /></div>
                  <h3 className="text-xl font-black" style={{ color: textColor }}>Tu Pedido</h3>
                </div>
                <div className="flex items-center gap-2">
                  {cart.length > 0 && <button onClick={handleClearCart} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-2.5 py-1.5 rounded-lg mr-1 shadow-sm border border-red-100"><Trash2 className="w-3.5 h-3.5" /> Limpiar</button>}
                  <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-full border border-black/10 shadow-sm opacity-70" style={{ backgroundColor: cardColor, color: textColor }}><X className="w-5 h-5" /></button>
                </div>
              </div>
              
              <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20 opacity-50" style={{ color: textColor }}><ShoppingCart className="w-12 h-12 mx-auto mb-4" /><p>Tu carrito está vacío</p></div>
                ) : (
                  cart.map(item => {
                    const price = item.product.isOffer && item.product.offerPrice ? item.product.offerPrice : item.product.price;
                    let cartItemImage = item.product.imageUrl;
                    if (item.color && item.product.variants) { const variantInfo = item.product.variants.find(v => v.color === item.color); if (variantInfo && variantInfo.imageUrl) cartItemImage = variantInfo.imageUrl; }
                    if (!cartItemImage && item.product.variants && item.product.variants.length > 0) cartItemImage = item.product.variants[0].imageUrl;
                    return (
                      <div key={item.id} className="p-3 rounded-2xl border border-black/5 flex gap-4 items-center shadow-sm relative" style={{ backgroundColor: cartItemBgColor }}>
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-black/5" style={{ backgroundColor: cardColor }}>
                          {cartItemImage ? <img src={cartItemImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 m-5 opacity-30" style={{ color: textColor }} />}
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <h4 className="text-sm font-bold truncate" style={{ color: textColor }}>{item.product.name}</h4>
                          {item.color && <p className="text-xs mt-0.5 opacity-70" style={{ color: textColor }}>Color: {item.color}</p>}
                          <p className="text-sm font-black mt-1" style={{ color: textColor }}>${price.toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <button onClick={() => removeCartItem(item.id)} className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          <div className="flex items-center gap-3 rounded-lg p-1 border border-black/10 mt-4" style={{ backgroundColor: cardColor }}>
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded shadow-sm font-bold opacity-80" style={{ backgroundColor: bgColor, color: textColor }}><Minus className="w-3 h-3" /></button>
                            <span className="text-sm font-bold w-4 text-center" style={{ color: textColor }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded shadow-sm font-bold opacity-80" style={{ backgroundColor: bgColor, color: textColor }}><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-black/5 shrink-0" style={{ backgroundColor: cardColor }}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold opacity-70" style={{ color: textColor }}>Total a pagar</span>
                    <span className="text-2xl font-black" style={{ color: textColor }}>${cartTotal.toFixed(2)}</span>
                  </div>
                  <button onClick={handleCheckoutWhatsApp} className="w-full px-5 py-4 rounded-2xl text-base font-black flex items-center justify-center gap-3 active:scale-95 shadow-lg" style={{ backgroundColor: checkoutBtnColor, color: checkoutBtnTextColor }}>
                    <MessageCircle className="w-6 h-6" /> Enviar Pedido
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
