/**
 * Gifts API Client
 *
 * API functions for virtual gift management operations.
 */

import { api } from '../api';

// Enums

export type MarketplaceSource = 'douyin' | 'taobao' | 'xiaohongshu' | 'snaplive';
export type TierLevel = 'small' | 'medium' | 'large' | 'premium';

// Interfaces

export interface GiftItem {
  _id: string;
  raw_gift_name: string;
  image_url?: string;
  quantity: number;
  marketplace_source: MarketplaceSource;
  live_simulcast_id: string;
  viewer_username: string;
  viewer_avatar_url?: string;
  gifting_timestamp: string;
  virtual_currency_value: number;
  currency_label?: string;
  tier_level: TierLevel;
  seller_id?: string;
  created_at: string;
  updated_at: string;
}

export interface GiftListResponse {
  items: GiftItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface GiftStats {
  total_gifts: number;
  total_quantity: number;
  total_value: number;
}

// API Functions

export const getGifts = async (params?: {
  marketplace_source?: string;
  tier_level?: string;
  live_simulcast_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<GiftListResponse> => {
  const response = await api.get('/gifts/', { params });
  return response.data;
};

export const getGift = async (giftId: string): Promise<GiftItem> => {
  const response = await api.get(`/gifts/${giftId}`);
  return response.data;
};

export const createGift = async (data: {
  raw_gift_name: string;
  image_url?: string;
  quantity?: number;
  marketplace_source: string;
  live_simulcast_id: string;
  viewer_username: string;
  viewer_avatar_url?: string;
  gifting_timestamp?: string;
  virtual_currency_value?: number;
  currency_label?: string;
  tier_level?: string;
  seller_id?: string;
}): Promise<GiftItem> => {
  const response = await api.post('/gifts/', data);
  return response.data;
};

export const updateGift = async (
  giftId: string,
  data: {
    raw_gift_name?: string;
    image_url?: string;
    quantity?: number;
    marketplace_source?: string;
    live_simulcast_id?: string;
    viewer_username?: string;
    viewer_avatar_url?: string;
    gifting_timestamp?: string;
    virtual_currency_value?: number;
    currency_label?: string;
    tier_level?: string;
    seller_id?: string;
  }
): Promise<GiftItem> => {
  const response = await api.patch(`/gifts/${giftId}`, data);
  return response.data;
};

export const deleteGift = async (giftId: string): Promise<void> => {
  await api.delete(`/gifts/${giftId}`);
};

export const getGiftStats = async (): Promise<GiftStats> => {
  const response = await api.get('/gifts/stats');
  return response.data;
};

export const seedGifts = async (count?: number): Promise<{ message: string; count: number }> => {
  const response = await api.post('/gifts/seed', null, {
    params: count ? { count } : undefined,
  });
  return response.data;
};

// Helper functions

const marketplaceLabels: Record<MarketplaceSource, { en: string; zh: string }> = {
  douyin: { en: 'Douyin', zh: '抖音' },
  taobao: { en: 'Taobao Live', zh: '淘宝直播' },
  xiaohongshu: { en: 'Xiaohongshu', zh: '小红书' },
  snaplive: { en: 'SnapLive 2.0', zh: '速播 2.0' },
};

export function getMarketplaceLabel(source: MarketplaceSource, locale: string = 'en'): string {
  const labels = marketplaceLabels[source];
  if (!labels) return source;
  if (locale === 'zh') return `${labels.en} (${labels.zh})`;
  return `${labels.en} (${labels.zh})`;
}

const tierLevelLabels: Record<TierLevel, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  premium: 'Premium',
};

export function getTierLevelLabel(tier: TierLevel): string {
  return tierLevelLabels[tier] || tier;
}

const marketplaceColors: Record<MarketplaceSource, string> = {
  douyin: 'bg-gray-800 text-white',
  taobao: 'bg-orange-500 text-white',
  xiaohongshu: 'bg-red-500 text-white',
  snaplive: 'bg-yellow-500 text-black',
};

export function getMarketplaceColor(source: MarketplaceSource): string {
  return marketplaceColors[source] || 'bg-gray-500 text-white';
}
