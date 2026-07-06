import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Category } from '../types';

interface AdminCategoriesProps {
  categories: Category[];
  addCategory: (c: string) => void;
  deleteCategory: (c: string) => void;
}

export function AdminCategories({ categories, addCategory, deleteCategory }: AdminCategoriesProps) {
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
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
          <li key={category} className="flex items-center justify-between py-4">
            <span className="font-medium text-slate-900">{category}</span>
            <button
              onClick={() => {
                if(confirm(`¿Seguro que deseas eliminar la categoría "${category}"?`)) {
                  deleteCategory(category);
                }
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
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
