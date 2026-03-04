/**
 * Simulcasters API Client
 *
 * API functions for top simulcasters/leaderboard operations.
 */

import { api } from '../api';

// Types

export interface TopSimulcaster {
  seller_id: string;
  rank: number;
  name: string;
  avatar_url?: string;
  verified: boolean;
  platforms: string[];
  total_views: number;
  total_likes: number;
  total_comments: number;
  categories: string[];
  session_count: number;
}

export interface TopSimulcastersListResponse {
  items: TopSimulcaster[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export type TimePeriod = 'all_time' | 'month' | 'week';

// API Functions

export const getTopSimulcasters = async (params?: {
  time_period?: TimePeriod;
  category?: string;
  marketplace?: string;
  page?: number;
  page_size?: number;
}): Promise<TopSimulcastersListResponse> => {
  const response = await api.get('/simulcasters/top', { params });
  return response.data;
};
