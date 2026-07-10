import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Image as ImageIcon, Loader2, ChevronDown, ChevronUp, CornerDownRight } from 'lucide-react';
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
  
  // Estado para controlar qué categorías están desplegadas (Acordeón)
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  // Estados para la imagen
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    parentId: '' 
  });

  if (!activeStore) return null;

  // Filtramos para separar las principales de las hijas
  const mainCategories = categories.filter(c => !c.parentId);
  const getSubcategories = (parentId: string) => categories.filter(c => c.parentId === parentId);

  const toggleExpand = (id: string) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Ajustamos la función para que reciba un padre predefinido si hacemos clic en el "+" de una tarjeta
  const handleOpenModal = (categoryToEdit?: Category, preselectedParentId?: string) => {
    setImageFile(null);
    if (categoryToEdit) {
      setEditingId(categoryToEdit.id);
      setFormData({
        name: categoryToEdit.name || '',
        description: categoryToEdit.description || '',
        imageUrl: categoryToEdit.imageUrl || '',
        parentId: categoryToEdit.parentId || ''
      });
    } else {
      setEditingId(null);
      setFormData({ 
        name: '', 
        description: '', 
        imageUrl: '', 
        parentId: preselectedParentId || '' 
      });
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
        parentId: formData.parentId === '' ? null : formData.parentId
      };

      if (editingId) {
        updateCategory(editingId, categoryData);
      } else {
        addCategory(categoryData);
        // Si creamos una subcategoría, desplegamos automáticamente al padre para verla
        if (categoryData.parentId) {
          setExpandedCats(prev => ({ ...prev, [categoryData.parentId as string]: true }));
        }
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
          <p className="text-sm text-slate-500 mt-1">Estructura y organiza tu catálogo en niveles.</p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Nueva Categoría
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {mainCategories.map((category) => {
          const subcats = getSubcategories(category.id);
          const isExpanded = expandedCats[category.id];

          return (
            <div key={category.id} className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
              
              {/* CABECERA: Categoría Principal */}
              <div className="p-4 flex gap-4 items-center bg-white relative z-10">
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
                  {subcats.length > 0 && (
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-1.5">
                      {subcats.length} subcategorías
                    </p>
                  )}
                </div>

                {/* BOTONES DE ACCIÓN (Alineados a la derecha) */}
                <div className="flex items-center gap-1 shrink-0">
                  
                  {/* Botón rápido para agregar subcategoría directa */}
                  <button
                    onClick={() => handleOpenModal(undefined, category.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-black hover:bg-slate-100 rounded-lg transition-colors mr-2 border border-slate-200"
                    title="Agregar subcategoría a esta rama"
                  >
                    <Plus className="w-3.5 h-3.5" /> Sub
                  </button>

                  <button
                    onClick={() => handleOpenModal(category)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if(confirm(`¿Seguro que deseas eliminar "${category.name}"? Sus subcategorías quedarán huérfanas.`)) {
                        deleteCategory(category.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Flecha de Despliegue (Solo aparece si hay subcategorías) */}
                  {subcats.length > 0 && (
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                  )}
                  {subcats.length > 0 && (
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className={`p-2 rounded-lg transition-colors ${isExpanded ? 'text-black bg-slate-100' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* LISTA DESPLEGABLE: Subcategorías */}
              {isExpanded && subcats.length > 0 && (
                <div className="bg-slate-50 border-t border-slate-100 px-4 py-2">
                  <div className="pl-20 pr-4"> {/* Alineación indentada para que parezca un árbol */}
                    {subcats.map((sub, index) => (
                      <div key={sub.id} className={`flex justify-between items-center py-3 ${index !== subcats.length - 1 ? 'border-b border-slate-200/60' : ''}`}>
                        <div className="flex items-center gap-3">
                          <CornerDownRight className="w-4 h-4 text-slate-400 shrink-0" />
                          <div>
                            <span className="text-sm font-bold text-slate-700">{sub.name}</span>
                            {sub.description && <p className="text-xs text-slate-500 mt-0.5">{sub.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleOpenModal(sub)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { if(confirm(`¿Eliminar la subcategoría "${sub.name}"?`)) deleteCategory(sub.id); }} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {mainCategories.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-sm bg-slate-50 rounded-xl border border-slate-100/50">
            No hay categorías registradas. Crea la primera para empezar a organizar.
          </div>
        )}
      </div>

      {/* Modal (Se mantiene exactamente igual) */}
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Categoría Padre (Opcional)
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                  disabled={isUploading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 disabled:opacity-50"
                >
                  <option value="">Ninguna (Es una categoría principal)</option>
                  {categories
                    .filter(c => c.id !== editingId && !c.parentId) // Solo mostramos categorías principales como posibles padres
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">Selecciona una si quieres que esta sea una subcategoría (Ej: Cadenas de Oro dentro de Cadenas).</p>
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
