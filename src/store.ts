import { useState, useEffect } from 'react';
import { Product, Category, Store, Color, Order } from './types';
import { supabase } from './supabase';

class CatalogStore {
  stores: Store[] = [];
  products: Product[] = [];
  categories: Category[] = [];
  colors: Color[] = [];
  orders: Order[] = []; 
  
  isLoaded = false;
  isAuthenticated = false;
  activeStoreId: string = '';

  private listeners = new Set<() => void>();

  constructor() {
    this.isAuthenticated = localStorage.getItem('catalog_auth') === 'true';
    this.loadFromSupabase();
    this.setupRealtime(); 
  }

  setupRealtime() {
    supabase.channel('catalog-master-channel')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('⚡ ¡Actualización en vivo detectada!', payload);
        this.loadFromSupabase(); 
      })
      .subscribe();
  }

  async loadFromSupabase() {
    try {
      const [storesRes, productsRes, categoriesRes, colorsRes] = await Promise.all([
        supabase.from('stores').select('*').order('created_at', { ascending: true }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('created_at', { ascending: true }),
        supabase.from('colors').select('*').order('name', { ascending: true })
      ]);

      if (storesRes.error) throw storesRes.error;
      
      this.stores = storesRes.data || [];
      this.products = productsRes.data || [];
      this.categories = categoriesRes.data || [];
      this.colors = colorsRes.data || [];

      const ordersRes = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!ordersRes.error) {
        this.orders = ordersRes.data || [];
      } else {
        console.warn("Nota: No se pudieron cargar los pedidos.", ordersRes.error.message);
      }

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

  private notify() { this.listeners.forEach(l => l()); }
  subscribe(listener: () => void) { this.listeners.add(listener); return () => this.listeners.delete(listener); }

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

  setActiveStore = (storeId: string) => { this.activeStoreId = storeId; this.notify(); }

  // --- LÓGICA DE TIENDAS ---
  addStore = async (store: Omit<Store, 'id'>) => {
    const newStore = { ...store, id: `store-${Date.now()}` };
    this.stores = [...this.stores, newStore];
    this.activeStoreId = newStore.id;
    this.notify();
    await supabase.from('stores').insert([newStore]);
  }

  updateStore = async (id: string, updatedData: Partial<Store>) => {
    this.stores = this.stores.map(s => s.id === id ? { ...s, ...updatedData } : s);
    this.notify();
    await supabase.from('stores').update(updatedData).eq('id', id);
  }

  deleteStore = async (id: string) => {
    this.stores = this.stores.filter(s => s.id !== id);
    if (this.activeStoreId === id && this.stores.length > 0) this.activeStoreId = this.stores[0].id;
    this.notify();
    await supabase.from('stores').delete().eq('id', id);
  }

  // --- LÓGICA DE PRODUCTOS ---
  addProduct = async (product: Omit<Product, 'id' | 'storeId'>) => {
    const storeId = this.activeStoreId || (this.stores[0]?.id || 'store-1');
    const newProduct = { ...product, id: `prod-${Date.now()}`, storeId };
    this.products = [newProduct, ...this.products];
    this.notify();
    await supabase.from('products').insert([newProduct]);
  }

  updateProduct = async (id: string, updatedData: Partial<Product>) => {
    this.products = this.products.map(p => p.id === id ? { ...p, ...updatedData } : p);
    this.notify();
    await supabase.from('products').update(updatedData).eq('id', id);
  }

  deleteProduct = async (id: string) => {
    this.products = this.products.filter(p => p.id !== id);
    this.notify();
    await supabase.from('products').delete().eq('id', id);
  }

  // --- LÓGICA DE CATEGORÍAS ---
  addCategory = async (categoryData: Omit<Category, 'id' | 'storeId'>) => {
    const trimmed = categoryData.name.trim();
    if (!trimmed) return;
    const storeId = this.activeStoreId || (this.stores[0]?.id || 'store-1');
    const newCategory = { ...categoryData, id: `cat-${Date.now()}`, storeId, name: trimmed };
    this.categories = [...this.categories, newCategory];
    this.notify();
    await supabase.from('categories').insert([newCategory]);
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
    await supabase.from('categories').update(updatedData).eq('id', id);
  }
  
  deleteCategory = async (id: string) => {
    this.categories = this.categories.filter(c => c.id !== id);
    this.notify();
    await supabase.from('categories').delete().eq('id', id);
  }

  // --- LÓGICA DE COLORES ---
  addColor = async (colorData: any) => {
    const colorWithId = { ...colorData, id: colorData.id || crypto.randomUUID() };
    const { data } = await supabase.from('colors').insert([colorWithId]).select().single();
    if (data) { this.colors = [...this.colors, data]; this.notify(); }
  }

  updateColor = async (id: string, updatedData: any) => {
    const { data } = await supabase.from('colors').update(updatedData).eq('id', id).select().single();
    if (data) { this.colors = this.colors.map(c => c.id === id ? { ...c, ...data } : c); this.notify(); }
  }

  deleteColor = async (id: string) => {
    await supabase.from('colors').delete().eq('id', id);
    this.colors = this.colors.filter(c => c.id !== id);
    this.notify();
  }

  // ==========================================
  // LÓGICA DE PEDIDOS E INVENTARIO (CORREGIDA)
  // ==========================================

  addOrder = async (orderData: Omit<Order, 'id' | 'status' | 'created_at'>) => {
    const newOrder: Order = { 
      ...orderData, 
      id: `PED-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'PENDIENTE' // Forzamos mayúscula para mantener consistencia
    };
    
    this.orders = [newOrder, ...this.orders];
    this.notify();
    
    const { error } = await supabase.from('orders').insert([newOrder]);
    
    if (error) {
      console.error("Error creando pedido en Supabase:", error);
      alert(`⚠️ Error guardando el pedido: ${error.message}`);
    }
    
    return newOrder;
  }

  // AHORA RECIBE 3 PARÁMETROS: storeId, orderId y paymentData (para que coincida con el modal)
  confirmOrderPayment = async (
    storeId: string, 
    orderId: string, 
    paymentData: { clientName: string, phone: string, reference: string }
  ) => {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    // 1. Actualizar el pedido en la pantalla localmente
    const updatedOrder = { 
      ...order, 
      customerName: paymentData.clientName || order.customerName, // Mantiene el nombre si lo editaron
      clientPhone: paymentData.phone,       // Datos del nuevo modal
      paymentReference: paymentData.reference, // Datos del nuevo modal
      status: 'PAGADO' as any 
    };
    this.orders = this.orders.map(o => o.id === orderId ? updatedOrder : o);

    // 2. Descontar stock matemático
    for (const item of order.items) {
      const product = this.products.find(p => p.id === item.productId);
      if (product) {
        let updatedProduct = { ...product };
        let changed = false;

        if (item.color && updatedProduct.variants && updatedProduct.variants.length > 0) {
          updatedProduct.variants = updatedProduct.variants.map(v => {
            if (v.color === item.color) {
              changed = true;
              const oldStock = v.stockQuantity || 0;
              const newStock = Math.max(0, oldStock - item.quantity);
              const newStatus = newStock === 0 && oldStock > 0 ? 'agotado' : v.stockStatus;
              return { ...v, stockQuantity: newStock, stockStatus: newStatus };
            }
            return v;
          });
        } else {
          changed = true;
          const oldStock = updatedProduct.stockQuantity || 0;
          const newStock = Math.max(0, oldStock - item.quantity);
          const newStatus = newStock === 0 && oldStock > 0 ? 'agotado' : updatedProduct.stockStatus;
          updatedProduct.stockQuantity = newStock;
          updatedProduct.stockStatus = newStatus;
        }

        if (changed) {
          this.products = this.products.map(p => p.id === product.id ? updatedProduct : p);
          supabase.from('products').update({ 
            stockQuantity: updatedProduct.stockQuantity,
            stockStatus: updatedProduct.stockStatus,
            variants: updatedProduct.variants
          }).eq('id', product.id).then();
        }
      }
    }
    this.notify();

    // 3. Guardar el cobro en Supabase usando las columnas exactas que creamos
    const { error } = await supabase.from('orders').update({
      status: 'PAGADO',
      customerName: paymentData.clientName || order.customerName,
      clientPhone: paymentData.phone,
      paymentReference: paymentData.reference
    }).eq('id', orderId);

    if (error) {
      console.error("Error al guardar pago en Supabase:", error);
      alert(`Error de base de datos: ${error.message}`);
    }
  }

  // AHORA RECIBE 2 PARÁMETROS para coincidir con la llamada desde AdminOrders.tsx
  cancelOrder = async (storeId: string, orderId: string) => {
    this.orders = this.orders.map(o => o.id === orderId ? { ...o, status: 'CANCELADO' as any } : o);
    this.notify();
    await supabase.from('orders').update({ status: 'CANCELADO' }).eq('id', orderId);
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
