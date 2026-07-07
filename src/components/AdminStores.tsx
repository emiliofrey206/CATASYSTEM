import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Store as StoreIcon } from 'lucide-react';
import { Store } from '../types';

interface AdminStoresProps {
  stores: Store[];
  addStore: (s: Omit<Store, 'id'>) => void;
  updateStore: (id: string, s: Partial<Store>) => void;
  deleteStore: (id: string) => void;
}

export function AdminStores({ stores, addStore, updateStore, deleteStore }: AdminStoresProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', logoUrl: '' });

  const handleOpenModal = (store?: Store) => {
    if (store) {
      setEditingId(store.id);
      setFormData({ name: store.name, slug: store.slug, description: store.description || '', logoUrl: store.logoUrl || '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', slug: '', description: '', logoUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, name, slug });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) updateStore(editingId, formData);
    else addStore(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mis Tiendas / Catálogos</h2>
          <p className="text-sm text-slate-500 mt-1">Crea enlaces independientes para tus clientes.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 hover:bg-slate-800 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Nueva Tienda
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div key={store.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow relative bg-slate-50 group">
            <div className="w-16 h-16 bg-white border border-slate-200 text-blue-600 rounded-xl flex items-center justify-center mb-4 overflow-hidden shadow-sm">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <StoreIcon className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{store.name}</h3>
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{store.description || 'Sin descripción'}</p>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs font-mono text-slate-500 bg-slate-200/50 p-2 rounded-lg truncate">/catalogo/{store.slug}</p>
            </div>
            
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleOpenModal(store)} className="p-2 bg-white text-slate-600 shadow-sm hover:text-blue-600 rounded-lg">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => { if(confirm('¿Eliminar esta tienda? Se perderán sus productos.')) deleteStore(store.id); }} className="p-2 bg-white text-slate-600 shadow-sm hover:text-red-600 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] w-full max-w-md shadow-xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">{editingId ? 'Editar Tienda' : 'Nueva Tienda'}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nombre de la Tienda</label>
                <input required type="text" value={formData.name} onChange={handleNameChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5" placeholder="Ej: Ropa Express" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Logo de la Tienda</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <StoreIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer bg-white border border-slate-200 border-dashed rounded-xl px-4 py-3 text-center hover:bg-slate-50 transition-colors">
                    <span className="text-sm font-medium text-blue-600">Subir Logo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Enlace del Catálogo (Slug)</label>
                <input required type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase()})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono text-blue-600 focus:outline-none focus:ring-2 focus:ring-black/5" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Descripción</label>
                <textarea rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none" />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200">Cancelar</button>
              <button type="submit" className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800">Guardar Tienda</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
