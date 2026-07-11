import { useState } from 'react';
import { ShoppingBag, Image as ImageIcon } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Por defecto, muestra la foto principal. Si hay colores, podemos cambiarla.
  const [activeImage, setActiveImage] = useState(product.imageUrl);
  const [activeColor, setActiveColor] = useState<string | null>(null);

  const handleVariantClick = (colorName: string, imageUrl: string) => {
    if (activeColor === colorName) {
      setActiveColor(null);
      setActiveImage(product.imageUrl);
    } else {
      setActiveColor(colorName);
      // Si el color no tiene foto propia, mantenemos la portada
      setActiveImage(imageUrl || product.imageUrl); 
    }
  };

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col h-full group">
      
      {/* SECCIÓN VISUAL (MÁS ANGOSTA Y ALTA) */}
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

      {/* SECCIÓN DE DATOS */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <span className="inline-block text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-widest mb-3">
            {product.category}
          </span>
          <h3 className="text-lg font-bold text-slate-900 leading-tight">{product.name}</h3>
          <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{product.description}</p>
        </div>

        {/* MAGIA: CÍRCULOS DE COLORES VISUALES */}
        {product.variants && product.variants.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-50">
            <div className="flex flex-wrap gap-2.5">
              {product.variants.map((variant, idx) => (
                <button
                  key={idx}
                  title={variant.color} // Muestra el nombre ("Dorado") si dejan el mouse encima
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
            {/* Pequeño texto dinámico que dice qué color seleccionaste */}
            {activeColor && (
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
                Color: <span className="text-slate-700">{activeColor}</span>
              </p>
            )}
          </div>
        )}

        {/* PIE DE TARJETA: PRECIO Y ACCIÓN */}
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
