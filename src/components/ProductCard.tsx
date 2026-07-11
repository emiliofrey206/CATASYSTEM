import { useState } from 'react';
import { ShoppingBag, Image as ImageIcon } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // LÓGICA INTELIGENTE DE RESPALDO (FALLBACK)
  const firstVariantImg = product.variants && product.variants.length > 0 ? product.variants[0].imageUrl : '';
  const firstVariantColor = product.variants && product.variants.length > 0 ? product.variants[0].color : null;
  
  // Si no hay imagen principal, usamos la de la primera variante
  const defaultImage = product.imageUrl || firstVariantImg;
  // Si no hay imagen principal y existen variantes, auto-seleccionamos el primer color
  const defaultColor = !product.imageUrl && firstVariantColor ? firstVariantColor : null;

  const [activeImage, setActiveImage] = useState(defaultImage);
  const [activeColor, setActiveColor] = useState<string | null>(defaultColor);

  const handleVariantClick = (colorName: string, imageUrl: string) => {
    if (activeColor === colorName) {
      // Si el usuario deselecciona el color:
      // Si el producto NO tiene foto principal, lo obligamos a quedarse en el primer color
      if (!product.imageUrl) {
        setActiveColor(firstVariantColor);
        setActiveImage(firstVariantImg);
      } else {
        // Si sí tiene foto principal, volvemos a ella
        setActiveColor(null);
        setActiveImage(product.imageUrl);
      }
    } else {
      // Cambiamos al nuevo color seleccionado
      setActiveColor(colorName);
      // Si el color no tiene foto propia, usamos la principal o la del primer color
      setActiveImage(imageUrl || product.imageUrl || firstVariantImg); 
    }
  };

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col h-full group">
      
      <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden shrink-0">
        {activeImage ? (
          <img 
            src={activeImage} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ImageIcon className="w-10 h-10" />
          </div>
        )}
        
        {!product.inStock && (
          <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-md">
            Agotado
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <span className="inline-block text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-widest mb-3">
            {product.category}
          </span>
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
                  className={`w-6 h-6 rounded-full transition-all active:scale-95 ${
                    activeColor === variant.color 
                      ? 'ring-2 ring-black ring-offset-2 scale-110 shadow-sm' 
                      : 'border border-slate-200 hover:scale-110 shadow-sm'
                  }`}
                  style={{ backgroundColor: variant.colorCode || '#e2e8f0' }}
                />
              ))}
            </div>
            {activeColor && (
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
                Color: <span className="text-slate-700">{activeColor}</span>
              </p>
            )}
          </div>
        )}

        <div className="mt-5 pt-5 border-t border-slate-50 flex items-center justify-between">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            ${product.price.toFixed(2)}
          </span>
          <button 
            disabled={!product.inStock}
            className="w-12 h-12 rounded-[1.25rem] bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all disabled:opacity-50 disabled:bg-slate-300 active:scale-95"
            title="Añadir"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
