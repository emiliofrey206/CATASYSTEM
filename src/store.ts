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
    this.isAuthenticated = localStorage.getItem('catalog_auth') === 'true';
    this.loadFromSupabase();
    this.setupRealtime(); 
  }

  // --- LÓGICA DE TIEMPO REAL (RADAR MAESTRO OPTIMIZADO) ---
  setupRealtime() {
    // Escuchamos TODO el esquema 'public' de un solo golpe. 
    // Si cualquier cosa cambia, el catálogo reacciona al instante.
    supabase.channel('catalog-master-channel')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('⚡ ¡Actualización en vivo detectada!', payload);
        this.loadFromSupabase(); 
      })
      .subscribe((status) => {
        console.log('📡 Radar Realtime:', status);
      });
  }

  async loadFromSupabase() {
    try {
      const [storesResult, productsResult, categoriesResult, colorsResult] = await Promise.all([
        supabase.from('stores').select('*').order('created_at', { ascending: true }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('created_at', { ascending: true }),
        supabase.from('colors').select('*').order('name', { ascending: true })
      ]);

      if (storesResult.error) throw storesResult.error;
      if (productsResult.error) throw productsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (colorsResult.error) throw colorsResult.error;

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
      localStorage.setItem('catalog_auth', 'true');
      this.notify();
      return true;
    }
    return false;
  }

  logout = () => {
    this.isAuthenticated = false;
    localStorage.removeItem('catalog_auth');
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

  addColor = async (colorData: any) => {
    const colorWithId = {
      ...colorData,
      id: colorData.id || crypto.randomUUID() 
    };

    const { data, error } = await supabase
      .from('colors')
      .insert([colorWithId])
      .select()
      .single();

    if (error) {
      alert(`ERROR CRÍTICO: El color no se guardó.\nMotivo: ${error.message}`);
      throw error;
    }

    this.colors = [...this.colors, data];
    this.notify();
  }

  updateColor = async (id: string, updatedData: any) => {
    const { data, error } = await supabase
      .from('colors')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      alert(`ERROR CRÍTICO: No se actualizó en la Base de Datos.\nMotivo: ${error.message}`);
      throw error;
    }

    this.colors = this.colors.map(c => c.id === id ? { ...c, ...data } : c);
    this.notify();
  }

  deleteColor = async (id: string) => {
    const { error } = await supabase
      .from('colors')
      .delete()
      .eq('id', id);

    if (error) {
      alert(`ERROR CRÍTICO: No se pudo eliminar de la Base de Datos.\nMotivo: ${error.message}`);
      throw error;
    }

    this.colors = this.colors.filter(c => c.id !== id);
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
