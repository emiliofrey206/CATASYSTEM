import { useState } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-slate-200 rounded-[2rem] p-5 flex flex-col relative overflow-hidden group hover:shadow-sm transition-shadow"
      >
        <div 
          className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-100 mb-5 relative cursor-pointer"
          onClick={() => setIsImageModalOpen(true)}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
             <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8 drop-shadow-md" />
          </div>
          {!product.inStock && (
            <div className="absolute top-3 left-3 rounded-full bg-red-100 px-3 py-1 text-[10px] font-bold text-red-700 uppercase tracking-wider">
              Agotado
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col">
          <div className="mb-3 w-fit bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {product.category}
          </div>
          <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">
            {product.name}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1">
            {product.description}
          </p>
          <div className="flex items-center justify-between mt-auto z-10">
            <span className="text-xl font-bold text-slate-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-slate-900/90 backdrop-blur-sm"
            onClick={() => setIsImageModalOpen(false)}
          >
            <button 
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              src={product.imageUrl}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
