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

  // --- CAPAS DE INTERFAZ ---
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false); // Capa 1: Tarjeta Detallada
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);   // Capa 2: Súper Ampliación Completa
  
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

  // --- CONTROL DE HISTORIAL Y SCROLL EN TÁNDEM ---
  useEffect(() => {
    if (isQuickViewOpen || isLightboxOpen) {
      document.body.style.overflow = 'hidden';
      document.body.dataset.galleryOpen = 'true'; // Avisa al catálogo principal
    } else {
      document.body.style.overflow = 'auto';
      document.body.dataset.galleryOpen = 'false';
    }
  }, [isQuickViewOpen, isLightboxOpen]);

  // Atrapador de botón atrás para la Vista Rápida
  useEffect(() => {
    if (!isQuickViewOpen) return;
    const handleQuickViewBack = () => {
      if (isLightboxOpen) return; // Si la foto gigante está encima, ella se encarga
      setIsQuickViewOpen(false);
    };
    window.addEventListener('popstate', handleQuickViewBack);
    return () => window.removeEventListener('popstate', handleQuickViewBack);
  }, [isQuickViewOpen, isLightboxOpen]);

  // Atrapador de botón atrás para la Súper Ampliación
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleLightboxBack = () => {
      setIsLightboxOpen(false);
    };
    window.addEventListener('popstate', handleLightboxBack);
    return () => window.removeEventListener('popstate', handleLightboxBack);
  }, [isLightboxOpen]);

  const handleOpenQuickView = () => {
    if (allImages.length === 0) return;
    const currentIndex = allImages.indexOf(activeImage || '');
    setGalleryIndex(currentIndex !== -1 ? currentIndex : 0);
    setIsQuickViewOpen(true);
  };

  // --- REGLAS DE DESLIZAMIENTO CON EL DEDO (SWIPE) ---
  const handleTouchStart = (e: React.TouchEvent) => { setTouchEndX(null); setTouchStartX(e.targetTouches[0].clientX); };
  const handleTouchMove = (e: React.TouchEvent) => { setTouchEndX(e.targetTouches[0].clientX); };
  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50 && allImages.length > 1) setGalleryIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    if (distance < -50 && allImages.length > 1) setGalleryIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    setTouchStartX(null); setTouchEndX(null);
  };

  const handleVariantClickModal = (colorName: string, imageUrl: string) => {
    setActiveColor(colorName);
    const newImage = imageUrl || product.imageUrl || firstVariantImg;
    setActiveImage(newImage);
    const idx = allImages.indexOf(newImage);
    if (idx !== -1) setGalleryIndex(idx);
  };

  return (
    <>
      {/* 1. TARJETA EN VITRINA (MINIATURA) */}
      <div className="rounded-[2rem] overflow-hidden border border-black/5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group" style={{ backgroundColor: cardColor, color: textColor }}>
        <div onClick={handleOpenQuickView} className="relative aspect-square bg-black/5 overflow-hidden shrink-
