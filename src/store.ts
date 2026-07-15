import { useState, useEffect } from 'react';
import { Product, Category, Store, Color } from './types';
import { supabase } from './supabase';

class CatalogStore {
  stores: Store[] = [];
  products: Product[] = [];
  categories: Category[] = [];
  colors: Color[] = [];
  isLoaded = false;
  isAuthenticated = false;
  activeStoreId: string = '';

  private listeners = new Set<() => void>();

  constructor() {
    this.isAuthenticated = sessionStorage.getItem('catalog_auth') === 'true';
    this.loadFromSupabase();
    this.setupRealtime(); // Iniciamos el radar de tiempo real
  }

  // --- LÓGICA DE TIEMPO REAL ---
  setupRealtime() {
    supabase.channel('catalog-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        this.loadFromSupabase(); // Si hay cambio en productos, recarga silenciosamente
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        this.loadFromSupabase(); // Si hay cambio en categorías, recarga silenciosamente
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'colors' }, () => {
        this.loadFromSupabase();
      })
      .subscribe();
  }

  async loadFromSupabase() {
    try {
      // Optimizamos: Lanzamos todas las peticiones simultáneamente en paralelo
      const [storesResult, productsResult, categoriesResult, colorsResult] = await Promise.all([
        supabase.from('stores').select('*').order('created_at', { ascending: true }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('created_at', { ascending: true }),
        supabase.from('colors').select('*').order('name', { ascending: true })
      ]);

      // Evaluamos si hubo errores en alguna de las peticiones
      if (storesResult.error) throw storesResult.error;
      if (productsResult.error) throw productsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (colorsResult.error) throw colorsResult.error;

      // Asignamos los datos una sola vez
      this.stores = storesResult.data || [];
      this.products = productsResult.data || [];
      this.categories = categoriesResult.data || [];
      this.colors = colorsResult.data || [];

      if (this.stores.length > 0 && !this.activeStoreId) {
        this.activeStoreId = this.stores[0].id;
      }
    } catch (error: any) {
      console.error("Error cargando datos de Supabase:", error);
    } finally {
      this.isLoaded = true;
      this.notify(); // Notificamos una sola vez al terminar todo
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
    if (error) alert(`Error actualizando: ${error.message}`);
  }

  deleteStore = async (id: string) => {
    this.stores = this.stores.filter(s => s.id !== id);
    if (this.activeStoreId === id && this.stores.length > 0) this.activeStoreId = this.stores[0].id;
    this.notify();
    await supabase.from('stores').delete().eq('id', id);
  }

  addProduct = async (product: Omit<Product, 'id' | 'storeId'>) => {
    const storeId = this.activeStoreId || (this.stores[0]?.id || 'store-1');
    const newProduct = { ...product, id: `prod-${Date.now()}`, storeId };
    
    // Lo agregamos a la vista temporalmente para que se sienta instantáneo,
    // el Realtime se encargará de sincronizar si hay otros dispositivos.
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

  addCategory = async (categoryData: Omit<Category, 'id' | 'storeId'>) => {
    const trimmed = categoryData.name.trim();
    if (!trimmed) return;
    const storeId = this.activeStoreId || (this.stores[0]?.id || 'store-1');
    const newCategory = { ...categoryData, id: `cat-${Date.now()}`, storeId, name: trimmed };
    this.categories = [...this.categories, newCategory];
    this.notify();
    const { error } = await supabase.from('categories').insert([newCategory]);
    if (error) alert(`Error guardando categoría: ${error.message}`);
  }

  updateCategory = async (id: string, updatedData: Partial<Category>) => {
    const oldCategory = this.categories.find(c => c.id === id);
    if (!oldCategory) return;
    const oldName = oldCategory.name;

    if (updatedData.name) updatedData.name = updatedData.name.trim();

    this.categories = this.categories.map(c => c.id === id ? { ...c, ...updatedData } : c);
    
    if (updatedData.name && updatedData.name !== oldName) {
      const newName = updatedData.name;
      this.products = this.products.map(p => p.category === oldName && p.storeId === oldCategory.storeId ? { ...p, category: newName } : p);
      await supabase.from('products').update({ category: newName }).eq('category', oldName).eq('storeId', oldCategory.storeId);
    }
    
    this.notify();
    const { error: catError } = await supabase.from('categories').update(updatedData).eq('id', id);
    if (catError) alert(`Error actualizando categoría: ${catError.message}`);
  }
  
  deleteCategory = async (id: string) => {
    this.categories = this.categories.filter(c => c.id !== id);
    this.notify();
    await supabase.from('categories').delete().eq('id', id);
  }

  addColor = async (colorData: Omit<Color, 'id' | 'storeId'>) => {
    const storeId = this.activeStoreId || (this.stores[0]?.id || 'store-1');
    const newColor = { ...colorData, id: `col-${Date.now()}`, storeId };
    this.colors = [...this.colors, newColor];
    this.notify();
    const { error } = await supabase.from('colors').insert([newColor]);
    if (error) alert(`Error guardando color: ${error.message}`);
  }

  deleteColor = async (id: string) => {
    this.colors = this.colors.filter(c => c.id !== id);
    this.notify();
    await supabase.from('colors').delete().eq('id', id);
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
