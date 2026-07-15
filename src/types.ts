export interface Store {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  // Colores Generales
  headerColor?: string;
  bgColor?: string;
  cardColor?: string;
  accentColor?: string;
  textColor?: string;
  // NUEVO: Colores Específicos (Botones y Etiquetas)
  checkoutBtnColor?: string;
  checkoutBtnTextColor?: string;
  badgeAvailableColor?: string;
  badgeAvailableTextColor?: string;
  badgeFewColor?: string;
  badgeFewTextColor?: string;
  badgeOutColor?: string;
  badgeOutTextColor?: string;
  badgeOfferColor?: string;
  badgeOfferTextColor?: string;
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
