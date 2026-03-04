/**
 * Gift React Query Hooks
 *
 * Custom hooks for gift management with caching and mutations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getGifts,
  getGift,
  createGift,
  updateGift,
  deleteGift,
  getGiftStats,
  seedGifts,
  type GiftListResponse,
  type GiftItem,
} from '@/lib/api/gifts';

/**
 * Fetch gift list with filtering and pagination
 */
export function useGiftList(params?: {
  marketplace_source?: string;
  tier_level?: string;
  live_simulcast_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ['gifts', params],
    queryFn: () => getGifts(params),
    staleTime: 30000,
  });
}

/**
 * Fetch single gift
 */
export function useGift(giftId: string) {
  return useQuery({
    queryKey: ['gifts', giftId],
    queryFn: () => getGift(giftId),
    enabled: !!giftId,
    staleTime: 10000,
  });
}

/**
 * Create a new gift
 */
export function useCreateGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
      toast.success('Gift created');
    },
    onError: (error) => {
      console.error('Failed to create gift:', error);
      toast.error('Failed to create gift');
    },
  });
}

/**
 * Update a gift
 */
export function useUpdateGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ giftId, data }: { giftId: string; data: Parameters<typeof updateGift>[1] }) =>
      updateGift(giftId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
      queryClient.invalidateQueries({ queryKey: ['gifts', variables.giftId] });
      toast.success('Gift updated');
    },
    onError: (error) => {
      console.error('Failed to update gift:', error);
      toast.error('Failed to update gift');
    },
  });
}

/**
 * Delete a gift
 */
export function useDeleteGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
      toast.success('Gift deleted');
    },
    onError: (error) => {
      console.error('Failed to delete gift:', error);
      toast.error('Failed to delete gift');
    },
  });
}

/**
 * Fetch gift statistics
 */
export function useGiftStats() {
  return useQuery({
    queryKey: ['gifts', 'stats'],
    queryFn: getGiftStats,
    staleTime: 60000,
  });
}

/**
 * Seed gift database
 */
export function useSeedGifts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (count?: number) => seedGifts(count),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
      toast.success('Gifts seeded successfully');
    },
    onError: (error) => {
      console.error('Failed to seed gifts:', error);
      toast.error('Failed to seed gifts');
    },
  });
}
