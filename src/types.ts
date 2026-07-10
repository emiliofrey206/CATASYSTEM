export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string; // NUEVO: Soporte para el logo de la tienda
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  inStock: boolean;
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null; // Si es null, es categoría principal
}
