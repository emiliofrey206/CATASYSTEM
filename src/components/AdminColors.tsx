import { useState } from 'react';
import { Palette, Edit2, Trash2, Plus, X } from 'lucide-react';
import { Store, Color } from '../types';

interface AdminColorsProps {
  activeStore: Store;
  colors: Color[];
  addColor: (color: Omit<Color, 'id'>) => Promise<void>;
  updateColor: (id: string, data: Partial<Color>) => Promise<void>;
  deleteColor: (id: string) => Promise<void>;
}

export function AdminColors({ activeStore, colors, addColor, updateColor, deleteColor }: AdminColorsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [colorCode, setColorCode] = useState('#000000');
  const [isSaving, setIsSaving] = useState(false);

  // Carga los datos del color seleccionado en el formulario
  const handleEdit = (color: Color) => {
    setIsEditing(true);
    setEditingId(color.id);
    setName(color.name);
    setColorCode(color.colorCode || '#000000');
  };

  // Limpia el formulario y vuelve a "Nuevo Color"
  const handleCancel = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setColorCode('#000000');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      if (isEditing && editingId) {
        await updateColor(editingId, { name, colorCode });
      } else {
        await addColor({ name, colorCode, storeId: activeStore.id });
      }
      handleCancel(); // Limpiamos al terminar
    } catch (error) {
      alert('Error al guardar el color');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, colorName: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar el color "${colorName}"?`)) {
      await deleteColor(id);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 uppercase">Muestrario de Colores</h2>
        <p className="text-sm text-slate-500 mt-1">Define la paleta de tonos para los productos de {activeStore.name}.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* FORMULARIO LATERAL */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-6">
              <Palette className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-black uppercase text-slate-800">
                {isEditing ? 'Editar Color' : 'Nuevo Color'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Nombre Comercial</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Ej. Oro Amarillo, Plata Fina" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Tono Visual</label>
                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                  <input type="color" value={colorCode} onChange={e => setColorCode(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                  <input type="text" value={colorCode} onChange={e => setColorCode(e.target.value)} className="flex-1 text-sm font-mono border-none focus:outline-none uppercase" placeholder="#000000" />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button type="submit" disabled={isSaving} className="w-full bg-black hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {isEditing ? 'Guardar Cambios' : <><Plus className="w-4 h-4"/> Registrar Color</>}
                </button>
                {isEditing && (
                  <button type="button" onClick={handleCancel} className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* LISTA DE COLORES (CON HOVER DE EDICIÓN) */}
        <div className="flex-1">
          {colors.length === 0 ? (
             <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50">
               <p className="text-slate-500 font-medium">No hay colores registrados en esta tienda.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {colors.map(color => (
                <div key={color.id} className="group bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full border border-slate-200 shadow-sm shrink-0" style={{ backgroundColor: color.colorCode }}></div>
                  <div className="flex-1 min-w-0 pr-12">
                    <h4 className="font-bold text-slate-900 truncate">{color.name}</h4>
                    <p className="text-xs text-slate-500 font-mono uppercase">{color.colorCode}</p>
                  </div>
                  
                  {/* ACCIONES OCULTAS QUE APARECEN AL PASAR EL MOUSE (HOVER) */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1 rounded-lg">
                    <button onClick={() => handleEdit(color)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(color.id, color.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
