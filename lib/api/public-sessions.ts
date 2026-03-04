/**
 * Public Sessions API Client
 *
 * API functions for fetching public livestream sessions (no auth required).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PublicSessionProduct {
  product_id: string;
  product_name: {
    en: string;
    ko: string;
  };
  sku: string;
  unit_cost: number;
  available_at_start: number;
  category?: string;
  image_url?: string;
}

export interface PublicSessionStats {
  peak_viewers: number;
  total_viewers: number;
  products_sold: number;
  revenue: number;
  message_count: number;
  reaction_count: number;
  average_watch_time_seconds: number;
}

export interface PublicSession {
  _id: string;
  seller_id: string;
  room_name: string;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  status: 'pending' | 'live' | 'ended' | 'cancelled';
  products: PublicSessionProduct[];
  product_count: number;
  max_participants: number;
  created_at: string;
  updated_at: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds: number;
  stats: PublicSessionStats;
}

export interface PublicSessionsResponse {
  items: PublicSession[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PublicSessionsParams {
  category?: string;
  platform?: string;
  status?: 'live' | 'ended';
  page?: number;
  page_size?: number;
}

/**
 * Fetch public livestream sessions (no auth required)
 */
export async function getPublicSessions(
  params: PublicSessionsParams = {}
): Promise<PublicSessionsResponse> {
  const searchParams = new URLSearchParams();

  if (params.category && params.category !== 'all') {
    searchParams.set('category', params.category);
  }
  if (params.platform) {
    searchParams.set('platform', params.platform);
  }
  if (params.status) {
    searchParams.set('status', params.status);
  }
  if (params.page) {
    searchParams.set('page', params.page.toString());
  }
  if (params.page_size) {
    searchParams.set('page_size', params.page_size.toString());
  }

  const url = `${API_BASE}/api/v1/livestream-sessions/public?${searchParams.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch public sessions: ${response.statusText}`);
  }

  return response.json();
}
