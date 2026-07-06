export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
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

export type Category = string;
