import { useState } from 'react';
import { ShoppingBag, Image as ImageIcon } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Estados para manejar la interactividad de la tarjeta
  const [activeImage, setActiveImage] = useState(product.imageUrl);
  const [activeColor, setActiveColor] = useState<string | null>(null);

  const handleVariantClick = (color: string, imageUrl: string) => {
    if (activeColor === color) {
      // Si el cliente vuelve a tocar el mismo color, lo deseleccionamos y vuelve a la foto de portada
      setActiveColor(null);
      setActiveImage(product.imageUrl);
    } else {
      // Cambiamos al nuevo color y mostramos su foto (si no tiene foto propia, mostramos la principal)
      setActiveColor(color);
      setActiveImage(imageUrl || product.imageUrl);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col h-full group">
      
      {/* SECCIÓN VISUAL (FOTO PRINCIPAL O VARIANTE) */}
      <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden shrink-0">
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
        
        {/* Etiqueta de Agotado */}
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

        {/* MAGIA: SELECTOR DE COLORES DINÁMICO */}
        {product.variants && product.variants.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
              Elige un color:
            </p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant, idx) => (
                <button
                  key={idx}
                  onClick={() => handleVariantClick(variant.color, variant.imageUrl)}
                  className={`text-[11px] font-bold uppercase px-3 py-1.5 rounded-xl border transition-all active:scale-95 ${
                    activeColor === variant.color 
                      ? 'border-black bg-black text-white shadow-md' 
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {variant.color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PIE DE TARJETA: PRECIO Y ACCIÓN */}
        <div className="mt-5 pt-5 border-t border-slate-50 flex items-center justify-between">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            ${product.price.toFixed(2)}
          </span>
          <button 
            disabled={!product.inStock}
            className="w-12 h-12 rounded-[1.25rem] bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none active:scale-95"
            title="Añadir"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
      
    </div>
  );
}
