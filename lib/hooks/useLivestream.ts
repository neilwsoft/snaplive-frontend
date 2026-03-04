import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listRooms,
  getRoom,
  createRoom,
  deleteRoom
} from '@/lib/api/livekit';
import type { FeaturedProduct, StreamStats } from '@/lib/stores/livestreamStore';

// Room info hook
export function useRoomInfo(roomName: string | null) {
  return useQuery({
    queryKey: ['room', roomName],
    queryFn: () => (roomName ? getRoom(roomName) : null),
    enabled: !!roomName,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

// List all active rooms
export function useActiveRooms() {
  return useQuery({
    queryKey: ['rooms', 'active'],
    queryFn: () => listRooms(),
    refetchInterval: 5000,
  });
}

// Create room mutation
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      roomName: string;
      sellerId: string;
      maxParticipants?: number;
      emptyTimeout?: number;
      metadata?: string;
    }) => createRoom({
      room_name: params.roomName,
      seller_id: params.sellerId,
      max_participants: params.maxParticipants,
      enable_agent: false,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

// Delete room mutation
export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomName: string) => deleteRoom(roomName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

// Featured products hook
export function useFeaturedProducts(roomName: string | null) {
  return useQuery<FeaturedProduct[]>({
    queryKey: ['products', 'featured', roomName],
    queryFn: async () => {
      if (!roomName) return [];

      // TODO: Implement backend endpoint
      const response = await fetch(`/api/v1/livestream/rooms/${roomName}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured products');
      }
      return response.json();
    },
    enabled: !!roomName,
    initialData: [],
  });
}

// Add featured product mutation
export function useAddFeaturedProduct(roomName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Omit<FeaturedProduct, 'id' | 'isHighlighted'>) => {
      // TODO: Implement backend endpoint
      const response = await fetch(`/api/v1/livestream/rooms/${roomName}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'featured', roomName] });
    },
  });
}

// Remove featured product mutation
export function useRemoveFeaturedProduct(roomName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      // TODO: Implement backend endpoint
      const response = await fetch(`/api/v1/livestream/rooms/${roomName}/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove product');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'featured', roomName] });
    },
  });
}

// Highlight product mutation
export function useHighlightProduct(roomName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      // TODO: Implement backend endpoint
      const response = await fetch(
        `/api/v1/livestream/rooms/${roomName}/products/${productId}/highlight`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to highlight product');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'featured', roomName] });
    },
  });
}

// Stream analytics hook
export function useStreamAnalytics(roomName: string | null) {
  return useQuery<StreamStats>({
    queryKey: ['analytics', roomName],
    queryFn: async () => {
      if (!roomName) {
        return {
          viewerCount: 0,
          peakViewers: 0,
          duration: 0,
          messageCount: 0,
          reactionCount: 0,
          productClicks: 0,
        };
      }

      // TODO: Implement backend endpoint
      const response = await fetch(`/api/v1/livestream/rooms/${roomName}/analytics`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      return response.json();
    },
    enabled: !!roomName,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

// Viewer list hook
export function useViewerList(roomName: string | null) {
  return useQuery({
    queryKey: ['viewers', roomName],
    queryFn: async () => {
      if (!roomName) return [];

      // Get room info which includes participant count
      const room = await getRoom(roomName);
      return room;
    },
    enabled: !!roomName,
    refetchInterval: 3000, // Refresh every 3 seconds
  });
}

// Products from inventory (for seller to add to stream)
export function useInventoryProducts(sellerId?: string) {
  return useQuery({
    queryKey: ['inventory', 'products', sellerId],
    queryFn: async () => {
      // TODO: Implement backend endpoint to get seller's products
      const response = await fetch(`/api/v1/products?seller_id=${sellerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory products');
      }
      return response.json();
    },
    enabled: !!sellerId,
  });
}

// Track product click event
export function useTrackProductClick() {
  return useMutation({
    mutationFn: async (params: {
      roomName: string;
      productId: string;
      userId: string;
    }) => {
      // TODO: Implement backend endpoint
      const response = await fetch('/api/v1/livestream/analytics/product-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to track product click');
      }

      return response.json();
    },
  });
}

// Track purchase event
export function useTrackPurchase() {
  return useMutation({
    mutationFn: async (params: {
      roomName: string;
      productId: string;
      userId: string;
      quantity: number;
      amount: number;
    }) => {
      // TODO: Implement backend endpoint
      const response = await fetch('/api/v1/livestream/analytics/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to track purchase');
      }

      return response.json();
    },
  });
}
