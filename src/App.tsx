import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Settings, ExternalLink, LayoutDashboard, LayoutList, LogOut, Store as StoreIcon, Palette, Paintbrush, Receipt, Menu, X } from 'lucide-react';
import { useCatalog } from './store';
import { PublicCatalog } from './components/PublicCatalog';
import { AdminProducts } from './components/AdminProducts';
import { AdminCategories } from './components/AdminCategories';
import { AdminStores } from './components/AdminStores';
import { AdminColors } from './components/AdminColors';
import { AdminAppearance } from './components/AdminAppearance'; 
import { AdminOrders } from './components/AdminOrders';
import { Login } from './components/Login';
import { motion, AnimatePresence } from 'motion/react'; // <-- Importamos para el menú móvil

function AdminLayout() {
  const [currentView, setCurrentView] = useState<'admin-products' | 'admin-categories' | 'admin-stores' | 'admin-colors' | 'admin-appearance' | 'admin-orders'>('admin-orders');
  
  // NUEVO: Estado para controlar el menú lateral en móviles
  const [isMobileAdminMenuOpen, setIsMobileAdminMenuOpen] = useState(false);

  const catalog = useCatalog();
  
  if (!catalog.isLoaded) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Cargando...</div>;
  if (!catalog.isAuthenticated) return <Login />;

  const activeStore = catalog.stores.find(s => s.id === catalog.activeStoreId) || catalog.stores[0];
  const publicUrl = `/catalogo/${activeStore?.slug || 'tienda'}`;
  
  const activeStoreProducts = catalog.products.filter(p => p.storeId === activeStore?.id);
  const activeStoreCategories = catalog.categories.filter(c => c.storeId === activeStore?.id);
  const activeStoreColors = catalog.colors.filter(c => c.storeId === activeStore?.id);
  const activeStoreOrders = catalog.orders.filter(o => o.storeId === activeStore?.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      
      {/* HEADER PRINCIPAL */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 shrink-0 bg-white border-b border-slate-200 z-10 relative">
        <div className="flex items-center gap-3 flex-1">
          {/* ICONO PC (Engranaje) */}
          <div className="hidden md:flex w-10 h-10 bg-black rounded-xl items-center justify-center shrink-0 shadow-sm">
            <Settings className="w-6 h-6 text-white" />
          </div>
          
          {/* BOTÓN MENÚ MÓVIL (Hamburguesa) */}
          <button 
            onClick={() => setIsMobileAdminMenuOpen(true)} 
            className="md:hidden w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition-transform"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          <h1 className="text-xl font-black tracking-tight hidden sm:block uppercase text-slate-800">CATASYSTEM</h1>
        </div>

        <div className="flex items-center justify-center gap-3 flex-1">
          {activeStore?.logoUrl ? (
            <img src={activeStore.logoUrl} alt={activeStore.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-white" />
          ) : (
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200"><StoreIcon className="w-5 h-5 text-slate-400" /></div>
          )}
          <h2 className="text-lg font-bold text-slate-900 uppercase truncate max-w-[200px]">{activeStore?.name}</h2>
        </div>
        
        <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1">
          {catalog.stores.length > 0 && (
            <select value={catalog.activeStoreId} onChange={(e) => catalog.setActiveStore(e.target.value)} className="hidden sm:block bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-2 outline-none cursor-pointer hover:bg-slate-200">
              {catalog.stores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
            </select>
          )}
          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="p-2 sm:px-4 sm:py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center gap-2 transition-colors">
            <ExternalLink className="w-5 h-5 sm:w-4 sm:h-4" /> <span className="hidden lg:inline">Ver Catálogo</span>
          </a>
          <button onClick={() => catalog.logout()} className="text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl hidden sm:flex transition-colors">
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* ESCRITORIO MENU LATERAL */}
        <aside className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col gap-6 overflow-y-auto shrink-0 hidden md:flex">
          <div className="space-y-4">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Administración</p>
            <nav className="space-y-2">
              <button onClick={() => setCurrentView('admin-orders')} className={`w-full text-left p-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${currentView === 'admin-orders' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Receipt className="w-4 h-4" /> Pedidos y Ventas</button>
              <button onClick={() => setCurrentView('admin-stores')} className={`w-full text-left p-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${currentView === 'admin-stores' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><StoreIcon className="w-4 h-4" /> Mis Tiendas</button>
              <button onClick={() => setCurrentView('admin-products')} className={`w-full text-left p-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${currentView === 'admin-products' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><LayoutDashboard className="w-4 h-4" /> Productos</button>
              <button onClick={() => setCurrentView('admin-categories')} className={`w-full text-left p-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${currentView === 'admin-categories' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><LayoutList className="w-4 h-4" /> Categorías</button>
              <button onClick={() => setCurrentView('admin-colors')} className={`w-full text-left p-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${currentView === 'admin-colors' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Palette className="w-4 h-4" /> Muestrario Colores</button>
              <button onClick={() => setCurrentView('admin-appearance')} className={`w-full text-left p-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${currentView === 'admin-appearance' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}><Paintbrush className="w-4 h-4" /> Apariencia Visual</button>
            </nav>
          </div>
        </aside>

        {/* --- NUEVO: MENÚ LATERAL MÓVIL (OFF-CANVAS) --- */}
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
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }} 
                className="fixed inset-y-0 left-0 w-[80%] max-w-sm z-[100] bg-white flex flex-col shadow-2xl md:hidden"
              >
                <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center"><Settings className="w-5 h-5 text-white" /></div>
                    <h3 className="text-lg font-black uppercase text-slate-900">Menú</h3>
                  </div>
                  <button onClick={() => setIsMobileAdminMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-full bg-white shadow-sm border border-slate-200"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="overflow-y-auto p-4 flex-1 space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-2 mb-3 px-2">Gestión Principal</p>
                  <button onClick={() => { setCurrentView('admin-orders'); setIsMobileAdminMenuOpen(false); }} className={`w-full text-left p-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${currentView === 'admin-orders' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'}`}><Receipt className="w-5 h-5" /> Pedidos y Ventas</button>
                  <button onClick={() => { setCurrentView('admin-products'); setIsMobileAdminMenuOpen(false); }} className={`w-full text-left p-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${currentView === 'admin-products' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'}`}><LayoutDashboard className="w-5 h-5" /> Productos</button>
                  <button onClick={() => { setCurrentView('admin-categories'); setIsMobileAdminMenuOpen(false); }} className={`w-full text-left p-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${currentView === 'admin-categories' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'}`}><LayoutList className="w-5 h-5" /> Categorías</button>
                  
                  <div className="h-px bg-slate-100 my-4 mx-2"></div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-3 px-2">Configuración Avanzada</p>
                  
                  <button onClick={() => { setCurrentView('admin-colors'); setIsMobileAdminMenuOpen(false); }} className={`w-full text-left p-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${currentView === 'admin-colors' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'}`}><Palette className="w-5 h-5" /> Muestrario de Colores</button>
                  <button onClick={() => { setCurrentView('admin-appearance'); setIsMobileAdminMenuOpen(false); }} className={`w-full text-left p-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${currentView === 'admin-appearance' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'}`}><Paintbrush className="w-5 h-5" /> Apariencia Visual</button>
                  <button onClick={() => { setCurrentView('admin-stores'); setIsMobileAdminMenuOpen(false); }} className={`w-full text-left p-3.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${currentView === 'admin-stores' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:bg-slate-50'}`}><StoreIcon className="w-5 h-5" /> Configurar Tienda</button>
                </div>
                
                <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                  <button onClick={() => { catalog.logout(); setIsMobileAdminMenuOpen(false); }} className="w-full py-4 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-sm">
                    <LogOut className="w-5 h-5" /> Cerrar Sesión
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- BARRA INFERIOR FIJA MÓVIL (Optimizada y Limpia) --- */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 z-40 px-4 py-2 flex justify-between gap-2 pb-safe">
          <button onClick={() => setCurrentView('admin-orders')} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl flex-1 transition-colors ${currentView === 'admin-orders' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Receipt className="w-6 h-6" />
            <span className="text-[11px] font-bold">Pedidos</span>
          </button>
          <button onClick={() => setCurrentView('admin-products')} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl flex-1 transition-colors ${currentView === 'admin-products' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}>
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[11px] font-bold">Productos</span>
          </button>
          <button onClick={() => setCurrentView('admin-categories')} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl flex-1 transition-colors ${currentView === 'admin-categories' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}>
            <LayoutList className="w-6 h-6" />
            <span className="text-[11px] font-bold">Categorías</span>
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 md:pb-8">
          <div className="max-w-5xl mx-auto">
            {currentView === 'admin-orders' && <AdminOrders activeStore={activeStore} orders={activeStoreOrders} products={activeStoreProducts} addOrder={catalog.addOrder} confirmPayment={catalog.confirmOrderPayment} cancelOrder={catalog.cancelOrder} />}
            {currentView === 'admin-stores' && <AdminStores stores={catalog.stores} addStore={catalog.addStore} updateStore={catalog.updateStore} deleteStore={catalog.deleteStore} />}
            {currentView === 'admin-products' && <AdminProducts activeStore={activeStore} products={activeStoreProducts} categories={activeStoreCategories} colors={activeStoreColors} addProduct={catalog.addProduct} updateProduct={catalog.updateProduct} deleteProduct={catalog.deleteProduct} />}
            {currentView === 'admin-categories' && <AdminCategories activeStore={activeStore} categories={activeStoreCategories} addCategory={catalog.addCategory} updateCategory={catalog.updateCategory} deleteCategory={catalog.deleteCategory} />}
            {currentView === 'admin-colors' && <AdminColors activeStore={activeStore} colors={activeStoreColors} addColor={catalog.addColor} updateColor={catalog.updateColor} deleteColor={catalog.deleteColor} />}
            {currentView === 'admin-appearance' && <AdminAppearance activeStore={activeStore} updateStore={catalog.updateStore} />}
          </div>
        </main>

      </div>
      
      <footer className="hidden md:block w-full text-center py-6 border-t border-slate-200">
        <p className="text-xs font-black tracking-widest text-slate-400 uppercase">
          CataSystem Desarrollado por ING. EMILIO FREY, 2026
        </p>
      </footer>
    </div>
  );
}

function PublicCatalogView() {
  const { slug } = useParams();
  const catalog = useCatalog();
  if (!catalog.isLoaded) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Cargando...</div>;
  const store = catalog.stores.find(s => s.slug === slug);
  if (!store) return <div className="min-h-screen flex items-center justify-center text-slate-500">Catálogo no encontrado.</div>;
  
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
