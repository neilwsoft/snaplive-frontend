/**
 * Simulcast Hooks
 *
 * Custom hooks for the live simulcast page:
 * - Product fetching from inventory
 * - User search for invitations
 * - Livestream session management with LiveKit
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { getInventory, type InventoryItem } from '@/lib/api/inventory';
import { searchUsers, type User } from '@/lib/api/users';
import {
  createRoom,
  createHostToken,
  type CreateRoomRequest,
} from '@/lib/api/livekit';
import { useLivestreamStore } from '@/lib/stores/livestreamStore';
import {
  createSession,
  type CreateSessionData,
  type SessionProduct,
} from '@/lib/api/livestream-sessions';
import {
  createPreset,
  getPresets,
  getPreset,
  updatePreset as updatePresetApi,
  deletePreset as deletePresetApi,
  seedDummyPresets,
  type CreatePresetData,
  type UpdatePresetData,
  type SimulcastPreset,
} from '@/lib/api/simulcast-presets';
// startEgress moved to LiveSimulcastRoom (called after host connects)

// Types for the simulcast page
export interface SimulcastProduct {
  id: string;
  name: string;
  imageUrl: string;
  selected: boolean;
  sku?: string;
  quantity?: number;
  unitCost?: number;
  category?: string;
  isLowStock?: boolean;
  isCriticalStock?: boolean;
}

export interface InvitedUser {
  id: string;
  username: string;
  platform: string;
  avatarUrl?: string;
}

export interface SimulcastConfig {
  title: string;
  resolution: string;
  category?: string;
  platforms: string[];  // Just platform names (enabled ones)
  selectedProductIds: string[];
  invitedUserIds: string[];
}

export interface Camera {
  id: string;
  name: string;
  previewUrl?: string;
  selected: boolean;
}

export interface BrandingSettings {
  landscapeLogo?: string;
  boxedLogo?: string;
}

// Transform inventory item to simulcast product
function transformToProduct(item: InventoryItem): SimulcastProduct {
  return {
    id: item._id,
    name: item.product_name?.en || item.product_name?.ko || 'Unnamed Product',
    imageUrl: item.image_url || '/placeholder-product.png',
    selected: false,
    sku: item.sku,
    quantity: item.available,
    unitCost: item.unit_cost,
    category: item.category,
    isLowStock: item.is_low_stock,
    isCriticalStock: item.is_critical_stock,
  };
}

// Transform user to invited user format
function transformToInvitedUser(user: User): InvitedUser {
  return {
    id: user.id,
    username: user.full_name,
    platform: 'SnapLive', // Default platform
    avatarUrl: undefined,
  };
}

/**
 * Fetch products from inventory for selection
 */
export function useProducts(search?: string) {
  return useQuery({
    queryKey: ['simulcast', 'products', search],
    queryFn: async () => {
      const response = await getInventory({
        page: 1,
        page_size: 100,
        stock_status: 'all',
        search: search || undefined,
      });
      return response.items.map(transformToProduct);
    },
    staleTime: 30000, // Cache for 30 seconds
  });
}

/**
 * Search registered users for invitation
 */
export function useRegisteredUsers(searchQuery?: string) {
  return useQuery({
    queryKey: ['simulcast', 'users', searchQuery],
    queryFn: async () => {
      const users = await searchUsers({
        q: searchQuery,
        limit: 20,
      });
      return users.map(transformToInvitedUser);
    },
    enabled: true, // Always fetch, even without search query
    staleTime: 10000, // Cache for 10 seconds
  });
}

/**
 * Create a simulcast session with LiveKit room
 */
export function useCreateSimulcast() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setFeaturedProducts = useLivestreamStore((state) => state.setFeaturedProducts);

  return useMutation({
    mutationFn: async (params: {
      config: SimulcastConfig;
      sellerId: string;
      sellerName: string;
      products: SimulcastProduct[];
      destinationIds?: string[];
    }) => {
      const { config, sellerId, sellerName, products, destinationIds = [] } = params;

      // Get selected products for the store
      const featuredProductsForStore = products
        .filter((p) => config.selectedProductIds.includes(p.id))
        .map((p) => ({
          id: p.id,
          name: p.name,
          price: p.unitCost || 0,
          image: p.imageUrl,
          stock: p.quantity || 0,
          isHighlighted: false,
        }));

      // Set featured products in the store before creating room
      setFeaturedProducts(featuredProductsForStore);

      // Generate unique room name
      const roomName = `simulcast-${sellerId}-${Date.now()}`;

      // 1. Create LiveKit room
      const roomRequest: CreateRoomRequest = {
        room_name: roomName,
        seller_id: sellerId,
        max_participants: 1000,
        enable_agent: false,
      };

      const room = await createRoom(roomRequest);

      // 2. Prepare products for session
      const selectedProducts = products
        .filter((p) => config.selectedProductIds.includes(p.id))
        .map((p): SessionProduct => ({
          product_id: p.id,
          product_name: {
            en: p.name,
            ko: p.name,
          },
          sku: p.sku || '',
          unit_cost: p.unitCost || 0,
          available_at_start: p.quantity || 0,
          category: p.category,
          image_url: p.imageUrl,
        }));

      // 3. Create livestream session
      const sessionData: CreateSessionData = {
        seller_id: sellerId,
        room_name: roomName,
        title: config.title,
        description: `Resolution: ${config.resolution}`,
        products: selectedProducts,
        platforms: config.platforms,
        category: config.category,
        resolution: config.resolution,
        max_participants: 1000,
        enable_agent: false,
      };

      const session = await createSession(sessionData);

      // 4. Generate host token
      const tokenResponse = await createHostToken(roomName, sellerName, sellerId);

      return {
        room,
        session,
        token: tokenResponse.token,
        url: tokenResponse.url,
        roomName,
        destinationIds,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['livestream-sessions'] });
      toast.success('Simulcast room created!');

      // Navigate to live room with token, server URL, and destination IDs
      const params = new URLSearchParams({
        type: 'host',
        token: data.token,
        serverUrl: data.url,
      });
      if (data.destinationIds.length > 0) {
        params.set('destinationIds', data.destinationIds.join(','));
      }
      router.push(`/live/${data.roomName}?${params.toString()}`);
    },
    onError: (error) => {
      console.error('Failed to create simulcast:', error);
      toast.error('Failed to create simulcast. Please try again.');
    },
  });
}

/**
 * Save simulcast preset without starting (saves to MongoDB via API)
 */
export function useSavePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      config: SimulcastConfig;
      sellerId: string;
      products: SimulcastProduct[];
      cameras?: Camera[];
      branding?: BrandingSettings;
    }) => {
      const { config, sellerId, products, cameras, branding } = params;

      // Prepare preset data for API
      const presetData: CreatePresetData = {
        seller_id: sellerId,
        title: config.title,
        resolution: config.resolution,
        category: config.category,
        platforms: config.platforms.map((platformName) => ({
          name: platformName,
          connected: false,
          signal_strength: 0,
        })),
        products: products
          .filter((p) => config.selectedProductIds.includes(p.id))
          .map((p) => ({
            product_id: p.id,
            name: p.name,
            image_url: p.imageUrl,
            sku: p.sku,
            quantity: p.quantity,
            unit_cost: p.unitCost,
            category: p.category,
          })),
        invited_user_ids: config.invitedUserIds,
        cameras: cameras?.map((c) => ({
          camera_id: c.id,
          name: c.name,
          selected: c.selected,
          preview_url: c.previewUrl,
        })),
        branding: {
          landscape_logo_url: branding?.landscapeLogo,
          boxed_logo_url: branding?.boxedLogo,
        },
      };

      // Save preset to backend via API
      const preset = await createPreset(presetData);

      return preset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulcast', 'presets'] });
      toast.success('Preset saved!');
    },
    onError: (error) => {
      console.error('Failed to save preset:', error);
      toast.error('Failed to save preset. Please try again.');
    },
  });
}

/**
 * Start simulcast from a saved preset
 */
export function useStartFromPreset() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (params: {
      roomName: string;
      sellerId: string;
      sellerName: string;
    }) => {
      const { roomName, sellerId, sellerName } = params;

      // Generate host token for the preset room
      const tokenResponse = await createHostToken(roomName, sellerName, sellerId);

      return {
        token: tokenResponse.token,
        url: tokenResponse.url,
        roomName,
      };
    },
    onSuccess: (data) => {
      toast.success('Starting simulcast...');
      router.push(`/live/${data.roomName}?type=host&token=${data.token}`);
    },
    onError: (error) => {
      console.error('Failed to start from preset:', error);
      toast.error('Failed to start simulcast. Please try again.');
    },
  });
}

/**
 * Get saved presets from API
 */
export function useSavedPresets(sellerId?: string) {
  return useQuery({
    queryKey: ['simulcast', 'presets', sellerId],
    queryFn: async () => {
      const response = await getPresets({
        seller_id: sellerId,
        page: 1,
        page_size: 20,
      });
      return response.items;
    },
    enabled: !!sellerId,
    staleTime: 30000, // Cache for 30 seconds
  });
}

/**
 * Get a single preset by ID
 */
export function usePreset(presetId?: string) {
  return useQuery({
    queryKey: ['simulcast', 'preset', presetId],
    queryFn: async () => {
      if (!presetId) throw new Error('Preset ID is required');
      return await getPreset(presetId);
    },
    enabled: !!presetId,
    staleTime: 30000, // Cache for 30 seconds
  });
}

/**
 * Update an existing preset
 */
export function useUpdatePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      presetId,
      data,
    }: {
      presetId: string;
      data: UpdatePresetData;
    }) => {
      return await updatePresetApi(presetId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulcast', 'presets'] });
      toast.success('Preset updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update preset:', error);
      toast.error('Failed to update preset');
    },
  });
}

/**
 * Delete a preset
 */
export function useDeletePreset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (presetId: string) => {
      await deletePresetApi(presetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulcast', 'presets'] });
      toast.success('Preset deleted');
    },
    onError: (error) => {
      console.error('Failed to delete preset:', error);
      toast.error('Failed to delete preset');
    },
  });
}

/**
 * Seed dummy presets (development only)
 */
export function useSeedPresets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sellerId,
      count,
    }: {
      sellerId: string;
      count?: number;
    }) => {
      return await seedDummyPresets(sellerId, count || 5);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulcast', 'presets'] });
      toast.success('Dummy presets created!');
    },
    onError: (error) => {
      console.error('Failed to seed presets:', error);
      toast.error('Failed to create dummy presets');
    },
  });
}
