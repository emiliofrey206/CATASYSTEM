import { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Image as ImageIcon, Maximize2, X, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { Product } from '../types';
import { AnimatePresence, motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, color: string | null, image: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const firstVariantImg = product.variants && product.variants.length > 0 ? product.variants[0].imageUrl : '';
  const firstVariantColor = product.variants && product.variants.length > 0 ? product.variants[0].color : null;
  
  const defaultImage = product.imageUrl || firstVariantImg;
  const defaultColor = !product.imageUrl && firstVariantColor ? firstVariantColor : null;

  const [activeImage, setActiveImage] = useState(defaultImage);
  const [activeColor, setActiveColor] = useState<string | null>(defaultColor);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const allImages = useMemo(() => {
    const images: string[] = [];
    if (product.imageUrl) images.push(product.imageUrl);
    if (product.variants) {
      product.variants.forEach(v => {
        if (v.imageUrl && !images.includes(v.imageUrl)) {
          images.push(v.imageUrl);
        }
      });
    }
    return images;
  }, [product]);

  useEffect(() => {
    if (isGalleryOpen) {
      document.body.style.overflow = 'hidden';
      document.body.dataset.galleryOpen = 'true';
      window.history.pushState({ view: 'gallery' }, '');
      
      const handleGalleryBack = () => setIsGalleryOpen(false);
      window.addEventListener('popstate', handleGalleryBack);
      
      return () => {
        window.removeEventListener('popstate', handleGalleryBack);
        document.body.style.overflow = 'auto';
        document.body.dataset.galleryOpen = 'false';
      };
    } else {
      document.body.style.overflow = 'auto';
      document.body.dataset.galleryOpen = 'false';
    }
  }, [isGalleryOpen]);

  const handleVariantClick = (colorName: string, imageUrl: string) => {
    if (activeColor === colorName) {
      if (!product.imageUrl) {
        setActiveColor(firstVariantColor);
        setActiveImage(firstVariantImg);
      } else {
        setActiveColor(null);
        setActiveImage(product.imageUrl);
      }
    } else {
      setActiveColor(colorName);
      setActiveImage(imageUrl || product.imageUrl || firstVariantImg); 
    }
  };

  const openGallery = () => {
    if (allImages.length === 0) return;
    const currentIndex = allImages.indexOf(activeImage || '');
    setGalleryIndex(currentIndex !== -1 ? currentIndex : 0);
    setIsGalleryOpen(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGalleryIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGalleryIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  // Lógica para saber el estado real del stock
  const actualStock = product.stockStatus || (product.inStock === false ? 'agotado' : 'disponible');

  return (
    <>
      <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col h-full group relative">
        
        {/* ETIQUETAS DE OFERTA Y STOCK SUPERIORES */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
          {product.isOffer && (
            <div className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider shadow-md flex items-center gap-1">
              <Tag className="w-3 h-3" /> Oferta
            </div>
          )}
          
          <div className="ml-auto">
            {actualStock === 'disponible' && (
              <div className="bg-green-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider shadow-md">Disponible</div>
            )}
            {actualStock === 'pocas_unidades' && (
              <div className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider shadow-md">Pocas Unid.</div>
            )}
            {actualStock === 'agotado' && (
              <div className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider shadow-md">Agotado</div>
            )}
          </div>
        </div>

        <div onClick={openGallery} className="relative aspect-square bg-slate-50 overflow-hidden shrink-0 cursor-pointer">
          {activeImage ? (
            <>
              <img src={activeImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/90 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
                  <Maximize2 className="w-5 h-5 text-slate-800" />
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-10 h-10" /></div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex-1">
            <span className="inline-block text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-widest mb-3">{product.category}</span>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">{product.name}</h3>
            <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{product.description}</p>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-50">
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((variant, idx) => (
                  <button
                    key={idx}
                    title={variant.color}
                    onClick={() => handleVariantClick(variant.color, variant.imageUrl)}
                    className={`w-6 h-6 rounded-full transition-all active:scale-95 ${activeColor === variant.color ? 'ring-2 ring-black ring-offset-2 scale-110 shadow-sm' : 'border border-slate-200 hover:scale-110 shadow-sm'}`}
                    style={{ backgroundColor: variant.colorCode || '#e2e8f0' }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-slate-50 flex items-end justify-between">
            {/* LÓGICA DE PRECIOS */}
            <div>
              {product.isOffer && product.offerPrice ? (
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 line-through font-semibold">${product.price.toFixed(2)}</span>
                  <span className="text-2xl font-black text-red-600 tracking-tight">${product.offerPrice.toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-2xl font-black text-slate-900 tracking-tight">${product.price.toFixed(2)}</span>
              )}
            </div>

            <button 
              disabled={actualStock === 'agotado'} 
              onClick={() => onAddToCart(product, activeColor, activeImage || '')}
              className="w-12 h-12 rounded-[1.25rem] bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-50 disabled:bg-slate-300 active:scale-95 shrink-0"
              title="Añadir al carrito"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isGalleryOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md" onClick={() => setIsGalleryOpen(false)}>
            <button onClick={() => setIsGalleryOpen(false)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"><X className="w-6 h-6" /></button>
            {allImages.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-4 sm:left-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"><ChevronLeft className="w-8 h-8" /></button>
                <button onClick={nextImage} className="absolute right-4 sm:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"><ChevronRight className="w-8 h-8" /></button>
              </>
            )}
            <motion.div
              key={galleryIndex} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl max-h-[85vh] px-4 sm:px-16 flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()} 
            >
              <img src={allImages[galleryIndex]} alt={`${product.name} - Galería`} className="w-full h-full object-contain max-h-[80vh] rounded-xl shadow-2xl" />
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-6">
                  {allImages.map((_, idx) => (
                    <div key={idx} className={`w-2.5 h-2.5 rounded-full transition-all ${idx === galleryIndex ? 'bg-white scale-125' : 'bg-white/30'}`} />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
