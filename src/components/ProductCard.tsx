import { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Image as ImageIcon, Maximize2, X, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { Product, Store } from '../types';
import { AnimatePresence, motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  store: Store; 
  onAddToCart?: (product: Product, color: string | null) => void;
}

export function ProductCard({ product, store, onAddToCart }: ProductCardProps) {
  const cardColor = store.cardColor || '#ffffff';
  const accentColor = store.accentColor || '#16a34a';
  const textColor = store.textColor || '#0f172a';
  
  const bAvailBg = store.badgeAvailableColor || '#dcfce7'; const bAvailText = store.badgeAvailableTextColor || '#15803d';
  const bFewBg = store.badgeFewColor || '#f97316'; const bFewText = store.badgeFewTextColor || '#ffffff';
  const bOutBg = store.badgeOutColor || '#ef4444'; const bOutText = store.badgeOutTextColor || '#ffffff';
  const bOfferBg = store.badgeOfferColor || '#2563eb'; const bOfferText = store.badgeOfferTextColor || '#ffffff';

  const firstVariantImg = product.variants && product.variants.length > 0 ? product.variants[0].imageUrl : '';
  const firstVariantColor = product.variants && product.variants.length > 0 ? product.variants[0].color : null;
  
  const defaultImage = product.imageUrl || firstVariantImg;
  const defaultColor = !product.imageUrl && firstVariantColor ? firstVariantColor : null;

  const [activeImage, setActiveImage] = useState(defaultImage);
  const [activeColor, setActiveColor] = useState<string | null>(defaultColor);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const actualStock = product.stockStatus || (product.inStock === false ? 'agotado' : 'disponible');
  const isAgotado = actualStock === 'agotado';

  const allImages = useMemo(() => {
    const images: string[] = [];
    if (product.imageUrl) images.push(product.imageUrl);
    if (product.variants) { product.variants.forEach(v => { if (v.imageUrl && !images.includes(v.imageUrl)) images.push(v.imageUrl); }); }
    return images;
  }, [product]);

  useEffect(() => {
    if (isGalleryOpen) {
      document.body.style.overflow = 'hidden'; document.body.dataset.galleryOpen = 'true'; window.history.pushState({ view: 'gallery' }, ''); 
      const handleGalleryBack = () => setIsGalleryOpen(false);
      window.addEventListener('popstate', handleGalleryBack);
      return () => { window.removeEventListener('popstate', handleGalleryBack); document.body.style.overflow = 'auto'; document.body.dataset.galleryOpen = 'false'; };
    } else { document.body.style.overflow = 'auto'; document.body.dataset.galleryOpen = 'false'; }
  }, [isGalleryOpen]);

  const handleVariantClick = (colorName: string, imageUrl: string) => {
    if (activeColor === colorName) {
      if (!product.imageUrl) { setActiveColor(firstVariantColor); setActiveImage(firstVariantImg); } 
      else { setActiveColor(null); setActiveImage(product.imageUrl); }
    } else { setActiveColor(colorName); setActiveImage(imageUrl || product.imageUrl || firstVariantImg); }
  };

  const openGallery = () => {
    if (allImages.length === 0) return;
    const currentIndex = allImages.indexOf(activeImage || '');
    setGalleryIndex(currentIndex !== -1 ? currentIndex : 0);
    setIsGalleryOpen(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => { setTouchEndX(null); setTouchStartX(e.targetTouches[0].clientX); };
  const handleTouchMove = (e: React.TouchEvent) => { setTouchEndX(e.targetTouches[0].clientX); };
  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50 && allImages.length > 1) setGalleryIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    if (distance < -50 && allImages.length > 1) setGalleryIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    setTouchStartX(null); setTouchEndX(null);
  };

  // Función exclusiva para cambiar color dentro de la Vista Rápida
  const handleVariantClickModal = (colorName: string, imageUrl: string) => {
    setActiveColor(colorName);
    const newImage = imageUrl || product.imageUrl || firstVariantImg;
    setActiveImage(newImage);
    const idx = allImages.indexOf(newImage);
    if (idx !== -1) setGalleryIndex(idx);
  };

  return (
    <>
      <div className="rounded-[2rem] overflow-hidden border border-black/5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group" style={{ backgroundColor: cardColor, color: textColor }}>
        <div onClick={openGallery} className="relative aspect-square bg-black/5 overflow-hidden shrink-0 cursor-pointer">
          {activeImage ? (
            <>
              <img src={activeImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100"><Maximize2 className="w-5 h-5 text-slate-800" /></div>
              </div>
            </>
          ) : <div className="w-full h-full flex items-center justify-center opacity-30"><ImageIcon className="w-10 h-10" /></div>}
          
          <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
            {isAgotado && <span className="text-[10px] font-black px-3 py-1.5 rounded-lg uppercase shadow-md" style={{ backgroundColor: bOutBg, color: bOutText }}>Agotado</span>}
            {actualStock === 'pocas_unidades' && <span className="text-[10px] font-black px-3 py-1.5 rounded-lg uppercase shadow-md" style={{ backgroundColor: bFewBg, color: bFewText }}>Pocas Unid.</span>}
            {actualStock === 'disponible' && <span className="text-[10px] font-black px-3 py-1.5 rounded-lg uppercase shadow-md" style={{ backgroundColor: bAvailBg, color: bAvailText }}>Disponible</span>}
            {product.isOffer && !isAgotado && <span className="text-[10px] font-black px-3 py-1.5 rounded-lg uppercase shadow-md flex items-center gap-1" style={{ backgroundColor: bOfferBg, color: bOfferText }}><Tag className="w-3 h-3" /> Oferta</span>}
          </div>
        </div>

        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <div className="flex-1">
            <span className="inline-block text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest mb-2.5 opacity-80 border" style={{ borderColor: textColor }}>{product.category}</span>
            <h3 className="text-base sm:text-lg font-bold leading-tight" style={{ color: textColor }}>{product.name}</h3>
            {/* AQUÍ HACEMOS LA DESCRIPCIÓN UN POCO MÁS PEQUEÑA (text-[11px]) */}
            <p className="text-[11px] sm:text-xs mt-1.5 line-clamp-2 leading-relaxed opacity-70">{product.description}</p>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="mt-4 pt-4 border-t border-black/5">
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((variant, idx) => (
                  <button key={idx} title={variant.color} onClick={() => handleVariantClick(variant.color, variant.imageUrl)} className={`w-6 h-6 rounded-full transition-all active:scale-95 ${activeColor === variant.color ? 'ring-2 ring-offset-2 scale-110 shadow-sm' : 'border border-black/10 hover:scale-110 shadow-sm'}`} style={{ backgroundColor: variant.colorCode || '#e2e8f0', ringColor: textColor }} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
            <div className="flex flex-col">
              {product.isOffer && product.offerPrice ? (
                <>
                  <span className="text-xs line-through opacity-50">${product.price.toFixed(2)}</span>
                  <span className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: bOfferBg }}>${product.offerPrice.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: textColor }}>${product.price.toFixed(2)}</span>
              )}
            </div>
            
            <button disabled={isAgotado} onClick={(e) => { e.stopPropagation(); onAddToCart?.(product, activeColor); }} className="w-10 h-10 sm:w-12 sm:h-12 rounded-[1rem] flex items-center justify-center transition-all disabled:opacity-50 active:scale-95 shadow-md" style={{ backgroundColor: accentColor, color: '#fff' }}><ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" /></button>
          </div>
        </div>
      </div>

      {/* NUEVA TARJETA AMPLIADA (QUICK VIEW) */}
      <AnimatePresence>
        {isGalleryOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6" onClick={() => setIsGalleryOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }} 
              className="w-full max-w-4xl max-h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative" 
              style={{ backgroundColor: cardColor, color: textColor }} 
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón Cerrar */}
              <button onClick={() => setIsGalleryOpen(false)} className="absolute top-3 right-3 md:top-4 md:right-4 z-20 p-2 rounded-full backdrop-blur-md bg-black/5 hover:bg-black/10 transition-colors">
                <X className="w-5 h-5" style={{ color: textColor }} />
              </button>

              {/* Lado Izquierdo: Imagen interactiva */}
              <div 
                className="w-full md:w-1/2 h-[40vh] md:h-auto relative bg-black/5 flex-shrink-0 touch-pan-y"
                onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
              >
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={galleryIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} 
                    src={allImages[galleryIndex]} alt={product.name} className="w-full h-full object-contain p-4 absolute inset-0 pointer-events-none select-none" draggable="false" 
                  />
                </AnimatePresence>
                
                {allImages.length > 1 && (
                  <>
                    {/* Las flechas solo se ven en computadoras (sm o md) */}
                    <button onClick={(e) => { e.stopPropagation(); setGalleryIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1)); }} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/50 hover:bg-white/80 backdrop-blur-md rounded-full text-slate-800 transition-colors z-10 shadow-sm"><ChevronLeft className="w-6 h-6" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setGalleryIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1)); }} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/50 hover:bg-white/80 backdrop-blur-md rounded-full text-slate-800 transition-colors z-10 shadow-sm"><ChevronRight className="w-6 h-6" /></button>
                    
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                      {allImages.map((_, idx) => <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === galleryIndex ? 'bg-black/60 scale-125' : 'bg-black/20'}`} />)}
                    </div>
                  </>
                )}

                <div className="absolute top-4 left-4 flex flex-col items-start gap-2 z-10">
                  {product.isOffer && !isAgotado && <span className="text-[10px] font-black px-3 py-1.5 rounded-lg uppercase shadow-md" style={{ backgroundColor: bOfferBg, color: bOfferText }}>Oferta</span>}
                  {isAgotado && <span className="text-[10px] font-black px-3 py-1.5 rounded-lg uppercase shadow-md" style={{ backgroundColor: bOutBg, color: bOutText }}>Agotado</span>}
                </div>
              </div>

              {/* Lado Derecho: Descripción y Detalles (con scroll si es largo) */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
                <span className="inline-block text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest mb-3 opacity-80 border w-max" style={{ borderColor: textColor }}>{product.category}</span>
                <h2 className="text-2xl md:text-3xl font-black leading-tight mb-2">{product.name}</h2>
                
                {/* Bloque de Precio */}
                <div className="flex items-end gap-3 mb-6">
                  {product.isOffer && product.offerPrice ? (
                    <>
                      <span className="text-3xl font-black" style={{ color: bOfferBg }}>${product.offerPrice.toFixed(2)}</span>
                      <span className="text-lg line-through opacity-50 mb-0.5">${product.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-black">${product.price.toFixed(2)}</span>
                  )}
                </div>

                <div className="w-full h-px bg-black/5 mb-6"></div>

                {/* Descripción Completa */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60">Descripción del Producto</h4>
                  <p className="text-sm sm:text-base leading-relaxed opacity-80 whitespace-pre-wrap">{product.description}</p>
                </div>

                {/* Selector de Colores Integrado */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-60">Color seleccionado: <span className="font-normal opacity-100 ml-1">{activeColor || 'Por defecto'}</span></h4>
                    <div className="flex flex-wrap gap-3">
                        {product.variants.map((variant, idx) => (
                          <button key={idx} onClick={() => handleVariantClickModal(variant.color, variant.imageUrl)} className={`w-8 h-8 rounded-full transition-all active:scale-95 ${activeColor === variant.color ? 'ring-2 ring-offset-2 scale-110 shadow-md' : 'border border-black/10 hover:scale-110 shadow-sm'}`} style={{ backgroundColor: variant.colorCode || '#e2e8f0', ringColor: textColor }} />
                        ))}
                    </div>
                  </div>
                )}

                {/* Botón Inferior para el Carrito */}
                <div className="mt-auto pt-4">
                  <button 
                    disabled={isAgotado} 
                    onClick={() => { onAddToCart?.(product, activeColor); setIsGalleryOpen(false); }}
                    className="w-full py-4 rounded-2xl text-white text-sm md:text-base font-black flex items-center justify-center gap-3 transition-all disabled:opacity-50 active:scale-95 shadow-lg"
                    style={{ backgroundColor: accentColor }}
                  >
                    <ShoppingBag className="w-5 h-5" /> {isAgotado ? 'Producto Agotado' : 'Añadir a mi pedido'}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
