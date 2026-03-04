/**
 * Inventory API Client
 *
 * API functions for inventory management operations.
 */

import { api } from '../api';

// Types
export interface Warehouse {
  _id: string;
  name: {
    en: string;
    ko: string;
  };
  location: string;
  city: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductCategory = 'electronics' | 'clothing' | 'beauty' | 'food' | 'home' | 'sports' | 'toys' | 'other';

export interface InventoryItem {
  _id: string;
  product_id: string;
  product_name: {
    en: string;
    ko: string;
  };
  warehouse_id: string;
  warehouse_name?: {
    en: string;
    ko: string;
  };
  quantity: number;
  reserved: number;
  available: number;
  reorder_point: number;
  critical_level: number;
  sku: string;
  unit_cost: number;
  category?: ProductCategory;
  product_link?: string;
  image_url?: string;
  status: 'active' | 'inactive' | 'discontinued';
  is_low_stock: boolean;
  is_critical_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  value: string;
  label: string;
  count: number;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface InventoryLog {
  _id: string;
  inventory_id: string;
  product_name: {
    en: string;
    ko: string;
  };
  warehouse_id: string;
  action: 'restock' | 'sale' | 'adjustment' | 'reservation' | 'release' | 'return';
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reference_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface StockAlert {
  _id: string;
  inventory_id: string;
  product_name: {
    en: string;
    ko: string;
  };
  warehouse_id: string;
  warehouse_name: {
    en: string;
    ko: string;
  };
  sku: string;
  alert_type: 'low_stock' | 'critical_stock' | 'overstock';
  current_level: number;
  threshold: number;
  is_acknowledged: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
  created_at: string;
}

export interface InventoryStats {
  total_items: number;
  total_warehouses: number;
  low_stock_count: number;
  critical_stock_count: number;
  total_quantity: number;
  total_reserved: number;
  total_available: number;
  total_value: number;
}

export interface InventoryListResponse {
  items: InventoryItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface InventoryLogListResponse {
  items: InventoryLog[];
  total: number;
  page: number;
  page_size: number;
}

export interface StockAlertListResponse {
  items: StockAlert[];
  total: number;
}

// Warehouse API

export const getWarehouses = async (): Promise<Warehouse[]> => {
  const response = await api.get('/inventory/warehouses');
  return response.data;
};

export const getWarehouse = async (warehouseId: string): Promise<Warehouse> => {
  const response = await api.get(`/inventory/warehouses/${warehouseId}`);
  return response.data;
};

export const createWarehouse = async (data: {
  name: { en: string; ko: string };
  location: string;
  city: string;
  country: string;
  is_default?: boolean;
}): Promise<Warehouse> => {
  const response = await api.post('/inventory/warehouses', data);
  return response.data;
};

// Inventory API

export const getInventory = async (params?: {
  warehouse_id?: string;
  stock_status?: 'all' | 'low' | 'critical' | 'normal';
  category?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<InventoryListResponse> => {
  const response = await api.get('/inventory/inventory', { params });
  return response.data;
};

export const getCategories = async (): Promise<CategoriesResponse> => {
  const response = await api.get('/inventory/inventory/categories');
  return response.data;
};

export const getInventoryItem = async (inventoryId: string): Promise<InventoryItem> => {
  const response = await api.get(`/inventory/inventory/${inventoryId}`);
  return response.data;
};

export const createInventory = async (data: {
  product_id: string;
  product_name: { en: string; ko: string };
  warehouse_id: string;
  quantity: number;
  reserved?: number;
  reorder_point: number;
  critical_level: number;
  sku: string;
  unit_cost?: number;
  product_link?: string;
  status?: 'active' | 'inactive' | 'discontinued';
}): Promise<InventoryItem> => {
  const response = await api.post('/inventory/inventory', data);
  return response.data;
};

export const updateInventory = async (
  inventoryId: string,
  data: {
    product_name?: { en: string; ko: string };
    warehouse_id?: string;
    quantity?: number;
    reserved?: number;
    reorder_point?: number;
    critical_level?: number;
    unit_cost?: number;
    product_link?: string;
    status?: 'active' | 'inactive' | 'discontinued';
  }
): Promise<InventoryItem> => {
  const response = await api.put(`/inventory/inventory/${inventoryId}`, data);
  return response.data;
};

export const deleteInventory = async (inventoryId: string): Promise<void> => {
  await api.delete(`/inventory/inventory/${inventoryId}`);
};

// Stock Operations

export const restockInventory = async (data: {
  inventory_id: string;
  quantity: number;
  notes?: string;
}): Promise<InventoryItem> => {
  const response = await api.post('/inventory/inventory/restock', data);
  return response.data;
};

export const reserveStock = async (data: {
  inventory_id: string;
  quantity: number;
  reference_id?: string;
}): Promise<InventoryItem> => {
  const response = await api.post('/inventory/inventory/reserve', data);
  return response.data;
};

// Inventory Logs

export const getInventoryLogs = async (params?: {
  inventory_id?: string;
  page?: number;
  page_size?: number;
}): Promise<InventoryLogListResponse> => {
  const response = await api.get('/inventory/inventory/logs', { params });
  return response.data;
};

// Stock Alerts

export const getStockAlerts = async (params?: {
  acknowledged?: boolean;
}): Promise<StockAlertListResponse> => {
  const response = await api.get('/inventory/inventory/alerts', { params });
  return response.data;
};

export const acknowledgeAlert = async (
  alertId: string,
  acknowledgedBy?: string
): Promise<StockAlert> => {
  const response = await api.post(`/inventory/inventory/alerts/${alertId}/acknowledge`, {
    acknowledged_by: acknowledgedBy,
  });
  return response.data;
};

// Statistics

export const getInventoryStats = async (): Promise<InventoryStats> => {
  const response = await api.get('/inventory/inventory/stats');
  return response.data;
};

// Database Seeding

export const seedInventoryDatabase = async (): Promise<{ message: string }> => {
  const response = await api.post('/inventory/seed');
  return response.data;
};
