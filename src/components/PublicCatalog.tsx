import { useState, useMemo } from 'react';
import { Search, Filter, ShoppingBag } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product, Category } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PublicCatalogProps {
  products: Product[];
  categories: Category[];
}

export function PublicCatalog({ products, categories }: PublicCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>('Todos');
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200">
      <header className="flex items-center justify-between h-20 px-6 sm:px-8 max-w-7xl mx-auto mb-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Catálogo</span>
        </div>

        <div className="hidden sm:flex items-center gap-4 flex-1 max-w-xl mx-8">
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
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 sm:hidden"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 h-full">
        <div className="mb-6 sm:hidden relative">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full bg-white border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>

        <div className="flex flex-col lg:flex-row lg:gap-6">
          <aside
            className={`lg:w-64 flex-shrink-0 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'} mb-8 lg:mb-0`}
          >
            <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col gap-6 sticky top-6">
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
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left p-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors ${
                        selectedCategory === category
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {selectedCategory === category && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                      {selectedCategory !== category && <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>}
                      {category}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

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
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-200 rounded-[2rem]">
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
    </div>
  );
}
