/**
 * Shipping React Query Hooks
 *
 * Custom hooks for shipping address and logistics management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getShippers,
  createShipper,
  updateShipper,
  deleteShipper,
  getRecipients,
  createRecipient,
  updateRecipient,
  deleteRecipient,
  getLogisticsProviders,
  processOrder,
  seedAddresses,
  type SavedAddressCreate,
  type SavedAddressUpdate,
  type OrderProcessingRequest,
} from '@/lib/api/shipping';

/**
 * Fetch all saved shipper addresses
 */
export function useShippers() {
  return useQuery({
    queryKey: ['shipping', 'shippers'],
    queryFn: getShippers,
    staleTime: 60000, // Cache for 1 minute
  });
}

/**
 * Create a new shipper address
 */
export function useCreateShipper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShipper,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'shippers'] });
      toast.success('Shipper address saved');
    },
    onError: (error) => {
      console.error('Failed to create shipper:', error);
      toast.error('Failed to save shipper address');
    },
  });
}

/**
 * Update a shipper address
 */
export function useUpdateShipper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, data }: { addressId: string; data: SavedAddressUpdate }) =>
      updateShipper(addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'shippers'] });
      toast.success('Shipper address updated');
    },
    onError: (error) => {
      console.error('Failed to update shipper:', error);
      toast.error('Failed to update shipper address');
    },
  });
}

/**
 * Delete a shipper address
 */
export function useDeleteShipper() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteShipper,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'shippers'] });
      toast.success('Shipper address deleted');
    },
    onError: (error) => {
      console.error('Failed to delete shipper:', error);
      toast.error('Failed to delete shipper address');
    },
  });
}

/**
 * Fetch all saved recipient addresses
 */
export function useRecipients() {
  return useQuery({
    queryKey: ['shipping', 'recipients'],
    queryFn: getRecipients,
    staleTime: 60000,
  });
}

/**
 * Create a new recipient address
 */
export function useCreateRecipient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRecipient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'recipients'] });
      toast.success('Recipient address saved');
    },
    onError: (error) => {
      console.error('Failed to create recipient:', error);
      toast.error('Failed to save recipient address');
    },
  });
}

/**
 * Update a recipient address
 */
export function useUpdateRecipient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, data }: { addressId: string; data: SavedAddressUpdate }) =>
      updateRecipient(addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'recipients'] });
      toast.success('Recipient address updated');
    },
    onError: (error) => {
      console.error('Failed to update recipient:', error);
      toast.error('Failed to update recipient address');
    },
  });
}

/**
 * Delete a recipient address
 */
export function useDeleteRecipient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecipient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping', 'recipients'] });
      toast.success('Recipient address deleted');
    },
    onError: (error) => {
      console.error('Failed to delete recipient:', error);
      toast.error('Failed to delete recipient address');
    },
  });
}

/**
 * Fetch logistics providers
 */
export function useLogisticsProviders() {
  return useQuery({
    queryKey: ['shipping', 'providers'],
    queryFn: getLogisticsProviders,
    staleTime: 300000, // Cache for 5 minutes
  });
}

/**
 * Process an order (final step with shipping details)
 */
export function useProcessOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: OrderProcessingRequest }) =>
      processOrder(orderId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      toast.success(response.message || 'Order processed successfully');
    },
    onError: (error) => {
      console.error('Failed to process order:', error);
      toast.error('Failed to process order');
    },
  });
}

/**
 * Seed addresses for testing
 */
export function useSeedAddresses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seedAddresses,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shipping'] });
      toast.success(`Seeded ${data.shippers_created} shippers and ${data.recipients_created} recipients`);
    },
    onError: (error) => {
      console.error('Failed to seed addresses:', error);
      toast.error('Failed to seed addresses');
    },
  });
}
