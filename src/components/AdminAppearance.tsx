import { useState, useEffect } from 'react';
import { Paintbrush, Save, Loader2, RefreshCcw } from 'lucide-react';
import { Store } from '../types';

interface AdminAppearanceProps {
  activeStore: Store;
  updateStore: (id: string, s: Partial<Store>) => void;
}

export function AdminAppearance({ activeStore, updateStore }: AdminAppearanceProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  // Colores por defecto (blancos, grises y negros)
  const defaultColors = {
    headerColor: '#ffffff',
    bgColor: '#f8fafc',
    cardColor: '#ffffff',
    accentColor: '#16a34a', // Verde del carrito
    textColor: '#0f172a',
  };

  const [colors, setColors] = useState({
    headerColor: activeStore?.headerColor || defaultColors.headerColor,
    bgColor: activeStore?.bgColor || defaultColors.bgColor,
    cardColor: activeStore?.cardColor || defaultColors.cardColor,
    accentColor: activeStore?.accentColor || defaultColors.accentColor,
    textColor: activeStore?.textColor || defaultColors.textColor,
  });

  // Si cambiamos de tienda, recargamos sus colores
  useEffect(() => {
    if (activeStore) {
      setColors({
        headerColor: activeStore.headerColor || defaultColors.headerColor,
        bgColor: activeStore.bgColor || defaultColors.bgColor,
        cardColor: activeStore.cardColor || defaultColors.cardColor,
        accentColor: activeStore.accentColor || defaultColors.accentColor,
        textColor: activeStore.textColor || defaultColors.textColor,
      });
    }
  }, [activeStore]);

  const handleChange = (field: string, value: string) => {
    setColors(prev => ({ ...prev, [field]: value }));
  };

  const resetToDefault = () => {
    if(confirm('¿Restaurar los colores originales por defecto?')) {
      setColors(defaultColors);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateStore(activeStore.id, {
        headerColor: colors.headerColor,
        bgColor: colors.bgColor,
        cardColor: colors.cardColor,
        accentColor: colors.accentColor,
        textColor: colors.textColor,
      });
      alert('¡Apariencia actualizada con éxito!');
    } catch (error) {
      alert('Error al guardar la apariencia.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeStore) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase flex items-center gap-2">
            <Paintbrush className="w-6 h-6 text-blue-600" /> Apariencia Visual
          </h2>
          <p className="text-sm text-slate-500 mt-1">Personaliza los colores del catálogo público de {activeStore.name}.</p>
        </div>
        <button onClick={resetToDefault} className="text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 transition-colors">
          <RefreshCcw className="w-4 h-4" /> Restaurar Original
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SELECTORES DE COLOR */}
        <div className="space-y-4">
          <ColorPicker label="Fondo del Catálogo" value={colors.bgColor} onChange={(v) => handleChange('bgColor', v)} desc="El color de fondo general de la página." />
          <ColorPicker label="Color de la Cabecera (Banner)" value={colors.headerColor} onChange={(v) => handleChange('headerColor', v)} desc="Donde va el logo, el menú y la lupa." />
          <ColorPicker label="Color de Superficies (Tarjetas)" value={colors.cardColor} onChange={(v) => handleChange('cardColor', v)} desc="Fondo de los productos y del carrito." />
          <ColorPicker label="Color de Acento (Botones)" value={colors.accentColor} onChange={(v) => handleChange('accentColor', v)} desc="Botones de comprar, enviar pedido, etc." />
          <ColorPicker label="Color de los Textos" value={colors.textColor} onChange={(v) => handleChange('textColor', v)} desc="Asegúrate de que contraste bien con el fondo." />
          
          <button onClick={handleSave} disabled={isSaving} className="w-full mt-4 bg-black text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Guardar Diseño
          </button>
        </div>

        {/* VISTA PREVIA (Mini Simulador) */}
        <div className="bg-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 relative overflow-hidden">
          <span className="absolute top-4 left-4 text-xs font-black text-slate-400 uppercase tracking-widest">Vista Previa Móvil</span>
          
          {/* Celular Simulado */}
          <div className="w-[280px] h-[500px] rounded-[2.5rem] shadow-2xl overflow-hidden border-[6px] border-black flex flex-col mt-4" style={{ backgroundColor: colors.bgColor, color: colors.textColor }}>
            
            {/* Header Simulado */}
            <div className="h-14 flex items-center justify-between px-4 shrink-0 shadow-sm" style={{ backgroundColor: colors.headerColor }}>
              <div className="w-6 h-1 rounded-sm opacity-50" style={{ backgroundColor: colors.textColor }} />
              <span className="font-black text-sm uppercase truncate max-w-[100px]">{activeStore.name}</span>
              <div className="w-4 h-4 rounded-full opacity-50 border-2" style={{ borderColor: colors.textColor }} />
            </div>

            {/* Contenido Simulado */}
            <div className="p-4 flex-1 space-y-4">
              <div className="w-3/4 h-4 rounded font-bold opacity-80" style={{ backgroundColor: colors.textColor }} />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map(i => (
                  <div key={i} className="rounded-2xl p-2 shadow-sm" style={{ backgroundColor: colors.cardColor }}>
                    <div className="aspect-square bg-black/5 rounded-xl mb-2" />
                    <div className="w-2/3 h-2 rounded mb-3 opacity-60" style={{ backgroundColor: colors.textColor }} />
                    <div className="w-8 h-8 rounded-full flex items-center justify-center float-right shadow-md" style={{ backgroundColor: colors.accentColor }}>
                      <ShoppingBag className="w-3 h-3 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón Flotante Simulado */}
            <div className="absolute bottom-6 right-6 w-12 h-12 rounded-full shadow-lg" style={{ backgroundColor: colors.accentColor }} />
          </div>
        </div>

      </div>
    </div>
  );
}

// Componente reutilizable para cada selector de color
function ColorPicker({ label, value, onChange, desc }: { label: string, value: string, onChange: (v: string) => void, desc: string }) {
  return (
    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
      <div>
        <label className="block text-sm font-bold text-slate-900">{label}</label>
        <p className="text-[10px] text-slate-500">{desc}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <input type="text" value={value.toUpperCase()} onChange={(e) => onChange(e.target.value)} className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono outline-none text-center" />
        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-300 shadow-inner cursor-pointer">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute -inset-2 w-16 h-16 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
