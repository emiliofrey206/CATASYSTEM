import { useState } from 'react';
import { LayoutList, Edit2, Trash2, Plus, X, ArrowUp, ArrowDown, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { Store, Category } from '../types';
import { supabase } from '../supabase';

interface AdminCategoriesProps {
  activeStore: Store;
  categories: Category[];
  addCategory: (data: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export function AdminCategories({ activeStore, categories, addCategory, updateCategory, deleteCategory }: AdminCategoriesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Ordenamos las categorías por su número de 'order'
  const sortedCategories = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setImageUrl('');
    setImageFile(null);
  };

  const handleEdit = (cat: Category) => {
    setIsEditing(true);
    setEditingId(cat.id);
    setName(cat.name);
    setImageUrl(cat.imageUrl || '');
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `cat-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${activeStore.id}/${fileName}`;
    const { error } = await supabase.storage.from('categorias').upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from('categorias').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      let finalImageUrl = imageUrl;
      if (imageFile) finalImageUrl = await uploadImage(imageFile);

      if (isEditing && editingId) {
        await updateCategory(editingId, { name, imageUrl: finalImageUrl });
      } else {
        // Le asignamos un orden al final de la lista al crearla
        const maxOrder = sortedCategories.length > 0 ? Math.max(...sortedCategories.map(c => c.order || 0)) : 0;
        await addCategory({ storeId: activeStore.id, name, imageUrl: finalImageUrl, order: maxOrder + 10 });
      }
      resetForm();
    } catch (error) {
      console.error(error);
      alert('Error al guardar la categoría');
    } finally {
      setIsSaving(false);
    }
  };

  // LA MAGIA DE REORDENAR
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sortedCategories.length - 1) return;

    // Nos aseguramos de que todas tengan un orden base para evitar errores matemáticos
    const items = sortedCategories.map((c, i) => ({ ...c, order: c.order ?? i * 10 }));
    
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Intercambiamos los números de orden
    const tempOrder = items[index].order;
    items[index].order = items[swapIndex].order;
    items[swapIndex].order = tempOrder;

    // Guardamos los dos cambios en la base de datos
    await updateCategory(items[index].id, { order: items[index].order });
    await updateCategory(items[swapIndex].id, { order: items[swapIndex].order });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 uppercase">Categorías</h2>
        <p className="text-sm text-slate-500 mt-1">Organiza y ordena las secciones de {activeStore.name}.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-6">
              <LayoutList className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-black uppercase text-slate-800">{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Nombre de Categoría</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} disabled={isSaving} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej. Anillos, Cadenas..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Foto (Opcional)</label>
                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <label className="flex items-center justify-center gap-2 text-xs font-bold text-blue-600 cursor-pointer hover:bg-blue-50 py-2.5 rounded-lg border border-dashed border-blue-200 transition-colors">
                    <Upload className="w-4 h-4" /> Subir Imagen
                    <input type="file" accept="image/*" onChange={handleImageChange} disabled={isSaving} className="hidden" />
                  </label>
                  {imageUrl && (
                    <div className="mt-3 relative inline-block">
                      <img src={imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm" />
                      <button type="button" onClick={() => { setImageUrl(''); setImageFile(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button type="submit" disabled={isSaving} className="w-full bg-black hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4"/> Guardar</>}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} disabled={isSaving} className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="flex-1">
          {sortedCategories.length === 0 ? (
             <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50">
               <p className="text-slate-500 font-medium">No hay categorías. Crea la primera.</p>
             </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedCategories.map((cat, index) => (
                <div key={cat.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-4 hover:shadow-md transition-shadow">
                  
                  {/* BOTONES PARA REORDENAR */}
                  <div className="flex flex-col gap-1 shrink-0 bg-slate-50 rounded-lg p-1 border border-slate-100">
                    <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="p-1 text-slate-400 hover:text-black disabled:opacity-30 transition-colors"><ArrowUp className="w-4 h-4" /></button>
                    <button onClick={() => handleMove(index, 'down')} disabled={index === sortedCategories.length - 1} className="p-1 text-slate-400 hover:text-black disabled:opacity-30 transition-colors"><ArrowDown className="w-4 h-4" /></button>
                  </div>

                  <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-slate-300" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 uppercase truncate">{cat.name}</h4>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleEdit(cat)} className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { if(window.confirm(`¿Eliminar ${cat.name}?`)) deleteCategory(cat.id); }} className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
