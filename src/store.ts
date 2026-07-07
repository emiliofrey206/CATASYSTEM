import { useState, useEffect } from 'react';
import { Product, Category, Store } from './types';
import { products as initialProducts, categories as initialCategories, mockStore } from './data';

class CatalogStore {
  stores: Store[] = [mockStore];
  products: Product[] = initialProducts;
  categories: Category[] = initialCategories;
  isLoaded = false;
  isAuthenticated = false;
  
  // NUEVO: Mantiene el registro de qué tienda estás administrando en este momento
  activeStoreId: string = mockStore.id; 
  
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
      
      if (s) {
        this.stores = JSON.parse(s);
        // Si hay tiendas cargadas pero ninguna activa, seleccionamos la primera por defecto
        if (this.stores.length > 0 && !this.stores.find(store => store.id === this.activeStoreId)) {
          this.activeStoreId = this.stores[0].id;
        }
      } else {
        localStorage.setItem('catalog_stores', JSON.stringify(this.stores));
      }

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
