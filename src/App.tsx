import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ExternalLink, LayoutDashboard, LayoutList, LogOut, 
  Store as StoreIcon, Palette, Paintbrush, Receipt, Menu, X, 
  Moon, Sun, Sparkles, ArrowUpRight
} from 'lucide-react';
import { useCatalog } from './store';
import { PublicCatalog } from './components/PublicCatalog';
import { AdminProducts } from './components/AdminProducts';
import { AdminCategories } from './components/AdminCategories';
import { AdminStores } from './components/AdminStores';
import { AdminColors } from './components/AdminColors';
import { AdminAppearance } from './components/AdminAppearance'; 
import { AdminOrders } from './components/AdminOrders';
import { Login } from './components/Login';
import { motion, AnimatePresence } from 'motion/react';

function AdminLayout() {
  const [currentView, setCurrentView] = useState<'admin-products' | 'admin-categories' | 'admin-stores' | 'admin-colors' | 'admin-appearance' | 'admin-orders'>('admin-orders');
  const [isMobileAdminMenuOpen, setIsMobileAdminMenuOpen] = useState(false);
  
  // INICIO EN BLANCO (MODO CLARO POR DEFECTO)
  const [isDarkMode, setIsDarkMode] = useState(false);

  const catalog = useCatalog();

  // Control estricto de la clase 'dark' y el color-scheme del navegador
  useEffect(() => {
    const htmlEl = document.documentElement;
    if (isDarkMode) {
      htmlEl.classList.add('dark');
      htmlEl.style.colorScheme = 'dark';
    } else {
      htmlEl.classList.remove('dark');
      htmlEl.style.colorScheme = 'light';
    }
  }, [isDarkMode]);
  
  if (!catalog.isLoaded) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#080A0F] text-slate-900 dark:text-white flex flex-col items-center justify-center gap-3 font-sans">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Iniciando CataSystem...</p>
      </div>
    );
  }

  if (!catalog.isAuthenticated) return <Login />;

  const activeStore = catalog.stores.find(s => s.id === catalog.activeStoreId) || catalog.stores[0];
  const publicUrl = `/catalogo/${activeStore?.slug || 'tienda'}`;
  const accentColor = activeStore?.accentColor || '#16a34a';
  
  const activeStoreProducts = catalog.products.filter(p => p.storeId === activeStore?.id);
  const activeStoreCategories = catalog.categories.filter(c => c.storeId === activeStore?.id);
  const activeStoreColors = catalog.colors.filter(c => c.storeId === activeStore?.id);
  const activeStoreOrders = catalog.orders.filter(o => o.storeId === activeStore?.id);

  const navItems = [
    { id: 'admin-orders', label: 'Pedidos y Ventas', icon: Receipt },
    { id: 'admin-stores', label: 'Mis Tiendas', icon: StoreIcon },
    { id: 'admin-products', label: 'Productos', icon: LayoutDashboard },
    { id: 'admin-categories', label: 'Categorías', icon: LayoutList },
    { id: 'admin-colors', label: 'Muestrario Colores', icon: Palette },
    { id: 'admin-appearance', label: 'Apariencia Visual', icon: Paintbrush },
  ];

  const handleLogout = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsMobileAdminMenuOpen(false);
    catalog.logout();
  };

  return (
    // USAMOS 100dvh PARA EVITAR QUE LOS NAVEGADORES MÓVILES CORTEN LA PANTALLA
    <div className={`min-h-[100dvh] h-[100dvh] w-full overflow-hidden flex flex-col transition-colors duration-300 font-sans ${isDarkMode ? 'bg-[#080A0F] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* Resplandor de fondo sutil */}
      <div 
        className="fixed -top-24 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-10 dark:opacity-10 transition-all duration-700 z-0"
        style={{ backgroundColor: accentColor }}
      />

      {/* Contenedor Principal */}
      <div className="flex-1 flex overflow-hidden p-0 sm:p-3 lg:p-4 gap-4 relative z-10">
        
        {/* ========================================================= */}
        {/* 1. SIDEBAR LATERAL (Escritorio)                           */}
        {/* ========================================================= */}
        <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 shrink-0 rounded-[2rem] bg-white/90 dark:bg-[#11141D]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/5 p-5 shadow-sm dark:shadow-2xl transition-all">
          
          <div>
            <div className="flex items-center gap-3 px-2 py-2 mb-6">
              <img 
                src={isDarkMode ? "/logo-light.png" : "/logo-catasystem.png"} 
                alt="CataSystem" 
                className="h-10 w-auto object-contain drop-shadow-sm transition-all"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="min-w-0">
                <h1 className="font-black text-sm tracking-wider uppercase truncate">CataSystem</h1>
                <p className="text-[9px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">VASR LINK TECH</p>
              </div>
            </div>

            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 px-3 mb-2">Administración</p>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentView(item.id as any)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 group ${
                      isActive 
                        ? 'text-white shadow-md' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    style={isActive ? { 
                      background: `linear-gradient(135deg, ${accentColor} 0%, #0f172a 130%)`
                    } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'opacity-70'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-[#181B26] border border-slate-200/60 dark:border-white/5">
              <div className="flex items-center gap-2.5 min-w-0 pr-1">
                {activeStore?.logoUrl ? (
                  <img src={activeStore.logoUrl} alt={activeStore.name} className="w-8 h-8 rounded-xl object-cover shrink-0 border border-black/5" />
                ) : (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 font-black text-xs" style={{ backgroundColor: accentColor }}>
                    <StoreIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tienda</p>
                  <p className="text-xs font-bold truncate text-slate-800 dark:text-white">{activeStore?.name}</p>
                </div>
              </div>
              
              <a 
                href={publicUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-xl bg-white dark:bg-white/10 hover:scale-105 active:scale-95 transition-all text-slate-600 dark:text-slate-300 shadow-sm shrink-0"
                title="Ver Catálogo Público"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {catalog.stores.length > 1 && (
              <select 
                value={catalog.activeStoreId} 
                onChange={(e) => catalog.setActiveStore(e.target.value)}
                className="w-full bg-slate-100 dark:bg-[#181B26] border border-slate-200 dark:border-white/5 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                {catalog.stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            )}

            <button 
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. ÁREA CENTRAL (Vistas)                                  */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col h-full overflow-hidden rounded-none sm:rounded-[2rem] bg-white/95 dark:bg-[#11141D]/90 backdrop-blur-2xl border-0 sm:border border-slate-200/80 dark:border-white/5 shadow-sm dark:shadow-2xl">
          
          {/* Header Superior */}
          <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-white/5 shrink-0 bg-white/80 dark:bg-transparent">
            
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => setIsMobileAdminMenuOpen(true)}
                className="md:hidden w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#181B26] border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-800 dark:text-white active:scale-95 transition-transform"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight truncate max-w-[160px] sm:max-w-md text-slate-900 dark:text-white">
                  {navItems.find(n => n.id === currentView)?.label}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block">
                  {activeStore?.name} • Panel de Control
                </p>
              </div>
            </div>

            {/* Controles de Cabecera */}
            <div className="flex items-center gap-2">
              
              {/* Botón Switch Día / Noche */}
              <button 
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#181B26] border border-slate-200 dark:border-white/5 hover:scale-105 active:scale-95 transition-all text-slate-700 dark:text-yellow-400 shadow-sm cursor-pointer"
                title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Botón Ver Catálogo */}
              <a 
                href={publicUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                style={{ backgroundColor: accentColor }}
              >
                <span className="hidden sm:inline">Ver Catálogo</span>
                <ExternalLink className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              </a>

              {/* Botón Salir en Móvil */}
              <button 
                type="button"
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 md:hidden border border-rose-100 dark:border-transparent active:scale-95 transition-transform cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Vistas Internas con Padding Inferior Corregido (pb-32 en móvil) */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-32 md:pb-8 relative">
            <div className="max-w-6xl mx-auto flex flex-col min-h-full">
              
              <div className="flex-1 mb-8">
                {currentView === 'admin-orders' && (
                  <AdminOrders 
                    activeStore={activeStore} 
                    orders={activeStoreOrders} 
                    products={activeStoreProducts} 
                    addOrder={catalog.addOrder} 
                    confirmPayment={catalog.confirmOrderPayment} 
                    cancelOrder={catalog.cancelOrder} 
                  />
                )}
                {currentView === 'admin-stores' && (
                  <AdminStores 
                    stores={catalog.stores} 
                    addStore={catalog.addStore} 
                    updateStore={catalog.updateStore} 
                    deleteStore={catalog.deleteStore} 
                  />
                )}
                {currentView === 'admin-products' && (
                  <AdminProducts 
                    activeStore={activeStore} 
                    products={activeStoreProducts} 
                    categories={activeStoreCategories} 
                    colors={activeStoreColors} 
                    addProduct={catalog.addProduct} 
                    updateProduct={catalog.updateProduct} 
                    deleteProduct={catalog.deleteProduct} 
                  />
                )}
                {currentView === 'admin-categories' && (
                  <AdminCategories 
                    activeStore={activeStore} 
                    categories={activeStoreCategories} 
                    addCategory={catalog.addCategory} 
                    updateCategory={catalog.updateCategory} 
                    deleteCategory={catalog.deleteCategory} 
                  />
                )}
                {currentView === 'admin-colors' && (
                  <AdminColors 
                    activeStore={activeStore} 
                    colors={activeStoreColors} 
                    addColor={catalog.addColor} 
                    updateColor={catalog.updateColor} 
                    deleteColor={catalog.deleteColor} 
                  />
                )}
                {currentView === 'admin-appearance' && (
                  <AdminAppearance 
                    activeStore={activeStore} 
                    updateStore={catalog.updateStore} 
                  />
                )}
              </div>

              {/* Footer Corporativo AHORA VISIBLE EN MÓVIL TAMBIÉN */}
              <footer className="flex w-full items-center justify-between px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#11141D]/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 shrink-0 mt-auto rounded-2xl">
                <span>CataSystem SaaS 2026</span>
                <span className="text-right">Tecnología desarrollada por<br className="sm:hidden"/> Ing. Emilio Frey</span>
              </footer>

            </div>
          </main>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MENÚ LATERAL MÓVIL (Off-Canvas)                         */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isMobileAdminMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] md:hidden" 
              onClick={() => setIsMobileAdminMenuOpen(false)} 
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
              className="fixed inset-y-0 left-0 w-[80%] max-w-sm z-[100] bg-white dark:bg-[#0E1118] border-r border-slate-200 dark:border-white/10 flex flex-col justify-between shadow-2xl md:hidden p-6"
            >
              <div>
                <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <img src={isDarkMode ? "/logo-light.png" : "/logo-catasystem.png"} alt="CataSystem" className="h-8 w-auto object-contain" />
                    <span className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">CataSystem</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsMobileAdminMenuOpen(false)} 
                    className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full bg-slate-100 dark:bg-white/5 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="py-4 space-y-1.5">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-2">Módulos</p>
                  {navItems.map((item) => {
                    const isActive = currentView === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => { setCurrentView(item.id as any); setIsMobileAdminMenuOpen(false); }}
                        className={`w-full text-left p-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-colors ${
                          isActive ? 'text-white shadow-md' : 'text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                        style={isActive ? { backgroundColor: accentColor } : {}}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
                <button 
                  type="button"
                  onClick={handleLogout} 
                  className="w-full py-3.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Cerrar Sesión
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 4. BARRA INFERIOR MÓVIL                                   */}
      {/* ========================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0E1118]/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 z-40 px-4 py-2 flex justify-between gap-1 pb-safe shadow-lg">
        <button 
          type="button"
          onClick={() => setCurrentView('admin-orders')} 
          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl flex-1 transition-colors ${currentView === 'admin-orders' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
          style={currentView === 'admin-orders' ? { backgroundColor: accentColor } : {}}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] font-bold">Pedidos</span>
        </button>
        <button 
          type="button"
          onClick={() => setCurrentView('admin-products')} 
          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl flex-1 transition-colors ${currentView === 'admin-products' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
          style={currentView === 'admin-products' ? { backgroundColor: accentColor } : {}}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-bold">Productos</span>
        </button>
        <button 
          type="button"
          onClick={() => setCurrentView('admin-categories')} 
          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl flex-1 transition-colors ${currentView === 'admin-categories' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
          style={currentView === 'admin-categories' ? { backgroundColor: accentColor } : {}}
        >
          <LayoutList className="w-5 h-5" />
          <span className="text-[10px] font-bold">Categorías</span>
        </button>
        <button 
          type="button"
          onClick={() => setCurrentView('admin-appearance')} 
          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl flex-1 transition-colors ${currentView === 'admin-appearance' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
          style={currentView === 'admin-appearance' ? { backgroundColor: accentColor } : {}}
        >
          <Paintbrush className="w-5 h-5" />
          <span className="text-[10px] font-bold">Apariencia</span>
        </button>
      </div>

    </div>
  );
}

function PublicCatalogView() {
  const { slug } = useParams();
  const catalog = useCatalog();
  if (!catalog.isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 font-bold">
        Cargando Tienda...
      </div>
    );
  }
  
  const store = catalog.stores.find(s => s.slug === slug);
  if (!store) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Catálogo no encontrado.</div>;
  
  return (
    <PublicCatalog 
      store={store} 
      products={catalog.products.filter(p => p.storeId === store.id && !p.isHidden)} 
      categories={catalog.categories.filter(c => c.storeId === store.id)} 
      colors={catalog.colors.filter(c => c.storeId === store.id)} 
      addOrder={catalog.addOrder} 
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/catalogo/:slug" element={<PublicCatalogView />} />
      </Routes>
    </BrowserRouter>
  );
}
