import { useState, useEffect } from 'react';
import { Paintbrush, Save, Loader2, RefreshCcw, ShoppingBag, Megaphone } from 'lucide-react';
import { Store } from '../types';

interface AdminAppearanceProps {
  activeStore: Store;
  updateStore: (id: string, s: Partial<Store>) => void;
}

export function AdminAppearance({ activeStore, updateStore }: AdminAppearanceProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const defaultColors = {
    headerColor: '#ffffff', bgColor: '#f8fafc', cardColor: '#ffffff', accentColor: '#16a34a', textColor: '#0f172a',
    checkoutBtnColor: '#16a34a', checkoutBtnTextColor: '#ffffff',
    badgeAvailableColor: '#dcfce7', badgeAvailableTextColor: '#15803d',
    badgeFewColor: '#f97316', badgeFewTextColor: '#ffffff',
    badgeOutColor: '#ef4444', badgeOutTextColor: '#ffffff',
    badgeOfferColor: '#2563eb', badgeOfferTextColor: '#ffffff',
    cartItemBgColor: '#ffffff',
    announcementColor: '#1e293b'
  };

  const [settings, setSettings] = useState({
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
    cartItemBgColor: activeStore?.cartItemBgColor || defaultColors.cartItemBgColor,
    
    // --- ESTADOS DEL CINTILLO MÓVIL ---
    isAnnouncementActive: activeStore?.isAnnouncementActive || false,
    announcementText: activeStore?.announcementText || '',
    announcementColor: activeStore?.announcementColor || defaultColors.announcementColor,
  });

  useEffect(() => {
    if (activeStore) {
      setSettings({
        headerColor: activeStore.headerColor || defaultColors.headerColor, bgColor: activeStore.bgColor || defaultColors.bgColor,
        cardColor: activeStore.cardColor || defaultColors.cardColor, accentColor: activeStore.accentColor || defaultColors.accentColor,
        textColor: activeStore.textColor || defaultColors.textColor, checkoutBtnColor: activeStore.checkoutBtnColor || defaultColors.checkoutBtnColor,
        checkoutBtnTextColor: activeStore.checkoutBtnTextColor || defaultColors.checkoutBtnTextColor, badgeAvailableColor: activeStore.badgeAvailableColor || defaultColors.badgeAvailableColor,
        badgeAvailableTextColor: activeStore.badgeAvailableTextColor || defaultColors.badgeAvailableTextColor, badgeFewColor: activeStore.badgeFewColor || defaultColors.badgeFewColor,
        badgeFewTextColor: activeStore.badgeFewTextColor || defaultColors.badgeFewTextColor, badgeOutColor: activeStore.badgeOutColor || defaultColors.badgeOutColor,
        badgeOutTextColor: activeStore.badgeOutTextColor || defaultColors.badgeOutTextColor, badgeOfferColor: activeStore.badgeOfferColor || defaultColors.badgeOfferColor,
        badgeOfferTextColor: activeStore.badgeOfferTextColor || defaultColors.badgeOfferTextColor,
        cartItemBgColor: activeStore.cartItemBgColor || defaultColors.cartItemBgColor,
        
        // Sincronizamos con DB al cargar
        isAnnouncementActive: activeStore.isAnnouncementActive || false,
        announcementText: activeStore.announcementText || '',
        announcementColor: activeStore.announcementColor || defaultColors.announcementColor,
      });
    }
  }, [activeStore]);

  const handleChange = (field: string, value: any) => setSettings(prev => ({ ...prev, [field]: value }));
  
  const resetToDefault = () => { 
    if(confirm('¿Restaurar colores originales?')) {
      setSettings(prev => ({ ...prev, ...defaultColors }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateStore(activeStore.id, { ...settings });
      alert('¡Apariencia actualizada con éxito!');
    } catch (error) { 
      alert('Error al guardar la apariencia.'); 
    } 
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
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Colores Generales</h3>
            <ColorPicker label="Fondo del Catálogo" value={settings.bgColor} onChange={(v) => handleChange('bgColor', v)} />
            <ColorPicker label="Cabecera (Banner y Carrito)" value={settings.headerColor} onChange={(v) => handleChange('headerColor', v)} />
            <ColorPicker label="Superficies (Tarjetas)" value={settings.cardColor} onChange={(v) => handleChange('cardColor', v)} />
            <ColorPicker label="Fondo Producto en Carrito" value={settings.cartItemBgColor} onChange={(v) => handleChange('cartItemBgColor', v)} />
            <ColorPicker label="Botones Pequeños (+ / - / Lupa)" value={settings.accentColor} onChange={(v) => handleChange('accentColor', v)} />
            <ColorPicker label="Color del Texto Principal" value={settings.textColor} onChange={(v) => handleChange('textColor', v)} />
          </div>

          {/* --- TARJETA REPARADA: CINTILLO DE ANUNCIOS (TICKER) --- */}
          <div className="bg-slate-50 rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-blue-500" /> Cintillo de Avisos
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Barra de texto móvil para ofertas o notificaciones.</p>
              </div>
              
              {/* Botón Switch para Activar/Desactivar guardado en Memoria */}
              <button 
                type="button"
                onClick={() => handleChange('isAnnouncementActive', !settings.isAnnouncementActive)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${settings.isAnnouncementActive ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.isAnnouncementActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className={`transition-all duration-300 ${settings.isAnnouncementActive ? 'opacity-100 max-h-[500px]' : 'opacity-40 pointer-events-none max-h-[200px]'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Texto del Anuncio</label>
                  <input 
                    type="text" 
                    value={settings.announcementText} 
                    onChange={(e) => handleChange('announcementText', e.target.value)}
                    placeholder="Ej. 🔥 ENVÍO GRATIS POR HOY 🔥"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
                <ColorPicker 
                  label="Color del Cintillo" 
                  value={settings.announcementColor} 
                  onChange={(val) => handleChange('announcementColor', val)} 
                />
              </div>
            </div>
          </div>
          {/* --- FIN TARJETA CINTILLO --- */}

          <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
            <h3 className="font-bold text-blue-900 border-b border-blue-200 pb-2 mb-3">Botón Final (Enviar Pedido)</h3>
            <ColorPicker label="Fondo del Botón" value={settings.checkoutBtnColor} onChange={(v) => handleChange('checkoutBtnColor', v)} />
            <ColorPicker label="Texto del Botón" value={settings.checkoutBtnTextColor} onChange={(v) => handleChange('checkoutBtnTextColor', v)} />
          </div>

          <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-3">
            <h3 className="font-bold text-orange-900 border-b border-orange-200 pb-2 mb-3">Etiquetas de Estado (Badges)</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker label="Fondo 'Disponible'" value={settings.badgeAvailableColor} onChange={(v) => handleChange('badgeAvailableColor', v)} slim />
              <ColorPicker label="Texto 'Disponible'" value={settings.badgeAvailableTextColor} onChange={(v) => handleChange('badgeAvailableTextColor', v)} slim />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker label="Fondo 'Pocas Unid.'" value={settings.badgeFewColor} onChange={(v) => handleChange('badgeFewColor', v)} slim />
              <ColorPicker label="Texto 'Pocas Unid.'" value={settings.badgeFewTextColor} onChange={(v) => handleChange('badgeFewTextColor', v)} slim />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker label="Fondo 'Agotado'" value={settings.badgeOutColor} onChange={(v) => handleChange('badgeOutColor', v)} slim />
              <ColorPicker label="Texto 'Agotado'" value={settings.badgeOutTextColor} onChange={(v) => handleChange('badgeOutTextColor', v)} slim />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker label="Fondo 'Oferta'" value={settings.badgeOfferColor} onChange={(v) => handleChange('badgeOfferColor', v)} slim />
              <ColorPicker label="Texto 'Oferta'" value={settings.badgeOfferTextColor} onChange={(v) => handleChange('badgeOfferTextColor', v)} slim />
            </div>
          </div>
        </div>

        {/* VISTA PREVIA */}
        <div className="bg-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 relative">
          <span className="absolute top-4 left-4 text-xs font-black text-slate-400 uppercase tracking-widest">Vista Previa Móvil</span>
          <div className="w-[280px] h-[550px] rounded-[2.5rem] shadow-2xl overflow-hidden border-[6px] border-black flex flex-col mt-4 relative" style={{ backgroundColor: settings.bgColor, color: settings.textColor }}>
            
            <div className="h-14 flex items-center justify-between px-4 shrink-0 shadow-sm" style={{ backgroundColor: settings.headerColor }}>
              <div className="w-6 h-1 rounded-sm opacity-50" style={{ backgroundColor: settings.textColor }} />
              <span className="font-black text-sm uppercase">{activeStore.name}</span>
              <div className="w-4 h-4 rounded-full opacity-50 border-2" style={{ borderColor: settings.textColor }} />
            </div>

            <div className="p-4 flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-2 shadow-sm relative" style={{ backgroundColor: settings.cardColor }}>
                  <div className="aspect-square bg-black/5 rounded-xl mb-2 relative">
                    <span className="absolute top-1 right-1 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm" style={{ backgroundColor: settings.badgeOfferColor, color: settings.badgeOfferTextColor }}>OFERTA</span>
                  </div>
                  <div className="w-2/3 h-2 rounded mb-3 opacity-60" style={{ backgroundColor: settings.textColor }} />
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center float-right shadow-sm" style={{ backgroundColor: settings.accentColor }}><ShoppingBag className="w-3 h-3 text-white" /></div>
                </div>
                <div className="rounded-2xl p-2 shadow-sm relative" style={{ backgroundColor: settings.cardColor }}>
                  <div className="aspect-square bg-black/5 rounded-xl mb-2 relative">
                    <span className="absolute top-1 right-1 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm" style={{ backgroundColor: settings.badgeFewColor, color: settings.badgeFewTextColor }}>POCAS UNID</span>
                  </div>
                  <div className="w-2/3 h-2 rounded mb-3 opacity-60" style={{ backgroundColor: settings.textColor }} />
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center float-right shadow-sm" style={{ backgroundColor: settings.accentColor }}><ShoppingBag className="w-3 h-3 text-white" /></div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/10 shrink-0">
              <div className="w-full py-3 rounded-xl text-xs font-bold text-center shadow-lg" style={{ backgroundColor: settings.checkoutBtnColor, color: settings.checkoutBtnTextColor }}>Enviar Pedido</div>
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
