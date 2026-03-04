/**
 * Inventory React Query Hooks
 *
 * Custom hooks for inventory management with caching and mutations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getInventory,
  getInventoryItem,
  getCategories,
  createInventory,
  updateInventory,
  deleteInventory,
  restockInventory,
  reserveStock,
  getInventoryLogs,
  getStockAlerts,
  acknowledgeAlert,
  getInventoryStats,
  seedInventoryDatabase,
  getWarehouses,
  type InventoryListResponse,
  type InventoryItem,
  type ProductCategory,
  type Warehouse,
} from '@/lib/api/inventory';

/**
 * Fetch inventory list with filtering and pagination
 */
export function useInventoryList(params?: {
  warehouse_id?: string;
  stock_status?: 'all' | 'low' | 'critical' | 'normal';
  category?: string;
  search?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => getInventory(params),
    staleTime: 30000, // Cache for 30 seconds
  });
}

/**
 * Fetch single inventory item
 */
export function useInventoryItem(inventoryId: string) {
  return useQuery({
    queryKey: ['inventory', inventoryId],
    queryFn: () => getInventoryItem(inventoryId),
    enabled: !!inventoryId,
    staleTime: 10000,
  });
}

/**
 * Fetch inventory categories with counts
 */
export function useInventoryCategories() {
  return useQuery({
    queryKey: ['inventory', 'categories'],
    queryFn: getCategories,
    staleTime: 60000, // Cache for 1 minute
  });
}

/**
 * Create new inventory item
 */
export function useCreateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Inventory item created');
    },
    onError: (error) => {
      console.error('Failed to create inventory item:', error);
      toast.error('Failed to create inventory item');
    },
  });
}

/**
 * Update inventory item
 */
export function useUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inventoryId, data }: { inventoryId: string; data: Parameters<typeof updateInventory>[1] }) =>
      updateInventory(inventoryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', variables.inventoryId] });
      toast.success('Inventory updated');
    },
    onError: (error) => {
      console.error('Failed to update inventory:', error);
      toast.error('Failed to update inventory');
    },
  });
}

/**
 * Delete inventory item
 */
export function useDeleteInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Inventory item deleted');
    },
    onError: (error) => {
      console.error('Failed to delete inventory item:', error);
      toast.error('Failed to delete inventory item');
    },
  });
}

/**
 * Restock inventory
 */
export function useRestockInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restockInventory,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', variables.inventory_id] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts'] });
      toast.success('Stock restocked successfully');
    },
    onError: (error) => {
      console.error('Failed to restock inventory:', error);
      toast.error('Failed to restock inventory');
    },
  });
}

/**
 * Reserve stock
 */
export function useReserveStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reserveStock,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', variables.inventory_id] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'logs'] });
      toast.success('Stock reserved');
    },
    onError: (error) => {
      console.error('Failed to reserve stock:', error);
      toast.error('Failed to reserve stock');
    },
  });
}

/**
 * Fetch inventory logs
 */
export function useInventoryLogs(params?: {
  inventory_id?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ['inventory', 'logs', params],
    queryFn: () => getInventoryLogs(params),
    staleTime: 15000,
  });
}

/**
 * Fetch stock alerts
 */
export function useStockAlerts(params?: { acknowledged?: boolean }) {
  return useQuery({
    queryKey: ['inventory', 'alerts', params],
    queryFn: () => getStockAlerts(params),
    staleTime: 30000,
  });
}

/**
 * Acknowledge a stock alert
 */
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, acknowledgedBy }: { alertId: string; acknowledgedBy?: string }) =>
      acknowledgeAlert(alertId, acknowledgedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts'] });
      toast.success('Alert acknowledged');
    },
    onError: (error) => {
      console.error('Failed to acknowledge alert:', error);
      toast.error('Failed to acknowledge alert');
    },
  });
}

/**
 * Fetch inventory statistics
 */
export function useInventoryStats() {
  return useQuery({
    queryKey: ['inventory', 'stats'],
    queryFn: getInventoryStats,
    staleTime: 60000, // Cache for 1 minute
  });
}

/**
 * Seed inventory database for testing
 */
export function useSeedInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seedInventoryDatabase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success('Inventory seeded successfully');
    },
    onError: (error) => {
      console.error('Failed to seed inventory:', error);
      toast.error('Failed to seed inventory');
    },
  });
}

/**
 * Filter inventory by category
 */
export function useInventoryByCategory(category: ProductCategory, page: number = 1, pageSize: number = 20) {
  return useInventoryList({ category, page, page_size: pageSize });
}

/**
 * Search inventory
 */
export function useSearchInventory(searchQuery: string, page: number = 1, pageSize: number = 20) {
  return useInventoryList({ search: searchQuery, page, page_size: pageSize });
}

/**
 * Get low stock items
 */
export function useLowStockItems(page: number = 1, pageSize: number = 20) {
  return useInventoryList({ stock_status: 'low', page, page_size: pageSize });
}

/**
 * Get critical stock items
 */
export function useCriticalStockItems(page: number = 1, pageSize: number = 20) {
  return useInventoryList({ stock_status: 'critical', page, page_size: pageSize });
}

/**
 * Fetch all warehouses
 */
export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: getWarehouses,
    staleTime: 300000, // Cache for 5 minutes
  });
}
