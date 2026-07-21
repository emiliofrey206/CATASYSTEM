import { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, X, Image as ImageIcon, Upload, Filter, Tag, Palette } from 'lucide-react';
import { Product, Store, Category, Color } from '../types';

interface AdminProductsProps {
  activeStore: Store;
  products: Product[];
  categories: Category[];
  colors: Color[]; // Conexión directa al Muestrario de Colores
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export function AdminProducts({ activeStore, products, categories, colors, addProduct, updateProduct, deleteProduct }: AdminProductsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Estados del Formulario
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stockStatus, setStockStatus] = useState('disponible');
  const [isOffer, setIsOffer] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [variants, setVariants] = useState<{ color: string; colorCode: string; imageUrl: string }[]>([]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCategory ? p.category === filterCategory : true;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, filterCategory]);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setPrice('');
    setCategoryId(categories.length > 0 ? categories[0].name : '');
    setDescription('');
    setImageUrl('');
    setStockStatus('disponible');
    setIsOffer(false);
    setOfferPrice('');
    setVariants([]);
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setIsEditing(true);
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setCategoryId(product.category);
    setDescription(product.description || '');
    setImageUrl(product.imageUrl || '');
    setStockStatus(product.stockStatus || (product.inStock === false ? 'agotado' : 'disponible'));
    setIsOffer(product.isOffer || false);
    setOfferPrice(product.offerPrice ? product.offerPrice.toString() : '');
    setVariants(product.variants || []);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const productData = {
        storeId: activeStore.id,
        name,
        price: parseFloat(price) || 0,
        category: categoryId,
        description,
        imageUrl,
        stockStatus,
        inStock: stockStatus !== 'agotado',
        isOffer,
        offerPrice: isOffer ? parseFloat(offerPrice) || 0 : null,
        variants
      };

      if (isEditing && editingId) {
        await updateProduct(editingId, productData);
      } else {
        await addProduct(productData);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Convertidor de Imagen a Base64 para subir foto local
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleVariantImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newVariants = [...variants];
        newVariants[index].imageUrl = reader.result as string;
        setVariants(newVariants);
      };
      reader.readAsDataURL(file);
    }
  };

  const addVariant = () => setVariants([...variants, { color: '', colorCode: '#000000', imageUrl: '' }]);
  const removeVariant = (idx: number) => setVariants(variants.filter((_, i) => i !== idx));
  
  const updateVariant = (idx: number, field: string, value: string) => {
    const newVariants = [...variants];
    (newVariants[idx] as any)[field] = value;
    
    // Auto-completado inteligente del color maestro
    if (field === 'color') {
       const foundMaster = colors.find(c => c.name.trim().toLowerCase() === value.trim().toLowerCase());
       if (foundMaster) {
          newVariants[idx].colorCode = foundMaster.colorCode || (foundMaster as any).value || (foundMaster as any).hex || '#000000';
       }
    }
    
    setVariants(newVariants);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-4 sm:p-6 lg:p-8">
       {/* HEADER Y BUSCADOR */}
       <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Inventario de {activeStore.name}</h2>
             <button onClick={openNewModal} className="bg-black hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2">
               <Plus className="w-5 h-5" /> Nuevo Producto
             </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
             <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Buscar productos..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
             </div>
             <div className="relative sm:w-64">
                <Filter className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                  <option value="">Todas las categorías</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
             </div>
          </div>
       </div>

       {/* LISTA DE PRODUCTOS */}
       <div className="space-y-3">
          {filteredProducts.length === 0 ? (
             <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                <p className="text-slate-500 font-medium">No se encontraron productos.</p>
             </div>
          ) : (
             filteredProducts.map(product => (
                <div key={product.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-all">
                   <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center">
                      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-slate-300" />}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase truncate">{product.name}</h3>
                      <p className="text-[10px] sm:text-xs text-slate-500 uppercase mt-0.5">{product.category}</p>
                      
                      {/* --- SOLUCIÓN: CÍRCULOS INTELIGENTES CONECTADOS AL MUESTRARIO --- */}
                      {product.variants && product.variants.length > 0 && (
                         <div className="flex items-center gap-1.5 mt-2">
                            {product.variants.map((variant, idx) => {
                              const masterColor = colors.find(c => c.name.trim().toLowerCase() === variant.color.trim().toLowerCase());
                              const hexColor = masterColor ? (masterColor.colorCode || (masterColor as any).value || (masterColor as any).hex) : (variant.colorCode || '#e2e8f0');

                              return (
                                <div 
                                  key={idx} 
                                  title={variant.color}
                                  className="w-4 h-4 rounded-full border border-slate-200 shadow-sm" 
                                  style={{ backgroundColor: hexColor }}
                                ></div>
                              );
                            })}
                         </div>
                      )}

                      <div className="flex items-center gap-3 mt-2 sm:hidden">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${product.stockStatus === 'agotado' || product.inStock === false ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                           {product.stockStatus === 'agotado' || product.inStock === false ? 'Agotado' : 'Disponible'}
                        </span>
                        <span className="text-sm font-black">${product.price.toFixed(2)}</span>
                      </div>
                   </div>

                   <div className="hidden sm:flex items-center gap-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase ${product.stockStatus === 'agotado' || product.inStock === false ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                         {product.stockStatus === 'agotado' || product.inStock === false ? 'Agotado' : 'Disponible'}
                      </span>
                      <span className="text-base font-black w-20 text-right">${product.price.toFixed(2)}</span>
                   </div>

                   <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 border-l border-slate-100 pl-4">
                      <button onClick={() => openEditModal(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => { if(window.confirm(`¿Eliminar ${product.name}?`)) deleteProduct(product.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </div>
             ))
          )}
       </div>

       {/* MODAL DE EDICIÓN / CREACIÓN */}
       {isModalOpen && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
               <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
                  <h3 className="text-xl font-black text-slate-900">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
               </div>

               <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                     
                     <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nombre del Producto</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej. Horquilla Francesa" />
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Precio Base ($)</label>
                           <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Categoría</label>
                           <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                             {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                           </select>
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Descripción</label>
                        <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Detalles del producto..." />
                     </div>

                     {/* SUBIR FOTO LOCAL */}
                     <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Imagen de Portada</label>
                        <div className="border border-slate-200 rounded-xl p-4">
                           <label className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 cursor-pointer hover:bg-blue-50 py-3 rounded-lg border border-dashed border-blue-200 transition-colors">
                             <Upload className="w-4 h-4" /> Subir foto local
                             <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                           </label>
                           {imageUrl && (
                             <div className="mt-4 relative inline-block">
                                <img src={imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-sm" />
                                <button type="button" onClick={() => setImageUrl('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"><X className="w-3 h-3" /></button>
                             </div>
                           )}
                        </div>
                     </div>

                     {/* INVENTARIO Y OFERTAS */}
                     <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4"><Tag className="w-4 h-4 text-blue-500" /> Inventario y Ofertas</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                           <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Disponibilidad</label>
                              <select value={stockStatus} onChange={e => setStockStatus(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                <option value="disponible">🟢 Disponible (En Stock)</option>
                                <option value="pocas_unidades">🟠 Pocas Unidades</option>
                                <option value="agotado">🔴 Agotado</option>
                              </select>
                           </div>
                           <div className="flex items-center h-[46px] px-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                 <input type="checkbox" checked={isOffer} onChange={e => setIsOffer(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                 <span className="text-sm font-bold text-slate-700">Producto en Oferta/Remate</span>
                              </label>
                           </div>
                        </div>
                        
                        {isOffer && (
                           <div className="mt-4">
                              <label className="block text-xs font-bold text-slate-700 uppercase mb-2 text-blue-600">Precio de Oferta ($)</label>
                              <input type="number" step="0.01" required value={offerPrice} onChange={e => setOfferPrice(e.target.value)} className="w-full sm:w-1/2 border border-blue-200 bg-blue-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                           </div>
                        )}
                     </div>

                     {/* VARIANTES POR COLOR */}
                     <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                           <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Palette className="w-4 h-4 text-blue-500" /> Variantes por Color</h4>
                           <button type="button" onClick={addVariant} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                             <Plus className="w-3 h-3" /> Asignar Color
                           </button>
                        </div>
                        
                        <div className="p-4 space-y-4">
                           {variants.length === 0 ? (
                              <p className="text-xs text-slate-500 text-center py-2">No hay colores asignados. El producto es único.</p>
                           ) : (
                              variants.map((v, idx) => (
                                 <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white border border-slate-100 rounded-xl p-3 shadow-sm relative pr-10">
                                    <div className="flex-1 w-full">
                                       <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Color / Tono</label>
                                       <input type="text" value={v.color} onChange={e => updateVariant(idx, 'color', e.target.value)} placeholder="Ej. Dorado, Rojo..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    
                                    <div className="shrink-0">
                                       <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Foto Variante</label>
                                       <div className="flex items-center gap-2">
                                          <label className="w-9 h-9 flex items-center justify-center bg-slate-50 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                                             <Upload className="w-4 h-4 text-slate-400" />
                                             <input type="file" accept="image/*" onChange={(e) => handleVariantImageChange(idx, e)} className="hidden" />
                                          </label>
                                          {v.imageUrl && <img src={v.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-200" />}
                                       </div>
                                    </div>

                                    <button type="button" onClick={() => removeVariant(idx)} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                                 </div>
                              ))
                           )}
                        </div>
                     </div>

                  </form>
               </div>
               
               <div className="p-6 border-t border-slate-100 shrink-0 flex items-center justify-end gap-3 bg-slate-50">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                  <button type="submit" form="productForm" disabled={isSaving} className="px-6 py-2.5 text-sm font-bold text-white bg-black hover:bg-slate-800 rounded-xl transition-colors shadow-sm disabled:opacity-50">
                    {isSaving ? 'Guardando...' : 'Guardar Producto'}
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
}
