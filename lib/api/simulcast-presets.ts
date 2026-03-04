/**
 * Simulcast Presets API Client
 *
 * API functions for simulcast preset management operations.
 */

import { api } from '../api';

// Types

export interface PlatformConfig {
  name: string;
  connected: boolean;
  signal_strength: number;
}

export interface PresetProduct {
  product_id: string;
  name: string;
  image_url?: string;
  sku?: string;
  quantity?: number;
  unit_cost?: number;
  category?: string;
}

export interface CameraConfig {
  camera_id: string;
  name: string;
  selected: boolean;
  preview_url?: string;
}

export interface BrandingConfig {
  landscape_logo_url?: string;
  boxed_logo_url?: string;
}

export interface SimulcastPreset {
  _id: string;
  seller_id: string;
  title: string;
  description?: string;
  resolution: string;
  category?: string;
  platforms: PlatformConfig[];
  products: PresetProduct[];
  product_count: number;
  invited_user_ids: string[];
  cameras: CameraConfig[];
  branding: BrandingConfig;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
  use_count: number;
}

export interface SimulcastPresetListResponse {
  items: SimulcastPreset[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CreatePresetData {
  seller_id: string;
  title: string;
  description?: string;
  resolution?: string;
  category?: string;
  platforms?: PlatformConfig[];
  products?: PresetProduct[];
  invited_user_ids?: string[];
  cameras?: CameraConfig[];
  branding?: BrandingConfig;
}

export interface UpdatePresetData {
  title?: string;
  description?: string;
  resolution?: string;
  category?: string;
  platforms?: PlatformConfig[];
  products?: PresetProduct[];
  invited_user_ids?: string[];
  cameras?: CameraConfig[];
  branding?: BrandingConfig;
}

// API Functions

export const createPreset = async (
  data: CreatePresetData
): Promise<SimulcastPreset> => {
  const response = await api.post('/simulcast-presets', data);
  return response.data;
};

export const getPresets = async (params?: {
  seller_id?: string;
  page?: number;
  page_size?: number;
}): Promise<SimulcastPresetListResponse> => {
  const response = await api.get('/simulcast-presets', { params });
  return response.data;
};

export const getPreset = async (presetId: string): Promise<SimulcastPreset> => {
  const response = await api.get(`/simulcast-presets/${presetId}`);
  return response.data;
};

export const updatePreset = async (
  presetId: string,
  data: UpdatePresetData
): Promise<SimulcastPreset> => {
  const response = await api.patch(`/simulcast-presets/${presetId}`, data);
  return response.data;
};

export const deletePreset = async (presetId: string): Promise<void> => {
  await api.delete(`/simulcast-presets/${presetId}`);
};

export const markPresetUsed = async (
  presetId: string
): Promise<SimulcastPreset> => {
  const response = await api.post(`/simulcast-presets/${presetId}/use`);
  return response.data;
};

// Seeding (Development only)

export const seedDummyPresets = async (
  sellerId: string,
  count: number = 5
): Promise<SimulcastPreset[]> => {
  const response = await api.post('/simulcast-presets/seed', null, {
    params: { seller_id: sellerId, count },
  });
  return response.data;
};
