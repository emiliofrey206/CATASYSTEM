import { useState } from 'react';
import { Plus, Trash2, Palette } from 'lucide-react';
import { Color, Store } from '../types';

interface AdminColorsProps {
  activeStore: Store;
  colors: Color[];
  addColor: (c: Omit<Color, 'id' | 'storeId'>) => void;
  deleteColor: (id: string) => void;
}

export function AdminColors({ activeStore, colors = [], addColor, deleteColor }: AdminColorsProps) {
  const [name, setName] = useState('');
  const [hexCode, setHexCode] = useState('#ffd700');

  if (!activeStore) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addColor({ name: name.trim(), hexCode });
    setName('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase">Muestrario de Colores</h2>
        <p className="text-sm text-slate-500 mt-1">Define la paleta de tonos para los productos de {activeStore.name}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Formulario de creación */}
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-600" /> Nuevo Color
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre Comercial</label>
            <input required type="text" placeholder="Ej. Oro Amarillo, Plata Fina" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tono Visual</label>
            <div className="flex gap-2">
              <input type="color" value={hexCode} onChange={(e) => setHexCode(e.target.value)} className="w-12 h-10 p-0 border-0 rounded-xl cursor-pointer shrink-0" />
              <input type="text" value={hexCode.toUpperCase()} onChange={(e) => setHexCode(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none uppercase" />
            </div>
          </div>
          <button type="submit" className="w-full bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
            <Plus className="w-4 h-4" /> Registrar Color
          </button>
        </form>

        {/* Lista de colores ya guardados */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {colors.map((color) => (
            <div key={color.id} className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between shadow-sm group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full border border-slate-300 shadow-inner shrink-0" style={{ backgroundColor: color.hexCode }} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{color.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono uppercase">{color.hexCode}</p>
                </div>
              </div>
              <button onClick={() => { if(confirm(`¿Eliminar el color ${color.name}?`)) deleteColor(color.id); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {colors.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-2xl">
              No tienes colores registrados todavía.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
