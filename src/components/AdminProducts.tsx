import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Filter, Image as ImageIcon, Loader2, Palette } from 'lucide-react';
import { Product, Category, Store, ProductVariant, Color } from '../types';
import { supabase } from '../supabase';

interface AdminProductsProps {
  activeStore: Store; 
  products: Product[];
  categories: Category[];
  colors: Color[]; // NUEVO: Lista de colores guardados
  addProduct: (p: Omit<Product, 'id' | 'storeId'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

interface VariantFormItem {
  id: string;
  colorId: string; // Para vincularlo con el muestrario
  imageUrl: string;
}

export function AdminProducts({ activeStore, products, categories, colors = [], addProduct, updateProduct, deleteProduct }: AdminProductsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('Todas');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [variantFiles, setVariantFiles] = useState<Record<string, File>>({});
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    inStock: true,
    variants: [] as VariantFormItem[]
  });

  const handleOpenModal = (product?: Product) => {
    setImageFile(null);
    setVariantFiles({});
    
    if (product) {
      setEditingId(product.id);
      
      // Vinculamos las variantes guardadas de vuelta con sus colorId correspondientes
      const mappedVariants = product.variants?.map(v => {
        const matchedColor = colors.find(c => c.name.toLowerCase() === v.color.toLowerCase());
        return {
          id: Math.random().toString(),
          colorId: matchedColor ? matchedColor.id : '',
          imageUrl: v.imageUrl
        };
      }) || [];

      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        imageUrl: product.imageUrl || '',
        inStock: product.inStock,
        variants: mappedVariants
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', description: '', price: '', category: categories[0]?.name || '',
        imageUrl: '', inStock: true, variants: []
      });
    }
    setIsModalOpen(true);
  };

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setFormData({ ...formData, imageUrl: URL.createObjectURL(file) });
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { id: Math.random().toString(), colorId: colors[0]?.id || '', imageUrl: '' }]
    });
  };

  const removeVariant = (idToRemove: string) => {
    setFormData({ ...formData, variants: formData.variants.filter(v => v.id !== idToRemove) });
    const newVariantFiles = { ...variantFiles };
    delete newVariantFiles[idToRemove];
    setVariantFiles(newVariantFiles);
  };

  const updateVariantColorId = (id: string, colorId: string) => {
    setFormData({
      ...formData,
      variants: formData.variants.map(v => v.id === id ? { ...v, colorId } : v)
    });
  };

  const handleVariantImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVariantFiles(prev => ({ ...prev, [id]: file }));
      setFormData({
        ...formData,
        variants: formData.variants.map(v => v.id === id ? { ...v, imageUrl: URL.createObjectURL(file) } : v)
      });
    }
  };

  const uploadFileToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `prod-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${activeStore.id}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('productos').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('productos').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // 1. Procesar imágenes de variantes primero
      const finalVariants: ProductVariant[] = [];
      for (const variant of formData.variants) {
        const matchedColorObj = colors.find(c => c.id === variant.colorId);
        if (!matchedColorObj) continue;

        let vImageUrl = variant.imageUrl;
        if (variantFiles[variant.id]) {
          vImageUrl = await uploadFileToSupabase(variantFiles[variant.id]);
        }

        finalVariants.push({
          color: matchedColorObj.name,
          colorCode: matchedColorObj.hexCode,
          imageUrl: vImageUrl
        });
      }

      // 2. Subir imagen principal si existe
      let finalMainImageUrl = formData.imageUrl;
      if (imageFile) {
        finalMainImageUrl = await uploadFileToSupabase(imageFile);
      } 
      // LÓGICA INTELIGENTE: Si no subió portada, pero hay variantes, usa la foto de la primera variante
      else if (!finalMainImageUrl && finalVariants.length > 0) {
        finalMainImageUrl = finalVariants[0].imageUrl;
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        imageUrl: finalMainImageUrl, // Podría guardarse vacío si el usuario no pone nada ni variantes, la card se protegerá sola
        inStock: formData.inStock,
        variants: finalVariants.length > 0 ? finalVariants : undefined
      };

      if (editingId) updateProduct(editingId, productData);
      else addProduct(productData);
      
      setIsModalOpen(false); setImageFile(null); setVariantFiles({});
    } catch (error: any) {
      alert(`Error guardando el producto: ${error.message}`);
    } {
      setIsUploading(false);
    }
  };

  const filteredProducts = selectedFilter === 'Todas' ? products : products.filter(product => product.category === selectedFilter);

  if (!activeStore) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase">Inventario de {activeStore.name}</h2>
          <p className="text-sm text-slate-500 mt-1 hidden sm:block">Gestiona catálogos e imágenes por variante.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto flex items-center">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 rounded-xl pl-9 pr-8 py-2.5 outline-none appearance-none cursor-pointer">
              <option value="Todas">Todas las categorías</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <button onClick={() => handleOpenModal()} className="w-full sm:w-auto bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="font-semibold pb-3 pl-2">Producto</th>
              <th className="font-semibold pb-3">Categoría</th>
              <th className="font-semibold pb-3">Muestrario</th>
              <th className="font-semibold pb-3">Precio</th>
              <th className="font-semibold pb-3">Estado</th>
              <th className="font-semibold pb-3 text-right pr-2">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 pl-2">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-slate-300" />}
                    </div>
                    <div><p className="font-bold text-base text-slate-900">{product.name}</p></div>
                  </div>
                </td>
                <td className="py-4 text-sm text-slate-600">{product.category}</td>
                <td className="py-4">
                  {product.variants && product.variants.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap max-w-[150px]">
                      {product.variants.map((v, i) => (
                        <div key={i} title={v.color} className="w-4 h-4 rounded-full border border-slate-300 shadow-sm" style={{ backgroundColor: v.colorCode }} />
                      ))}
                    </div>
                  ) : <span className="text-slate-400 text-xs">Único</span>}
                </td>
                <td className="py-4 font-semibold text-base text-slate-900">${product.price.toFixed(2)}</td>
                <td className="py-4">
                  <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.inStock ? 'En Stock' : 'Agotado'}</span>
                </td>
                <td className="py-4 pr-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenModal(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => { if(confirm('¿Eliminar producto?')) deleteProduct(product.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VISTA TARJETAS MÓVIL */}
      <div className="md:hidden flex flex-col gap-3">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white border border-slate-100 rounded-2xl p-3 flex gap-4 items-center shadow-sm">
            <div className="w-20 h-20 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
               {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-slate-300" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm truncate">{product.name}</h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">{product.category}</p>
              {product.variants && product.variants.length > 0 && (
                <div className="flex items-center gap-1 mt-1.5">
                  {product.variants.map((v, i) => <div key={i} className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: v.colorCode }} />)}
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="font-black text-slate-900 text-sm">${product.price.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 shrink-0 border-l border-slate-100 pl-3">
              <button onClick={() => handleOpenModal(product)} className="p-2 text-slate-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => { if(confirm('¿Eliminar?')) deleteProduct(product.id); }} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-bold text-slate-900">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} disabled={isUploading} className="p-2 text-slate-400 hover:text-slate-900 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Datos Principales</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} disabled={isUploading} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Precio ($)</label>
                    <input required type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} disabled={isUploading} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Categoría</label>
                    <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} disabled={isUploading} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5">
                      <option value="" disabled>Selecciona...</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descripción</label>
                  <textarea required rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} disabled={isUploading} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Imagen de Portada (Opcional si usas colores)</label>
                  <div className="flex flex-col gap-3">
                    <label className={`cursor-pointer bg-white border border-slate-200 border-dashed rounded-xl px-4 py-3 text-center transition-colors ${isUploading ? 'opacity-50' : 'hover:bg-slate-50'}`}>
                      <span className="text-sm font-medium text-blue-600">Subir foto local</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleMainImageUpload} disabled={isUploading} />
                    </label>
                    {formData.imageUrl && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                        <img src={formData.imageUrl} alt="Portada" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECCIÓN VARIANTES UTILIZANDO EL DICCIONARIO */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-blue-600" /> Variantes por Color
                  </h4>
                  {colors.length > 0 ? (
                    <button type="button" onClick={addVariant} disabled={isUploading} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                      + Asignar Color
                    </button>
                  ) : (
                    <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg">Registra colores primero en el menú lateral</span>
                  )}
                </div>

                {formData.variants.length > 0 && (
                  <div className="space-y-3">
                    {formData.variants.map((variant) => {
                      const currentSelectedColor = colors.find(c => c.id === variant.colorId);
                      return (
                        <div key={variant.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row gap-4 relative items-center">
                          <div className="w-full sm:w-1/2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Selecciona el Color</label>
                            <div className="flex gap-2 items-center">
                              <div className="w-6 h-6 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: currentSelectedColor?.hexCode || '#ccc' }} />
                              <select value={variant.colorId} onChange={(e) => updateVariantColorId(variant.id, e.target.value)} disabled={isUploading} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none">
                                {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex-1 flex items-center gap-3 w-full">
                            <div className="flex-1">
                               <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Foto para esta variante</label>
                               <label className="cursor-pointer bg-white border border-slate-200 rounded-lg px-3 py-2 text-center text-xs font-bold text-slate-700 hover:bg-slate-100 block w-full">
                                  Subir Foto de Variante
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleVariantImageUpload(variant.id, e)} disabled={isUploading} required={!formData.imageUrl && formData.variants[0]?.id === variant.id} />
                               </label>
                            </div>
                            {variant.imageUrl && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                                <img src={variant.imageUrl} alt="Variante" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                          <button type="button" onClick={() => removeVariant(variant.id)} disabled={isUploading} className="absolute -top-2 -right-2 bg-white border border-slate-200 text-slate-400 p-1.5 rounded-full hover:text-red-600"><X className="w-3 h-3" /></button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.inStock} onChange={(e) => setFormData({...formData, inStock: e.target.checked})} disabled={isUploading} className="w-5 h-5 rounded border-slate-300 text-black accent-black" />
                  <span className="text-sm font-medium text-slate-700">Producto disponible (En Stock)</span>
                </label>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} disabled={isUploading} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200">Cancelar</button>
              <button type="submit" disabled={isUploading} className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 inline-flex items-center justify-center min-w-[140px]">
                {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</> : 'Guardar Producto'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
