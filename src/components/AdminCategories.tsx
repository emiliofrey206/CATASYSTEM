import { useState } from 'react';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { Category } from '../types';

interface AdminCategoriesProps {
  categories: Category[];
  addCategory: (name: string) => void;
  updateCategory: (id: string, newName: string) => void;
  deleteCategory: (id: string) => void;
}

export function AdminCategories({ categories, addCategory, updateCategory, deleteCategory }: AdminCategoriesProps) {
  const [newCategory, setNewCategory] = useState('');
  
  // Estados para controlar qué categoría se está editando
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      updateCategory(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Categorías</h2>
        <p className="text-sm text-slate-500 mt-1">Administra las categorías de tus productos.</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-3 mb-8">
        <input
          type="text"
          required
          placeholder="Nueva categoría..."
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300"
        />
        <button
          type="submit"
          className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 hover:bg-slate-800 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </form>

      <ul className="divide-y divide-slate-100">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center justify-between py-4">
            {editingId === category.id ? (
              // MODO EDICIÓN
              <div className="flex flex-1 items-center gap-3 mr-4">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 bg-white border border-blue-500 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(category.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                />
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    type="button" /* <-- AJUSTE APLICADO */
                    onClick={() => handleSaveEdit(category.id)} 
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                    title="Guardar"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    type="button" /* <-- AJUSTE APLICADO */
                    onClick={() => setEditingId(null)} 
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" 
                    title="Cancelar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              // MODO LECTURA NORMAL
              <>
                <span className="font-medium text-slate-900">{category.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startEditing(category)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if(confirm(`¿Seguro que deseas eliminar la categoría "${category.name}"?`)) {
                        deleteCategory(category.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
        {categories.length === 0 && (
          <li className="py-8 text-center text-slate-500 text-sm">
            No hay categorías registradas.
          </li>
        )}
      </ul>
    </div>
  );
}
