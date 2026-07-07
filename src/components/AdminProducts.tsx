import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { Product, Category, Store } from '../types';

interface AdminProductsProps {
  activeStore: Store; // NUEVO: Recibe la tienda activa
  products: Product[];
  categories: Category[];
  addProduct: (p: Omit<Product, 'id' | 'storeId'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

export function AdminProducts({ activeStore, products, categories, addProduct, updateProduct, deleteProduct }: AdminProductsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    inStock: true
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        imageUrl: product.imageUrl,
        inStock: product.inStock
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: categories[0] || '',
        imageUrl: '',
        inStock: true
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      category: formData.category,
      imageUrl: formData.imageUrl,
      inStock: formData.inStock
    };

    if (editingId) {
      updateProduct(editingId, productData);
    } else {
      addProduct(productData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          {/* TÍTULOS DINÁMICOS AQUÍ */}
          <h2 className="text-2xl font-bold text-slate-900 uppercase">Inventario de {activeStore?.name}</h2>
          <p className="text-sm text-slate-500 mt-1">Gestiona los catálogos de {activeStore?.name} en este momento.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 hover:bg-slate-800 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="font-semibold pb-3 pl-2">Producto</th>
              <th className="font-semibold pb-3">Categoría</th>
              <th className="font-semibold pb-3">Precio</th>
              <th className="font-semibold pb-3">Estado</th>
              <th className="font-semibold pb-3 text-right pr-2">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-6 pl-2">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-slate-100 overflow-hidden shrink-0 shadow-sm border border-slate-200">
                      {product.imageUrl && (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-slate-900">{product.name}</p>
                    </div>
                  </div>
                </td>
                <td className="py-6 text-base text-slate-600">{product.category}</td>
                <td className="py-6 font-medium text-lg text-slate-900">${product.price.toFixed(2)}</td>
                <td className="py-6">
                  <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.inStock ? 'En Stock' : 'Agotado'}
                  </span>
                </td>
                <td className="py-6 pr-2 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if(confirm('¿Seguro que deseas eliminar este producto?')) {
                          deleteProduct(product.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500 text-base">
                  No hay productos registrados en {activeStore?.name}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nombre</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Descripción</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Precio ($)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Categoría</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300"
                  >
                    <option value="" disabled>Selecciona...</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Imagen del Producto</label>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer bg-white border border-slate-200 border-dashed rounded-xl px-4 py-4 text-center hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-medium text-blue-600">Subir imagen</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={handleImageUpload}
                      />
                    </label>
                    <span className="text-xs text-slate-400 font-medium uppercase">O</span>
                    <input
                      type="text"
                      placeholder="Pegar URL de la imagen..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="flex-[2] bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-slate-300"
                    />
                  </div>
                  
                  {formData.imageUrl && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={formData.imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 text-black focus:ring-black accent-black"
                  />
                  <span className="text-sm font-medium text-slate-700">Producto en Stock</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Guardar Producto
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
