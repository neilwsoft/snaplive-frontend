/**
 * Orders React Query Hooks
 *
 * Custom hooks for order management with caching and mutations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
  getOrderStats,
  getRevenueStats,
  seedOrders,
  transformBackendToFrontend,
  transformBackendToOrderDetail,
  type GetOrdersParams,
  type UpdateOrderData,
  type OrderStatus,
  type Platform,
} from '@/lib/api/orders';
import type { Order } from '@/types/order';
import type { OrderDetail } from '@/types/order-detail';

/**
 * Fetch orders list with filtering and pagination
 */
export function useOrders(params?: GetOrdersParams) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = await getOrders(params);
      return {
        orders: response.orders.map(transformBackendToFrontend),
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: Math.ceil(response.total / response.page_size),
      };
    },
    staleTime: 30000, // Cache for 30 seconds
  });
}

/**
 * Fetch orders list with raw backend data (for components that need backend format)
 */
export function useOrdersRaw(params?: GetOrdersParams) {
  return useQuery({
    queryKey: ['orders', 'raw', params],
    queryFn: () => getOrders(params),
    staleTime: 30000,
  });
}

/**
 * Fetch single order detail
 */
export function useOrderDetail(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const order = await getOrder(orderId);
      return transformBackendToOrderDetail(order);
    },
    enabled: !!orderId,
    staleTime: 10000, // Cache for 10 seconds
  });
}

/**
 * Fetch single order with raw backend data
 */
export function useOrderRaw(orderId: string) {
  return useQuery({
    queryKey: ['order', 'raw', orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
    staleTime: 10000,
  });
}

/**
 * Update an order
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: UpdateOrderData }) =>
      updateOrder(orderId, data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      toast.success('Order updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order. Please try again.');
    },
  });
}

/**
 * Update order status specifically
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrder(orderId, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'stats'] });
      toast.success('Order status updated');
    },
    onError: (error) => {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    },
  });
}

/**
 * Update order processing step (for multi-step processing flow)
 */
export function useUpdateProcessingStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, step, data }: { orderId: string; step: number; data?: UpdateOrderData }) =>
      updateOrder(orderId, { ...data, processing_step: step }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      toast.success(variables.step === 2 ? 'Products confirmed, proceed to shipping' : 'Processing step updated');
    },
    onError: (error) => {
      console.error('Failed to update processing step:', error);
      toast.error('Failed to update processing step');
    },
  });
}

/**
 * Delete an order
 */
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'stats'] });
      toast.success('Order deleted');
    },
    onError: (error) => {
      console.error('Failed to delete order:', error);
      toast.error('Failed to delete order');
    },
  });
}

/**
 * Fetch order statistics
 */
export function useOrderStats() {
  return useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: getOrderStats,
    staleTime: 60000, // Cache for 1 minute
  });
}

/**
 * Fetch monthly revenue statistics for dashboard
 */
export function useRevenueStats(months: number = 5) {
  return useQuery({
    queryKey: ['orders', 'stats', 'revenue', months],
    queryFn: () => getRevenueStats(months),
    staleTime: 60000, // Cache for 1 minute
  });
}

/**
 * Seed orders for testing
 */
export function useSeedOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seedOrders,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'stats'] });
      toast.success(`${data.count} orders seeded successfully`);
    },
    onError: (error) => {
      console.error('Failed to seed orders:', error);
      toast.error('Failed to seed orders');
    },
  });
}

/**
 * Orders by status for dashboard tabs
 */
export function useOrdersByStatus(status?: OrderStatus, page: number = 1, pageSize: number = 20) {
  return useOrders({ status, page, page_size: pageSize });
}

/**
 * Orders by platform
 */
export function useOrdersByPlatform(platform: Platform, page: number = 1, pageSize: number = 20) {
  return useOrders({ platform, page, page_size: pageSize });
}

/**
 * Search orders
 */
export function useSearchOrders(searchQuery: string, page: number = 1, pageSize: number = 20) {
  return useOrders({ search: searchQuery, page, page_size: pageSize });
}
