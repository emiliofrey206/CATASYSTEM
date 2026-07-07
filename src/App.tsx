import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Settings, ExternalLink, LayoutDashboard, LayoutList, LogOut, Store as StoreIcon } from 'lucide-react';
import { useCatalog } from './store';
import { PublicCatalog } from './components/PublicCatalog';
import { AdminProducts } from './components/AdminProducts';
import { AdminCategories } from './components/AdminCategories';
import { AdminStores } from './components/AdminStores';
import { Login } from './components/Login';

function AdminLayout() {
  const [currentView, setCurrentView] = useState<'admin-products' | 'admin-categories' | 'admin-stores'>('admin-products');
  const catalog = useCatalog();
  
  if (!catalog.isLoaded) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Cargando...</div>;
  if (!catalog.isAuthenticated) return <Login />;

  const activeStore = catalog.stores.find(s => s.id === catalog.activeStoreId) || catalog.stores[0];
  const publicUrl = `/catalogo/${activeStore?.slug || 'tienda'}`;
  
  // FILTRAMOS PRODUCTOS Y CATEGORÍAS PARA QUE SEAN EXCLUSIVOS DE LA TIENDA ACTIVA
  const activeStoreProducts = catalog.products.filter(p => p.storeId === activeStore?.id);
  const activeStoreCategories = catalog.categories.filter(c => c.storeId === activeStore?.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      <header className="flex items-center justify-between px-6 sm:px-8 py-4 shrink-0 bg-white border-b border-slate-200 z-10 relative">
        
        {/* IZQUIERDA: MARCA DEL SISTEMA */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight hidden sm:block uppercase text-slate-800">
            CATASYSTEM
          </h1>
        </div>

        {/* CENTRO: TIENDA ACTIVA (LOGO Y NOMBRE) */}
        <div className="hidden md:flex items-center justify-center gap-3 flex-1">
          {activeStore?.logoUrl ? (
            <img src={activeStore.logoUrl} alt={activeStore.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm bg-white" />
          ) : (
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200">
              <StoreIcon className="w-5 h-5 text-slate-400" />
            </div>
          )}
          <h2 className="text-lg font-bold text-slate-900 uppercase truncate max-w-[250px]">
            {activeStore?.name || 'Selecciona Tienda'}
          </h2>
        </div>
        
        {/* DERECHA: CONTROLES */}
        <div className="flex items-center justify-end gap-4 flex-1">
          {catalog.stores.length > 0 && (
            <select
              value={catalog.activeStoreId}
              onChange={(e) => catalog.setActiveStore(e.target.value)}
              className="bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-4 py-2 outline-none cursor-pointer hover:bg-slate-200 transition-colors"
            >
              {catalog.stores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          )}

          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
            title="Abre el catálogo de la tienda actual"
          >
            <ExternalLink className="w-4 h-4" /> <span className="hidden lg:inline">Ver Catálogo</span>
          </a>
          <button
            onClick={() => catalog.logout()}
            className="text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors hidden sm:flex"
          >
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col gap-6 overflow-y-auto shrink-0 hidden md:flex">
          <div className="space-y-4">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Administración</p>
            <nav className="space-y-2">
              <button
                onClick={() => setCurrentView('admin-stores')}
                className={`w-full text-left p-2.5 rounded-xl text-sm font-medium flex items-center gap-3 cursor-pointer transition-colors ${
                  currentView === 'admin-stores' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <StoreIcon className="w-4 h-4" /> Mis Tiendas
              </button>
              <button
                onClick={() => setCurrentView('admin-products')}
                className={`w-full text-left p-2.5 rounded-xl text-sm font-medium flex items-center gap-3 cursor-pointer transition-colors ${
                  currentView === 'admin-products' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Productos
              </button>
              <button
                onClick={() => setCurrentView('admin-categories')}
                className={`w-full text-left p-2.5 rounded-xl text-sm font-medium flex items-center gap-3 cursor-pointer transition-colors ${
                  currentView === 'admin-categories' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutList className="w-4 h-4" /> Categorías
              </button>
            </nav>
          </div>
        </aside>

        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-3 flex justify-around">
          <button
            onClick={() => setCurrentView('admin-stores')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors ${currentView === 'admin-stores' ? 'text-black' : 'text-slate-500'}`}
          >
            <StoreIcon className="w-5 h-5" /> Tiendas
          </button>
           <button
            onClick={() => setCurrentView('admin-products')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors ${currentView === 'admin-products' ? 'text-black' : 'text-slate-500'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Productos
          </button>
          <button
            onClick={() => setCurrentView('admin-categories')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors ${currentView === 'admin-categories' ? 'text-black' : 'text-slate-500'}`}
          >
            <LayoutList className="w-5 h-5" /> Categorías
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto">
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
                addProduct={catalog.addProduct}
                updateProduct={catalog.updateProduct}
                deleteProduct={catalog.deleteProduct}
              />
            )}
            {currentView === 'admin-categories' && (
              <AdminCategories
                categories={activeStoreCategories}
                addCategory={catalog.addCategory}
                updateCategory={catalog.updateCategory}
                deleteCategory={catalog.deleteCategory}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function PublicCatalogView() {
  const { slug } = useParams();
  const catalog = useCatalog();

  if (!catalog.isLoaded) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Cargando...</div>;

  const store = catalog.stores.find(s => s.slug === slug);

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Tienda o Catálogo no encontrado.
      </div>
    );
  }

  // FILTRAMOS PRODUCTOS Y CATEGORÍAS PARA LA TIENDA PÚBLICA
  const storeProducts = catalog.products.filter(p => p.storeId === store.id);
  const storeCategories = catalog.categories.filter(c => c.storeId === store.id);

  return <PublicCatalog store={store} products={storeProducts} categories={storeCategories} />;
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
