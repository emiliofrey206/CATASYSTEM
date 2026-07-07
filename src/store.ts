import { useState, useEffect } from 'react';
import { Product, Category, Store } from './types';
import { supabase } from './supabase';

class CatalogStore {
  stores: Store[] = [];
  products: Product[] = [];
  categories: Category[] = [];
  isLoaded = false;
  isAuthenticated = false;
  activeStoreId: string = '';

  private listeners = new Set<() => void>();

  constructor() {
    this.isAuthenticated = sessionStorage.getItem('catalog_auth') === 'true';
    
    const c = localStorage.getItem('catalog_categories');
    if (c) {
      this.categories = JSON.parse(c);
    } else {
      this.categories = ['Electrónica', 'Ropa', 'Deportes', 'Hogar'];
    }

    this.loadFromSupabase();
  }

  async loadFromSupabase() {
    try {
      const { data: storesData, error: storesError } = await supabase.from('stores').select('*').order('created_at', { ascending: true });
      if (storesError) throw storesError;
      
      const { data: productsData, error: productsError } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (productsError) throw productsError;

      this.stores = storesData || [];
      this.products = productsData || [];

      if (this.stores.length > 0 && !this.activeStoreId) {
        this.activeStoreId = this.stores[0].id;
      }
    } catch (error: any) {
      console.error("Error cargando datos de Supabase:", error);
      alert(`Error al conectar con Supabase: ${error.message || error}`);
    } finally {
      this.isLoaded = true;
      this.notify();
    }
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

  setActiveStore = (storeId: string) => {
    this.activeStoreId = storeId;
    this.notify();
  }

  // --- GUARDA TIENDA CON DIAGNÓSTICO ---
  addStore = async (store: Omit<Store, 'id'>) => {
    const newStore = { ...store, id: `store-${Date.now()}` };
    
    this.stores = [...this.stores, newStore];
    this.activeStoreId = newStore.id;
    this.notify();
    
    // Alerta si falla la inserción en la nube
    const { error } = await supabase.from('stores').insert([newStore]);
    if (error) {
      console.error("Error Supabase addStore:", error);
      alert(`Supabase rechazó la tienda: ${error.message}\nCódigo: ${error.code}`);
    }
  }

  updateStore = async (id: string, updatedData: Partial<Store>) => {
    this.stores = this.stores.map(s => s.id === id ? { ...s, ...updatedData } : s);
    this.notify();
    
    const { error } = await supabase.from('stores').update(updatedData).eq('id', id);
    if (error) alert(`Error al actualizar tienda: ${error.message}`);
  }

  deleteStore = async (id: string) => {
    this.stores = this.stores.filter(s => s.id !== id);
    if (this.activeStoreId === id && this.stores.length > 0) {
      this.activeStoreId = this.stores[0].id;
    }
    this.notify();
    
    const { error } = await supabase.from('stores').delete().eq('id', id);
    if (error) alert(`Error al eliminar tienda: ${error.message}`);
  }

  // --- GUARDA PRODUCTO CON DIAGNÓSTICO ---
  addProduct = async (product: Omit<Product, 'id' | 'storeId'>) => {
    const storeId = this.activeStoreId || (this.stores[0]?.id || 'store-1');
    const newProduct = { ...product, id: `prod-${Date.now()}`, storeId };
    
    this.products = [newProduct, ...this.products];
    this.notify();
    
    // Alerta si falla la inserción en la nube
    const { error } = await supabase.from('products').insert([newProduct]);
    if (error) {
      console.error("Error Supabase addProduct:", error);
      alert(`Supabase rechazó el producto: ${error.message}\nCódigo: ${error.code}`);
    }
  }

  updateProduct = async (id: string, updatedData: Partial<Product>) => {
    this.products = this.products.map(p => p.id === id ? { ...p, ...updatedData } : p);
    this.notify();
    
    const { error } = await supabase.from('products').update(updatedData).eq('id', id);
    if (error) alert(`Error al actualizar producto: ${error.message}`);
  }

  deleteProduct = async (id: string) => {
    this.products = this.products.filter(p => p.id !== id);
    this.notify();
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) alert(`Error al eliminar producto: ${error.message}`);
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
