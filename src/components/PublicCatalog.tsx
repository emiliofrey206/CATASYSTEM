import { useState, useMemo } from 'react';
import { Search, Filter, ShoppingBag, X, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('Inicio');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Estado para los acordeones de la barra lateral y menú móvil
  const [expandedNav, setExpandedNav] = useState<Record<string, boolean>>({});
  // Estado para las tarjetas desplegables de la página de Inicio
  const [expandedGrid, setExpandedGrid] = useState<Record<string, boolean>>({});

  // Separamos principales e hijas
  const mainCategories = categories.filter(c => !c.parentId);
  const getSubcats = (parentId: string) => categories.filter(c => c.parentId === parentId);

  const toggleNav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNav(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleGrid = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedGrid(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectCategory = (catName: string) => {
    setSelectedCategory(catName);
    setSearchQuery(''); // Limpiamos la búsqueda si navega por categorías
    setIsMobileFiltersOpen(false);
  };

  // Filtro Inteligente (Incluye productos de subcategorías si seleccionas un Padre)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesCategory = false;
      if (selectedCategory === 'Todos' || selectedCategory === 'Inicio') {
        matchesCategory = true;
      } else {
        const selectedCatObj = categories.find(c => c.name === selectedCategory);
        if (selectedCatObj) {
           // Buscamos si tiene hijas y sacamos sus nombres
           const childrenNames = categories.filter(c => c.parentId === selectedCatObj.id).map(c => c.name);
           // Coincide si el producto es de la categoría padre O de alguna de sus hijas
           matchesCategory = product.category === selectedCategory || childrenNames.includes(product.category);
        } else {
           matchesCategory = product.category === selectedCategory;
        }
      }
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory, categories]);

  // Determinar si mostramos la pantalla de "Escaparate de Categorías"
  const isHomeView = selectedCategory === 'Inicio' && searchQuery === '';

  // --- COMPONENTE REUTILIZABLE PARA EL MENÚ (Sirve para PC y Móvil) ---
  const CategoryNavigation = () => (
    <nav className="space-y-1.5">
      <button
        onClick={() => handleSelectCategory('Inicio')}
        className={`w-full text-left p-3 rounded-xl text-sm font-semibold transition-colors ${
          selectedCategory === 'Inicio' ? 'bg-black text-white' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        Inicio (Categorías)
      </button>
      <button
        onClick={() => handleSelectCategory('Todos')}
        className={`w-full text-left p-3 rounded-xl text-sm font-semibold transition-colors ${
          selectedCategory === 'Todos' ? 'bg-black text-white' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        Todos los productos
      </button>

      <div className="pt-2 pb-1">
        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 px-3">Explorar</p>
      </div>

      {mainCategories.map((cat) => {
        const subcats = getSubcats(cat.id);
        const hasSubcats = subcats.length > 0;
        const isExpanded = expandedNav[cat.id];
        const isActive = selectedCategory === cat.name;
        const isChildActive = subcats.some(s => s.name === selectedCategory);

        return (
          <div key={cat.id} className="flex flex-col gap-1">
            <div className={`flex items-center rounded-xl transition-colors ${
                isActive || isChildActive ? 'bg-blue-50 ring-1 ring-blue-100' : 'hover:bg-slate-50'
              }`}>
              <button
                onClick={() => handleSelectCategory(cat.name)}
                className={`flex-1 text-left p-3 text-sm font-semibold ${
                  isActive || isChildActive ? 'text-blue-700' : 'text-slate-700'
                }`}
              >
                {cat.name}
              </button>
              
              {hasSubcats && (
                <button 
                  onClick={(e) => toggleNav(cat.id, e)}
                  className={`p-3 text-slate-400 hover:text-slate-700 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Subcategorías Desplegables */}
            {hasSubcats && isExpanded && (
              <div className="pl-4 pr-2 flex flex-col gap-1 my-1">
                {subcats.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => handleSelectCategory(sub.name)}
                    className={`text-left p-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                      selectedCategory === sub.name ? 'bg-black text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ChevronRight className={`w-3 h-3 ${selectedCategory === sub.name ? 'text-white' : 'text-slate-400'}`} />
                    {sub.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200 relative pb-20 lg:pb-0">
      
      {/* HEADER PRINCIPAL */}
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
        
        {/* BOTÓN SUPERIOR MÓVIL */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex h-10 items-center justify-center px-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-bold shadow-sm"
          >
            <Filter className="h-4 w-4 mr-2" /> Menú
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

        <div className="flex flex-col lg:flex-row lg:gap-8">
          
          {/* ASIDE DE ESCRITORIO (Siempre visible en PC) */}
          <aside className="lg:w-72 flex-shrink-0 hidden lg:block">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col gap-6 sticky top-6 shadow-sm">
              <CategoryNavigation />
            </div>
          </aside>

          {/* ÁREA DE CONTENIDO PRINCIPAL */}
          <section className="flex-1">
            
            {/* ESCAPARATE DE CATEGORÍAS (HOME) */}
            {isHomeView ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">¿Qué estás buscando?</h2>
                    <p className="text-slate-500 text-sm mt-1">Explora nuestras categorías principales</p>
                  </div>
                  <button
                    onClick={() => handleSelectCategory('Todos')}
                    className="hidden sm:inline-flex bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                  >
                    Mostrar todo
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {mainCategories.map(cat => {
                    const subcats = getSubcats(cat.id);
                    const hasSubcats = subcats.length > 0;
                    const isExpanded = expandedGrid[cat.id];

                    return (
                      <div key={cat.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                        
                        {/* Portada de la tarjeta */}
                        <div 
                          onClick={() => hasSubcats ? toggleGrid(cat.id, { stopPropagation: () => {} } as any) : handleSelectCategory(cat.name)}
                          className="cursor-pointer relative"
                        >
                          <div className="h-40 w-full bg-slate-100 overflow-hidden relative">
                            {cat.imageUrl ? (
                              <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">Sin imagen</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                              <div>
                                <h3 className="text-xl font-bold text-white drop-shadow-md">{cat.name}</h3>
                                {hasSubcats && <p className="text-white/80 text-xs font-semibold mt-1 drop-shadow-sm">{subcats.length} Colecciones</p>}
                              </div>
                              {hasSubcats && (
                                <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Desplegable de Subcategorías en la Tarjeta */}
                        <AnimatePresence>
                          {isExpanded && hasSubcats && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-slate-50 border-t border-slate-100"
                            >
                              <div className="p-3 flex flex-col gap-1.5">
                                <button 
                                  onClick={() => handleSelectCategory(cat.name)}
                                  className="text-left px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                >
                                  Ver todo en {cat.name}
                                </button>
                                {subcats.map(sub => (
                                  <button
                                    key={sub.id}
                                    onClick={() => handleSelectCategory(sub.name)}
                                    className="text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all flex items-center justify-between"
                                  >
                                    {sub.name} <ChevronRight className="w-4 h-4 text-slate-400" />
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    );
                  })}
                </div>
                
                {/* Botón Mostrar todo (Móvil) */}
                <button
                  onClick={() => handleSelectCategory('Todos')}
                  className="w-full sm:hidden bg-slate-200 text-slate-800 px-5 py-4 rounded-2xl text-base font-bold hover:bg-slate-300 transition-colors"
                >
                  Mostrar todos los productos
                </button>
              </motion.div>
            ) : (
              
              /* VISTA DE PRODUCTOS */
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {searchQuery ? 'Resultados de búsqueda' : (selectedCategory === 'Todos' ? 'Todos los productos' : selectedCategory)}
                    </h2>
                    {searchQuery && <p className="text-sm text-slate-500 mt-1">Buscando: "{searchQuery}"</p>}
                  </div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-tight bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'RESULTADO' : 'RESULTADOS'}
                  </span>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                      {filteredProducts.map((product) => (
                        <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
                      <Search className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No se encontraron productos</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                      Intenta buscar con otros términos o navega por las categorías en el menú.
                    </p>
                    <button
                      onClick={() => { setSearchQuery(''); handleSelectCategory('Inicio'); }}
                      className="mt-6 bg-black text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Volver al inicio
                    </button>
                  </div>
                )}
              </motion.div>
            )}

          </section>
        </div>
      </main>

      {/* BOTÓN FLOTANTE MÓVIL (FAB) */}
      {!isMobileFiltersOpen && (
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex lg:hidden items-center justify-center gap-2 rounded-full bg-black text-white px-5 py-3.5 shadow-xl shadow-black/20 hover:bg-slate-800 transition-transform active:scale-95 font-bold text-sm"
        >
          <Filter className="w-4 h-4" /> Menú
        </button>
      )}

      {/* MENÚ MODAL INFERIOR (TIPO APP) */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)}>
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="w-full bg-white rounded-t-[2rem] p-6 max-h-[85vh] flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xl font-black text-slate-900">Menú del Catálogo</h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors bg-slate-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="overflow-y-auto pb-6">
                <CategoryNavigation />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
