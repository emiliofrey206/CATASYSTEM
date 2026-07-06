import { useState, useEffect } from 'react';
import { Product, Category, Store } from './types';
import { products as initialProducts, categories as initialCategories, mockStore } from './data';

class CatalogStore {
  stores: Store[] = [mockStore];
  products: Product[] = initialProducts;
  categories: Category[] = initialCategories;
  isLoaded = false;
  isAuthenticated = false;
  private listeners = new Set<() => void>();

  constructor() {
    this.isAuthenticated = sessionStorage.getItem('catalog_auth') === 'true';
    this.load();
    window.addEventListener('storage', (e) => {
      if (['catalog_products', 'catalog_categories', 'catalog_stores'].includes(e.key || '')) {
        this.load();
      }
    });
  }

  private load() {
    try {
      const s = localStorage.getItem('catalog_stores');
      const p = localStorage.getItem('catalog_products');
      const c = localStorage.getItem('catalog_categories');
      
      if (s) this.stores = JSON.parse(s);
      else localStorage.setItem('catalog_stores', JSON.stringify(this.stores));

      if (p) this.products = JSON.parse(p);
      else localStorage.setItem('catalog_products', JSON.stringify(this.products));

      if (c) this.categories = JSON.parse(c);
      else localStorage.setItem('catalog_categories', JSON.stringify(this.categories));
    } catch (e) {
      console.error("Error loading catalog data", e);
    }

    this.isLoaded = true;
    this.notify();
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  login = (user: string, pass: string) => {
    if (user === 'admin' && pass === 'admin') {
      this.isAuthenticated = true;
      sessionStorage.setItem('catalog_auth', 'true');
      this.notify();
      return true;
    }
    return false;
  }

  logout = () => {
    this.isAuthenticated = false;
    sessionStorage.removeItem('catalog_auth');
    this.notify();
  }

  addProduct = (product: Omit<Product, 'id' | 'storeId'>) => {
    const storeId = this.stores[0]?.id || 'store-1';
    const newProduct = { ...product, id: Date.now().toString(), storeId };
    this.products = [...this.products, newProduct];
    localStorage.setItem('catalog_products', JSON.stringify(this.products));
    this.notify();
  }

  updateProduct = (id: string, updatedData: Partial<Product>) => {
    this.products = this.products.map(p => p.id === id ? { ...p, ...updatedData } : p);
    localStorage.setItem('catalog_products', JSON.stringify(this.products));
    this.notify();
  }

  deleteProduct = (id: string) => {
    this.products = this.products.filter(p => p.id !== id);
    localStorage.setItem('catalog_products', JSON.stringify(this.products));
    this.notify();
  }

  addCategory = (category: string) => {
    const trimmed = category.trim();
    if (trimmed && !this.categories.includes(trimmed)) {
      this.categories = [...this.categories, trimmed];
      localStorage.setItem('catalog_categories', JSON.stringify(this.categories));
      this.notify();
    }
  }

  deleteCategory = (category: string) => {
    this.categories = this.categories.filter(c => c !== category);
    localStorage.setItem('catalog_categories', JSON.stringify(this.categories));
    this.notify();
  }
}

export const catalogStore = new CatalogStore();

export function useCatalog() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return catalogStore.subscribe(() => setTick(t => t + 1));
  }, []);

  return catalogStore;
}
