import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Category, Store } from '../types';
import { supabase } from '../supabase';

interface AdminCategoriesProps {
  activeStore: Store;
  categories: Category[];
  addCategory: (c: Omit<Category, 'id' | 'storeId'>) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

export function AdminCategories({ activeStore, categories = [], addCategory, updateCategory, deleteCategory }: AdminCategoriesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Estados para la imagen
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });

  if (!activeStore) return null;

  const handleOpenModal = (categoryToEdit?: Category) => {
    setImageFile(null);
    if (categoryToEdit) {
      setEditingId(categoryToEdit.id);
      setFormData({
        name: categoryToEdit.name || '',
        description: categoryToEdit.description || '',
        imageUrl: categoryToEdit.imageUrl || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '', imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setFormData({ ...formData, imageUrl: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `cat-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${activeStore.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('productos')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('productos').getPublicUrl(filePath);
        finalImageUrl = data.publicUrl;
      }

      const categoryData = {
        name: formData.name,
        description: formData.description,
        imageUrl: finalImageUrl,
        parentId: null // Forzamos nulo para mantener la base de datos limpia de subcategorías
      };

      if (editingId) {
        updateCategory(editingId, categoryData);
      } else {
        addCategory(categoryData);
      }
      
      setIsModalOpen(false);
      setImageFile(null);
    } catch (error: any) {
      alert(`Error subiendo la imagen: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase">Categorías</h2>
          <p className="text-sm text-slate-500 mt-1">Administra las categorías de tu catálogo.</p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white border border-slate-200 rounded-2xl flex items-center p-4 gap-4 shadow-sm hover:border-slate-300 transition-colors">
            
            <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
              {category.imageUrl ? (
                <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-300" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-base truncate">{category.name}</h3>
              {category.description && (
                <p className="text-xs text-slate-500 truncate mt-0.5">{category.description}</p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 border-l border-slate-100 pl-3">
              <button
                onClick={() => handleOpenModal(category)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if(confirm(`¿Seguro que deseas eliminar "${category.name}"?`)) {
                    deleteCategory(category.id);
                  }
                }}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm bg-slate-50 rounded-xl border border-slate-100/50">
            No hay categorías registradas. Crea la primera para empezar a organizar.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isUploading}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nombre de Categoría</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={isUploading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Descripción (Opcional)</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  disabled={isUploading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 resize-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Imagen Referencial</label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <label className={`flex-1 cursor-pointer bg-white border border-slate-200 border-dashed rounded-xl px-4 py-4 text-center transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}>
                      <span className="text-sm font-medium text-blue-600">Subir foto local</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                    <span className="text-xs text-slate-400 font-medium uppercase">O</span>
                    <input
                      type="text"
                      placeholder="Pegar URL externa..."
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({...formData, imageUrl: e.target.value});
                        setImageFile(null);
                      }}
                      disabled={isUploading}
                      className="flex-[2] bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 disabled:opacity-50"
                    />
                  </div>
                  
                  {formData.imageUrl && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={formData.imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isUploading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 inline-flex items-center justify-center min-w-[140px]"
              >
                {isUploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
