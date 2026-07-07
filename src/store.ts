import { useState, useEffect } from 'react';
import { Product, Category, Store } from './types';
import { supabase } from './supabase';

class CatalogStore {
  stores: Store[] = [];
  products: Product[] = [];
  categories: Category[] = []; // Ahora es un arreglo de objetos reales
  isLoaded = false;
  isAuthenticated = false;
  activeStoreId: string = '';

  private listeners = new Set<() => void>();

  constructor() {
    this.isAuthenticated = sessionStorage.getItem('catalog_auth') === 'true';
    this.loadFromSupabase();
  }

  async loadFromSupabase() {
    try {
      const { data: storesData, error: storesError } = await supabase.from('stores').select('*').order('created_at', { ascending: true });
      if (storesError) throw storesError;
      
      const { data: productsData, error: productsError } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (productsError) throw productsError;

      // NUEVO: Cargamos las categorías desde Supabase
      const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
      if (categoriesError) throw categoriesError;

      this.stores = storesData || [];
      this.products = productsData || [];
      this.categories = categoriesData || [];

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

  // --- TIENDAS ---
  addStore = async (store: Omit<Store, 'id'>) => {
    const newStore = { ...store, id: `store-${Date.now()}` };
    this.stores = [...this.stores, newStore];
    this.activeStoreId = newStore.id;
    this.notify();
    
    const { error } = await supabase.from('stores').insert([newStore]);
    if (error) alert(`Error guardando tienda: ${error.message}`);
  }

  updateStore = async (id: string, updatedData: Partial<Store>) => {
    this.stores = this.stores.map(s => s.id === id ? { ...s, ...updatedData } : s);
    this.notify();
    const { error } = await supabase.from('stores').update(updatedData).eq('id', id);
    if (error) alert(`Error actualizando tienda: ${error.message}`);
  }

  deleteStore = async (id: string) => {
    this.stores = this.stores.filter(s => s.id !== id);
    if (this.activeStoreId === id && this.stores.length > 0) {
      this.activeStoreId = this.stores[0].id;
    }
    this.notify();
    await supabase.from('stores').delete().eq('id', id);
  }

  // --- PRODUCTOS ---
  addProduct = async (product: Omit<Product, 'id' | 'storeId'>) => {
    const storeId = this.activeStoreId || (this.stores[0]?.id || 'store-1');
    const newProduct = { ...product, id: `prod-${Date.now()}`, storeId };
    
    this.products = [newProduct, ...this.products];
    this.notify();
    
    const { error } = await supabase.from('products').insert([newProduct]);
    if (error) alert(`Error guardando producto: ${error.message}`);
  }

  updateProduct = async (id: string, updatedData: Partial<Product>) => {
    this.products = this.products.map(p => p.id === id ? { ...p, ...updatedData } : p);
    this.notify();
    const { error } = await supabase.from('products').update(updatedData).eq('id', id);
    if (error) alert(`Error actualizando producto: ${error.message}`);
  }

  deleteProduct = async (id: string) => {
    this.products = this.products.filter(p => p.id !== id);
    this.notify();
    await supabase.from('products').delete().eq('id', id);
  }

  // --- CATEGORÍAS (NUEVO CRUD CON SUPABASE) ---
  addCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const storeId = this.activeStoreId || (this.stores[0]?.id || 'store-1');
    const newCategory = { id: `cat-${Date.now()}`, storeId, name: trimmed };
    
    this.categories = [...this.categories, newCategory];
    this.notify();

    const { error } = await supabase.from('categories').insert([newCategory]);
    if (error) alert(`Error guardando categoría: ${error.message}`);
  }

  deleteCategory = async (id: string) => {
    this.categories = this.categories.filter(c => c.id !== id);
    this.notify();
    await supabase.from('categories').delete().eq('id', id);
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
