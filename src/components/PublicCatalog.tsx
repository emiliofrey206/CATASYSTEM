import { useState, useMemo } from 'react';
import { Search, Filter, ShoppingBag, X } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product, Category, Store } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PublicCatalogProps {
  store: Store;
  products: Product[];
  categories: Category[];
}

export function PublicCatalog({ store, products, categories }: PublicCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200 relative pb-20 lg:pb-0">
      <header className="flex items-center justify-between h-24 px-6 sm:px-8 max-w-7xl mx-auto mb-4 shrink-0">
        
        <div className="flex items-center gap-4">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt={store.name} className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover border border-slate-200 shadow-sm bg-white" />
          ) : (
            <div className="w-14 h-14 md:w-16 md:h-16 bg-black rounded-2xl flex items-center justify-center shadow-sm">
              <ShoppingBag className="h-7 w-7 text-white" />
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-slate-900 truncate max-w-[200px] sm:max-w-md">
            {store.name}
          </h1>
        </div>

        <div className="hidden lg:flex items-center gap-4 flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
            />
          </div>
        </div>
        
        {/* BOTÓN SUPERIOR MÓVIL (Reemplaza al embudo solitario) */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex h-10 items-center justify-center px-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-bold shadow-sm"
          >
            <Filter className="h-4 w-4 mr-2" /> Categorías
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 h-full">
        {/* BÚSQUEDA MÓVIL */}
        <div className="mb-6 lg:hidden relative">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full bg-white border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 shadow-sm"
          />
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-6">
          
          {/* ASIDE DE ESCRITORIO (Siempre visible en PC, oculto en móviles) */}
          <aside className="lg:w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col gap-6 sticky top-6 shadow-sm">
              <div className="space-y-4">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Categorías
                </p>
                <nav className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('Todos')}
                    className={`w-full text-left p-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${
                      selectedCategory === 'Todos'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {selectedCategory === 'Todos' && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                    {selectedCategory !== 'Todos' && <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>}
                    Todos
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full text-left p-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${
                        selectedCategory === category.name
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {selectedCategory === category.name && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                      {selectedCategory !== category.name && <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>}
                      {category.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* LISTA DE PRODUCTOS */}
          <section className="flex-1">
            <div className="mb-6 flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-slate-900">
                {selectedCategory === 'Todos' ? 'Todos los productos' : selectedCategory}
              </h2>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-tight">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'RESULTADO' : 'RESULTADOS'}
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No se encontraron productos</h3>
                <p className="text-sm text-slate-500">
                  Intenta buscar con otros términos o cambia la categoría.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Todos');
                  }}
                  className="mt-6 bg-black text-white px-6 py-3 rounded-2xl text-sm font-semibold inline-flex items-center gap-2 hover:bg-slate-800 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ========================================= */}
      {/* NUEVO: BOTÓN FLOTANTE MÓVIL (FAB) */}
      {/* ========================================= */}
      {!isMobileFiltersOpen && (
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex lg:hidden items-center justify-center gap-2 rounded-full bg-black text-white px-5 py-3.5 shadow-xl shadow-black/20 hover:bg-slate-800 transition-transform active:scale-95 font-bold text-sm"
        >
          <Filter className="w-4 h-4" /> Categorías
        </button>
      )}

      {/* ========================================= */}
      {/* NUEVO: MENÚ MODAL INFERIOR (TIPO APP) */}
      {/* ========================================= */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)}>
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="w-full bg-white rounded-t-[2rem] p-6 max-h-[85vh] flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xl font-bold text-slate-900">Categorías</h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors bg-slate-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="overflow-y-auto pb-6 space-y-2">
                <button
                  onClick={() => { setSelectedCategory('Todos'); setIsMobileFiltersOpen(false); }}
                  className={`w-full text-left p-3.5 rounded-xl text-base font-semibold flex items-center gap-3 transition-colors ${
                    selectedCategory === 'Todos' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
                  }`}
                >
                  {selectedCategory === 'Todos' && <span className="w-2 h-2 bg-white rounded-full"></span>}
                  {selectedCategory !== 'Todos' && <span className="w-2 h-2 bg-slate-300 rounded-full"></span>}
                  Todos los productos
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => { setSelectedCategory(category.name); setIsMobileFiltersOpen(false); }}
                    className={`w-full text-left p-3.5 rounded-xl text-base font-semibold flex items-center gap-3 transition-colors ${
                      selectedCategory === category.name ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
                    }`}
                  >
                    {selectedCategory === category.name && <span className="w-2 h-2 bg-white rounded-full"></span>}
                    {selectedCategory !== category.name && <span className="w-2 h-2 bg-slate-300 rounded-full"></span>}
                    {category.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
