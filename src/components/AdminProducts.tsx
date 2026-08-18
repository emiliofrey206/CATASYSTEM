import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Filter, Search, Eye, EyeOff, Image as ImageIcon, Loader2, Palette, Tag } from 'lucide-react';
import { Product, Category, Store, ProductVariant, Color, StockStatus } from '../types';
import { supabase } from '../supabase';

interface AdminProductsProps {
  activeStore: Store; 
  products: Product[];
  categories: Category[];
  colors: Color[];
  addProduct: (p: Omit<Product, 'id' | 'storeId'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

interface VariantFormItem {
  id: string;
  colorId: string;
  imageUrl: string;
  stockStatus: string; 
  stockQuantity: number | string;
}

export function AdminProducts({ activeStore, products, categories, colors = [], addProduct, updateProduct, deleteProduct }: AdminProductsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('Todas');
  const [visibilityFilter, setVisibilityFilter] = useState<'todos' | 'visibles' | 'ocultos'>('todos');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [variantFiles, setVariantFiles] = useState<Record<string, File>>({});
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: '', imageUrl: '',
    stockStatus: 'disponible' as StockStatus,
    stockQuantity: 0 as number | string,
    isOffer: false, offerPrice: '', isHidden: false,
    variants: [] as VariantFormItem[]
  });

  const handleOpenModal = (product?: Product) => {
    setImageFile(null); setVariantFiles({});
    if (product) {
      setEditingId(product.id);
      const mappedVariants = product.variants?.map(v => {
        const matchedColor = colors.find(c => c.name.toLowerCase() === v.color.toLowerCase());
        return { 
          id: Math.random().toString(), colorId: matchedColor ? matchedColor.id : '', imageUrl: v.imageUrl || '',
          stockStatus: (v as any).stockStatus || 'disponible',
          stockQuantity: v.stockQuantity || 0
        };
      }) || [];

      let currentStock: StockStatus = product.stockStatus;
      if (!currentStock) currentStock = product.inStock === false ? 'agotado' : 'disponible';

      setFormData({
        name: product.name, description: product.description, price: product.price.toString(),
        category: product.category || (categories[0]?.name || ''), imageUrl: product.imageUrl || '',
        stockStatus: currentStock, stockQuantity: product.stockQuantity || 0,
        isOffer: product.isOffer || false, offerPrice: product.offerPrice ? product.offerPrice.toString() : '',
        isHidden: product.isHidden || false, variants: mappedVariants
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', description: '', price: '', category: categories[0]?.name || '', imageUrl: '', 
        stockStatus: 'disponible', stockQuantity: 0, isOffer: false, offerPrice: '', isHidden: false, variants: []
      });
    }
    setIsModalOpen(true);
  };

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { setImageFile(file); setFormData({ ...formData, imageUrl: URL.createObjectURL(file) }); } };
  const addVariant = () => setFormData({ ...formData, variants: [...formData.variants, { id: Math.random().toString(), colorId: colors[0]?.id || '', imageUrl: '', stockStatus: 'disponible', stockQuantity: 0 }] });
  const removeVariant = (idToRemove: string) => { setFormData({ ...formData, variants: formData.variants.filter(v => v.id !== idToRemove) }); const newVariantFiles = { ...variantFiles }; delete newVariantFiles[idToRemove]; setVariantFiles(newVariantFiles); };
  const updateVariantField = (id: string, field: keyof VariantFormItem, value: string) => { setFormData({ ...formData, variants: formData.variants.map(v => v.id === id ? { ...v, [field]: value } : v) }); };
  const handleVariantImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { setVariantFiles(prev => ({ ...prev, [id]: file })); updateVariantField(id, 'imageUrl', URL.createObjectURL(file)); } };

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
      const finalVariants: any[] = [];
      for (const variant of formData.variants) {
        const matchedColorObj = colors.find(c => c.id === variant.colorId);
        if (!matchedColorObj) continue;
        let vImageUrl = variant.imageUrl;
        if (variantFiles[variant.id]) vImageUrl = await uploadFileToSupabase(variantFiles[variant.id]);
        
        finalVariants.push({ 
          color: matchedColorObj.name, colorCode: (matchedColorObj as any).hexCode || (matchedColorObj as any).colorCode, imageUrl: vImageUrl,
          stockStatus: variant.stockStatus,
          stockQuantity: parseInt(variant.stockQuantity.toString()) || 0
        });
      }

      let finalMainImageUrl = formData.imageUrl;
      if (imageFile) finalMainImageUrl = await uploadFileToSupabase(imageFile);
      else if (!finalMainImageUrl && finalVariants.length > 0) finalMainImageUrl = finalVariants[0].imageUrl;

      const productData = {
        name: formData.name, description: formData.description, price: parseFloat(formData.price) || 0,
        category: formData.category, imageUrl: finalMainImageUrl,
        stockStatus: formData.stockStatus,
        stockQuantity: parseInt(formData.stockQuantity.toString()) || 0,
        isOffer: formData.isOffer, offerPrice: formData.isOffer && formData.offerPrice ? parseFloat(formData.offerPrice) : undefined,
        isHidden: formData.isHidden, variants: finalVariants.length > 0 ? finalVariants : undefined
      };

      if (editingId) updateProduct(editingId, productData);
      else addProduct(productData);
      
      setIsModalOpen(false); setImageFile(null); setVariantFiles({});
    } catch (error: any) { alert(`Error guardando el producto: ${error.message}`); } 
    finally { setIsUploading(false); }
  };

  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedFilter === 'Todas' ? true : product.category === selectedFilter;
    const matchVis = visibilityFilter === 'todos' ? true : (visibilityFilter === 'ocultos' ? product.isHidden : !product.isHidden);
    return matchSearch && matchCat && matchVis;
  });

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'disponible': return <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-1 rounded-md text-[10px] font-black uppercase">Disponible</span>;
      case 'pocas_unidades': return <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 px-2 py-1 rounded-md text-[10px] font-black uppercase">Pocas Unid.</span>;
      case 'agotado': return <span className="bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 px-2 py-1 rounded-md text-[10px] font-black uppercase">Agotado</span>;
      default: return <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-md text-[10px] font-black uppercase">Disponible</span>;
    }
  };

  if (!activeStore) return null;

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#151821] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Inventario</h2>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Gestiona tus productos y existencias</p>
        </div>
        <button onClick={() => handleOpenModal()} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95">
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full bg-white dark:bg-[#151821] p-3 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-400" /></div>
          <input type="text" placeholder="Buscar por nombre..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-white/5 text-sm font-bold text-slate-900 dark:text-white rounded-xl sm:rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-48">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Filter className="h-4 w-4 text-slate-400" /></div>
            <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="w-full bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-white/5 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider rounded-xl sm:rounded-2xl pl-10 pr-8 py-3 outline-none appearance-none cursor-pointer">
              <option value="Todas">Categorías (Todas)</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="relative w-full sm:w-48">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Eye className="h-4 w-4 text-slate-400" /></div>
            <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value as any)} className="w-full bg-slate-50 dark:bg-[#11131A] border border-slate-200 dark:border-white/5 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider rounded-xl sm:rounded-2xl pl-10 pr-8 py-3 outline-none appearance-none cursor-pointer">
              <option value="todos">Estado (Todos)</option>
              <option value="visibles">Solo Visibles</option>
              <option value="ocultos">Solo Ocultos</option>
            </select>
          </div>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto bg-white dark:bg-[#151821] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-[#11131A] border-b border-slate-200 dark:border-white/5">
            <tr className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest">
              <th className="py-4 pl-6 text-center w-20">Visible</th>
              <th className="py-4 pl-4">Producto</th>
              <th className="py-4">Categoría</th>
              <th className="py-4">Stock</th>
              <th className="py-4">Precio</th>
              <th className="py-4 text-right pr-6">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredProducts.map((product) => { 
              const actualStock = product.stockStatus || (product.inStock === false ? 'agotado' : 'disponible'); 
              const isHidden = product.isHidden; 
              return (
                <tr key={product.id} className={`transition-colors ${isHidden ? 'bg-slate-50/50 dark:bg-white/5 opacity-60' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                  <td className="py-4 pl-6 text-center">
                    <button onClick={() => updateProduct(product.id, { isHidden: !isHidden })} className={`p-2 rounded-xl transition-all shadow-sm ${isHidden ? 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'}`} title={isHidden ? 'Oculto (Clic para mostrar)' : 'Visible (Clic para ocultar)'}>
                      {isHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </td>
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-[#11131A] flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-white/5">
                        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-slate-300 dark:text-slate-600" />}
                      </div>
                      <div>
                        <p className={`font-bold text-sm flex items-center gap-2 ${isHidden ? 'text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                          {product.name} {product.isOffer && <Tag className="w-3.5 h-3.5 text-red-500" />}
                        </p>
                        {product.variants && product.variants.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5">
                            {product.variants.map((v, i) => { 
                              const masterColor = colors.find(c => c.name.trim().toLowerCase() === v.color.trim().toLowerCase()); 
                              const hexColor = masterColor ? ((masterColor as any).hexCode || (masterColor as any).colorCode) : (v.colorCode || '#e2e8f0'); 
                              const isVariantAgotado = (v as any).stockStatus === 'agotado'; 
                              return (
                                <div key={i} title={`${v.color} - Qty: ${v.stockQuantity||0}`} className={`w-3 h-3 rounded-full border border-slate-300 dark:border-white/20 shadow-sm relative overflow-hidden ${isVariantAgotado ? 'opacity-40' : ''}`} style={{ backgroundColor: hexColor }}>
                                  {isVariantAgotado && <div className="absolute inset-0 w-full h-full bg-red-500 transform rotate-45 scale-y-[0.3]"></div>}
                                </div>
                              ); 
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">{product.category}</td>
                  <td className="py-4">
                    <div className="flex flex-col items-start gap-1">
                      {getStockBadge(actualStock)}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.stockQuantity || 0} unid.</span>
                    </div>
                  </td>
                  <td className="py-4">
                    {product.isOffer && product.offerPrice ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 line-through">${product.price.toFixed(2)}</span>
                        <span className="font-black text-sm text-red-600 dark:text-red-400">${product.offerPrice.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="font-black text-sm text-slate-900 dark:text-white">${product.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="py-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(product)} className="p-2.5 text-slate-400 hover:text-blue-600 bg-slate-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => { if(confirm('¿Eliminar producto?')) deleteProduct(product.id); }} className="p-2.5 text-slate-400 hover:text-red-600 bg-slate-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {filteredProducts.map((product) => { 
          const actualStock = product.stockStatus || (product.inStock === false ? 'agotado' : 'disponible'); 
          const isHidden = product.isHidden; 
          return (
            <div key={product.id} className={`bg-white dark:bg-[#151821] border border-slate-200 dark:border-white/5 rounded-3xl p-4 flex flex-col gap-4 shadow-sm ${isHidden ? 'opacity-60 bg-slate-50 dark:bg-[#11131A]' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-[#0B0E14] flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-white/5 relative">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-slate-300 dark:text-slate-600" />}
                  {product.isOffer && <div className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><Tag className="w-3 h-3" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate leading-tight">{product.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1 mb-2 truncate">{product.category}</p>
                  <div className="flex items-center gap-2">
                    {product.isOffer && product.offerPrice ? (
                      <span className="font-black text-red-600 dark:text-red-400 text-base">${product.offerPrice.toFixed(2)}</span>
                    ) : (
                      <span className="font-black text-slate-900 dark:text-white text-base">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex flex-col items-start gap-1">
                  {getStockBadge(actualStock)}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateProduct(product.id, { isHidden: !isHidden })} className={`p-