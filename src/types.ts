export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string; // NUEVO: Soporte para el logo de la tienda
}

export interface Color {
  id: string;
  storeId: string;
  name: string;
  hexCode: string;
}
export type StockStatus = 'disponible' | 'pocas_unidades' | 'agotado';

export interface ProductVariant {
  color: string;
  colorCode?: string;
  imageUrl: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  inStock?: boolean; // Lo dejamos opcional por compatibilidad con datos viejos
  stockStatus: StockStatus; // NUEVO: Control total de inventario
  isOffer: boolean;         // NUEVO: Switch de Oferta
  offerPrice?: number;      // NUEVO: Precio rebajado
  variants?: ProductVariant[];
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null; // Si es null, es categoría principal
}
