import { useState, useEffect } from 'react';
import { Paintbrush, Save, Loader2, RefreshCcw, ShoppingBag } from 'lucide-react';
import { Store } from '../types';

interface AdminAppearanceProps {
  activeStore: Store;
  updateStore: (id: string, s: Partial<Store>) => void;
}

export function AdminAppearance({ activeStore, updateStore }: AdminAppearanceProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  // Colores por defecto
  const defaultColors = {
    headerColor: '#ffffff', bgColor: '#f8fafc', cardColor: '#ffffff', accentColor: '#16a34a', textColor: '#0f172a',
    checkoutBtnColor: '#16a34a', checkoutBtnTextColor: '#ffffff',
    badgeAvailableColor: '#dcfce7', badgeAvailableTextColor: '#15803d',
    badgeFewColor: '#f97316', badgeFewTextColor: '#ffffff',
    badgeOutColor: '#ef4444', badgeOutTextColor: '#ffffff',
    badgeOfferColor: '#2563eb', badgeOfferTextColor: '#ffffff',
  };

  const [colors, setColors] = useState({
    headerColor: activeStore?.headerColor || defaultColors.headerColor,
    bgColor: activeStore?.bgColor || defaultColors.bgColor,
    cardColor: activeStore?.cardColor || defaultColors.cardColor,
    accentColor: activeStore?.accentColor || defaultColors.accentColor,
    textColor: activeStore?.textColor || defaultColors.textColor,
    checkoutBtnColor: activeStore?.checkoutBtnColor || defaultColors.checkoutBtnColor,
    checkoutBtnTextColor: activeStore?.checkoutBtnTextColor || defaultColors.checkoutBtnTextColor,
    badgeAvailableColor: activeStore?.badgeAvailableColor || defaultColors.badgeAvailableColor,
    badgeAvailableTextColor: activeStore?.badgeAvailableTextColor || defaultColors.badgeAvailableTextColor,
    badgeFewColor: activeStore?.badgeFewColor || defaultColors.badgeFewColor,
    badgeFewTextColor: activeStore?.badgeFewTextColor || defaultColors.badgeFewTextColor,
    badgeOutColor: activeStore?.badgeOutColor || defaultColors.badgeOutColor,
    badgeOutTextColor: activeStore?.badgeOutTextColor || defaultColors.badgeOutTextColor,
    badgeOfferColor: activeStore?.badgeOfferColor || defaultColors.badgeOfferColor,
    badgeOfferTextColor: activeStore?.badgeOfferTextColor || defaultColors.badgeOfferTextColor,
  });

  useEffect(() => {
    if (activeStore) {
      setColors({
        headerColor: activeStore.headerColor || defaultColors.headerColor, bgColor: activeStore.bgColor || defaultColors.bgColor,
        cardColor: activeStore.cardColor || defaultColors.cardColor, accentColor: activeStore.accentColor || defaultColors.accentColor,
        textColor: activeStore.textColor || defaultColors.textColor, checkoutBtnColor: activeStore.checkoutBtnColor || defaultColors.checkoutBtnColor,
        checkoutBtnTextColor: activeStore.checkoutBtnTextColor || defaultColors.checkoutBtnTextColor, badgeAvailableColor: activeStore.badgeAvailableColor || defaultColors.badgeAvailableColor,
        badgeAvailableTextColor: activeStore.badgeAvailableTextColor || defaultColors.badgeAvailableTextColor, badgeFewColor: activeStore.badgeFewColor || defaultColors.badgeFewColor,
        badgeFewTextColor: activeStore.badgeFewTextColor || defaultColors.badgeFewTextColor, badgeOutColor: activeStore.badgeOutColor || defaultColors.badgeOutColor,
        badgeOutTextColor: activeStore.badgeOutTextColor || defaultColors.badgeOutTextColor, badgeOfferColor: activeStore.badgeOfferColor || defaultColors.badgeOfferColor,
        badgeOfferTextColor: activeStore.badgeOfferTextColor || defaultColors.badgeOfferTextColor,
      });
    }
  }, [activeStore]);

  const handleChange = (field: string, value: string) => setColors(prev => ({ ...prev, [field]: value }));

  const resetToDefault = () => { if(confirm('¿Restaurar colores originales?')) setColors(defaultColors); };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateStore(activeStore.id, { ...colors });
      alert('¡Apariencia actualizada con éxito!');
    } catch (error) { alert('Error al guardar la apariencia.'); } 
    finally { setIsSaving(false); }
  };

  if (!activeStore) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 uppercase flex items-center gap-2"><Paintbrush className="w-6 h-6 text-blue-600" /> Apariencia Visual</h2>
          <p className="text-sm text-slate-500">Personaliza los colores del catálogo.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={resetToDefault} className="flex-1 sm:flex-none text-sm font-bold text-slate-600 bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200"><RefreshCcw className="w-4 h-4 inline mr-2" /> Restaurar</button>
          <button onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 inline mr-2" />} Guardar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="space-y-8 h-[600px] overflow-y-auto pr-2">
          
          {/* SECCIÓN 1: GENERAL */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Colores Generales</h3>
            <ColorPicker label="Fondo del Catálogo" value={colors.bgColor} onChange={(v) => handleChange('bgColor', v)} />
            <ColorPicker label="Cabecera (Banner y Carrito)" value={colors.headerColor} onChange={(v) => handleChange('headerColor', v)} />
            <ColorPicker label="Superficies (Tarjetas)" value={colors.cardColor} onChange={(v) => handleChange('cardColor', v)} />
            <ColorPicker label="Botones Pequeños (+ / - / Lupa)" value={colors.accentColor} onChange={(v) => handleChange('accentColor', v)} />
            <ColorPicker label="Color del Texto Principal" value={colors.textColor} onChange={(v) => handleChange('textColor', v)} />
          </div>

          {/* SECCIÓN 2: BOTÓN CHECKOUT */}
          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
            <h3 className="font-bold text-blue-900 border-b border-blue-200 pb-2 mb-3">Botón Final (Enviar Pedido)</h3>
            <ColorPicker label="Fondo del Botón" value={colors.checkoutBtnColor} onChange={(v) => handleChange('checkoutBtnColor', v)} />
            <ColorPicker label="Texto del Botón" value={colors.checkoutBtnTextColor} onChange={(v) => handleChange('checkoutBtnTextColor', v)} />
          </div>

          {/* SECCIÓN 3: ETIQUETAS DE INVENTARIO */}
          <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-3">
            <h3 className="font-bold text-orange-900 border-b border-orange-200 pb-2 mb-3">Etiquetas de Estado (Badges)</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker label="Fondo 'Disponible'" value={colors.badgeAvailableColor} onChange={(v) => handleChange('badgeAvailableColor', v)} slim />
              <ColorPicker label="Texto 'Disponible'" value={colors.badgeAvailableTextColor} onChange={(v) => handleChange('badgeAvailableTextColor', v)} slim />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker label="Fondo 'Pocas Unid.'" value={colors.badgeFewColor} onChange={(v) => handleChange('badgeFewColor', v)} slim />
              <ColorPicker label="Texto 'Pocas Unid.'" value={colors.badgeFewTextColor} onChange={(v) => handleChange('badgeFewTextColor', v)} slim />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker label="Fondo 'Agotado'" value={colors.badgeOutColor} onChange={(v) => handleChange('badgeOutColor', v)} slim />
              <ColorPicker label="Texto 'Agotado'" value={colors.badgeOutTextColor} onChange={(v) => handleChange('badgeOutTextColor', v)} slim />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker label="Fondo 'Oferta'" value={colors.badgeOfferColor} onChange={(v) => handleChange('badgeOfferColor', v)} slim />
              <ColorPicker label="Texto 'Oferta'" value={colors.badgeOfferTextColor} onChange={(v) => handleChange('badgeOfferTextColor', v)} slim />
            </div>
          </div>
        </div>

        {/* VISTA PREVIA */}
        <div className="bg-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 relative">
          <span className="absolute top-4 left-4 text-xs font-black text-slate-400 uppercase tracking-widest">Vista Previa Móvil</span>
          <div className="w-[280px] h-[550px] rounded-[2.5rem] shadow-2xl overflow-hidden border-[6px] border-black flex flex-col mt-4 relative" style={{ backgroundColor: colors.bgColor, color: colors.textColor }}>
            
            <div className="h-14 flex items-center justify-between px-4 shrink-0 shadow-sm" style={{ backgroundColor: colors.headerColor }}>
              <div className="w-6 h-1 rounded-sm opacity-50" style={{ backgroundColor: colors.textColor }} />
              <span className="font-black text-sm uppercase">{activeStore.name}</span>
              <div className="w-4 h-4 rounded-full opacity-50 border-2" style={{ borderColor: colors.textColor }} />
            </div>

            <div className="p-4 flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                
                {/* Simulador Tarjeta Oferta */}
                <div className="rounded-2xl p-2 shadow-sm relative" style={{ backgroundColor: colors.cardColor }}>
                  <div className="aspect-square bg-black/5 rounded-xl mb-2 relative">
                    <span className="absolute top-1 right-1 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm" style={{ backgroundColor: colors.badgeOfferColor, color: colors.badgeOfferTextColor }}>OFERTA</span>
                  </div>
                  <div className="w-2/3 h-2 rounded mb-3 opacity-60" style={{ backgroundColor: colors.textColor }} />
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center float-right shadow-sm" style={{ backgroundColor: colors.accentColor }}><ShoppingBag className="w-3 h-3 text-white" /></div>
                </div>

                {/* Simulador Tarjeta Pocas Unidades */}
                <div className="rounded-2xl p-2 shadow-sm relative" style={{ backgroundColor: colors.cardColor }}>
                  <div className="aspect-square bg-black/5 rounded-xl mb-2 relative">
                    <span className="absolute top-1 right-1 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm" style={{ backgroundColor: colors.badgeFewColor, color: colors.badgeFewTextColor }}>POCAS UNID</span>
                  </div>
                  <div className="w-2/3 h-2 rounded mb-3 opacity-60" style={{ backgroundColor: colors.textColor }} />
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center float-right shadow-sm" style={{ backgroundColor: colors.accentColor }}><ShoppingBag className="w-3 h-3 text-white" /></div>
                </div>

              </div>
            </div>

            {/* Simulador Botón Checkout */}
            <div className="p-4 bg-white/10 shrink-0">
              <div className="w-full py-3 rounded-xl text-xs font-bold text-center shadow-lg" style={{ backgroundColor: colors.checkoutBtnColor, color: colors.checkoutBtnTextColor }}>Enviar Pedido</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ColorPicker({ label, value, onChange, slim = false }: { label: string, value: string, onChange: (v: string) => void, slim?: boolean }) {
  return (
    <div className={`flex items-center justify-between bg-white rounded-xl border border-slate-200 ${slim ? 'p-2' : 'p-3'}`}>
      <label className={`font-bold text-slate-800 leading-tight ${slim ? 'text-[10px] w-20' : 'text-sm'}`}>{label}</label>
      <div className="flex items-center gap-1.5 shrink-0">
        <input type="text" value={value.toUpperCase()} onChange={(e) => onChange(e.target.value)} className="w-16 bg-slate-50 border border-slate-200 rounded-md px-1 py-1 text-[10px] font-mono outline-none text-center" />
        <div className="relative w-8 h-8 rounded-md overflow-hidden border border-slate-300 shadow-inner cursor-pointer">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute -inset-2 w-12 h-12 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
