import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Settings, ExternalLink, LayoutDashboard, LayoutList, LogOut } from 'lucide-react';
import { useCatalog } from './store';
import { PublicCatalog } from './components/PublicCatalog';
import { AdminProducts } from './components/AdminProducts';
import { AdminCategories } from './components/AdminCategories';
import { Login } from './components/Login';

function AdminLayout() {
  const [currentView, setCurrentView] = useState<'admin-products' | 'admin-categories'>('admin-products');
  const catalog = useCatalog();
  const currentStore = catalog.stores[0];

  if (!catalog.isLoaded) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Cargando...</div>;
  }

  if (!catalog.isAuthenticated) {
    return <Login />;
  }

  const publicUrl = `/catalogo/${currentStore?.slug || 'tienda'}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden font-sans">
      <header className="flex items-center justify-between px-6 sm:px-8 py-4 shrink-0 bg-white border-b border-slate-200 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Katalog Admin</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Ver Catálogo Público
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
        {/* Admin Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col gap-6 overflow-y-auto shrink-0 hidden md:flex">
          <div className="space-y-4">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Administración</p>
            <nav className="space-y-2">
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

        {/* Mobile Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-4 py-3 flex justify-around">
           <button
            onClick={() => setCurrentView('admin-products')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'admin-products' ? 'text-black' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" /> Productos
          </button>
          <button
            onClick={() => setCurrentView('admin-categories')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'admin-categories' ? 'text-black' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <LayoutList className="w-5 h-5" /> Categorías
          </button>
          <button
            onClick={() => catalog.logout()}
            className="flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Salir
          </button>
        </div>

        {/* Admin Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto">
            {currentView === 'admin-products' && (
              <AdminProducts 
                products={catalog.products} 
                categories={catalog.categories}
                addProduct={catalog.addProduct}
                updateProduct={catalog.updateProduct}
                deleteProduct={catalog.deleteProduct}
              />
            )}
            {currentView === 'admin-categories' && (
              <AdminCategories
                categories={catalog.categories}
                addCategory={catalog.addCategory}
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

  if (!catalog.isLoaded) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Cargando...</div>;
  }

  const store = catalog.stores.find(s => s.slug === slug);

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Tienda no encontrada.
      </div>
    );
  }

  // Filter products by storeId
  const storeProducts = catalog.products.filter(p => p.storeId === store.id);

  return <PublicCatalog products={storeProducts} categories={catalog.categories} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin redirect / */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* Admin Panel */}
        <Route path="/admin/*" element={<AdminLayout />} />
        
        {/* Public Storefront */}
        <Route path="/catalogo/:slug" element={<PublicCatalogView />} />
      </Routes>
    </BrowserRouter>
  );
}
