import { useState } from 'react';
import { Store as StoreIcon, Plus, X, Edit2, Trash2, Link as LinkIcon, Image as ImageIcon, MessageCircle, Instagram, FileText } from 'lucide-react';
import { Store } from '../types';

interface AdminStoresProps {
  stores: Store[];
  addStore: (store: Omit<Store, 'id'>) => Promise<void>;
  updateStore: (id: string, data: Partial<Store>) => Promise<void>;
  deleteStore: (id: string) => Promise<void>;
}

export function AdminStores({ stores, addStore, updateStore, deleteStore }: AdminStoresProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logoUrl: '',
    description: '',
    whatsapp: '',
    instagram: ''
  });

  const openNewModal = () => {
    setEditingStore(null);
    setFormData({ name: '', slug: '', logoUrl: '', description: '', whatsapp: '', instagram: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name || '',
      slug: store.slug || '',
      logoUrl: store.logoUrl || '',
      description: store.description || '',
      whatsapp: store.whatsapp || '',
      instagram: store.instagram || ''
    });
    setIsModalOpen(true);
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData(prev => ({ ...prev, name: newName, slug: editingStore ? prev.slug : generateSlug(newName) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) return alert('El nombre y el enlace (slug) son obligatorios.');
    
    setIsSaving(true);
    try {
      if (editingStore) {
        await updateStore(editingStore.id, formData);
      } else {
        await addStore(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert('Error al guardar la tienda');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿ESTÁS SEGURO? Eliminar la tienda "${name}" es una acción irreversible y podrías perder el acceso a sus productos.`)) {
      await deleteStore(id);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-8">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase">Mis Tiendas / Catálogos</h2>
          <p className="text-sm text-slate-500 mt-1">Crea y administra tus catálogos independientes.</p>
        </div>
        <button onClick={openNewModal} className="bg-black hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-5 h-5" /> Nueva Tienda
        </button>
      </div>

      {/* GRILLA DE TIENDAS */}
      {stores.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
          <StoreIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">Aún no tienes tiendas creadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map(store => (
            <div key={store.id} className="border border-slate-200 rounded-3xl p-5 hover:shadow-xl transition-all duration-300 bg-white group flex flex-col">
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                  {store.logoUrl ? (
                    <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                  ) : (
                    <StoreIcon className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditModal(store)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Editar Tienda">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(store.id, store.name)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar Tienda">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900 uppercase truncate">{store.name}</h3>
                {store.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{store.description}</p>}
                
                {/* Redes Sociales Icons */}
                <div className="flex items-center gap-3 mt-3">
                  {store.whatsapp && <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md"><MessageCircle className="w-3 h-3" /> Configurado</div>}
                  {store.instagram && <div className="flex items-center gap-1 text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded-md"><Instagram className="w-3 h-3" /> Configurado</div>}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs font-mono text-slate-600 truncate">/catalogo/{store.slug}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-black uppercase text-slate-800">
                {editingStore ? 'Editar Tienda' : 'Nueva Tienda'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Nombre de Tienda *</label>
                  <div className="relative">
                    <StoreIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" required value={formData.name} onChange={handleNameChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="Ej. Vasr Link" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Enlace (Slug) *</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="ej-vasr-link" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Logo de la Tienda (URL)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="url" value={formData.logoUrl} onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="https://ejemplo.com/logo.png" />
                </div>
                {formData.logoUrl && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 inline-block">
                    <img src={formData.logoUrl} alt="Vista previa logo" className="h-12 object-contain" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Descripción / Subtítulo</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <textarea rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none" placeholder="Una breve descripción para tus clientes..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">WhatsApp</label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="584120000000" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Instagram</label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" value={formData.instagram} onChange={e => setFormData({ ...formData, instagram: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" placeholder="@tutienda" />
                  </div>
                </div>
              </div>
              
            </form>

            <div className="p-6 border-t border-slate-100 shrink-0 flex justify-end gap-3 bg-slate-50 rounded-b-[2rem]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={isSaving} className="px-5 py-2.5 text-sm font-bold text-white bg-black hover:bg-slate-800 rounded-xl transition-colors shadow-md disabled:opacity-50">
                {isSaving ? 'Guardando...' : (editingStore ? 'Guardar Cambios' : 'Crear Tienda')}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
