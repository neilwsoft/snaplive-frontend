/**
 * Livestream Session API Client
 *
 * API functions for livestream session management operations.
 */

import { api } from '../api';

// Types

export type SessionStatus = 'pending' | 'live' | 'ended' | 'cancelled';

export interface SessionProduct {
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

export interface SessionStats {
  peak_viewers: number;
  total_viewers: number;
  products_sold: number;
  revenue: number;
  message_count: number;
  reaction_count: number;
  average_watch_time_seconds: number;
}

export interface LivestreamSession {
  _id: string;
  seller_id: string;
  room_name: string;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  status: SessionStatus;
  products: SessionProduct[];
  product_count: number;
  platforms: string[];
  category?: string;
  resolution?: string;
  max_participants: number;
  enable_agent: boolean;
  created_at: string;
  updated_at: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds: number;
  stats: SessionStats;
}

export interface LivestreamSessionListResponse {
  items: LivestreamSession[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CreateSessionData {
  seller_id: string;
  room_name: string;
  title?: string;
  description?: string;
  products: SessionProduct[];
  platforms?: string[];
  category?: string;
  resolution?: string;
  max_participants?: number;
  enable_agent?: boolean;
}

export interface UpdateSessionData {
  title?: string;
  description?: string;
  status?: SessionStatus;
  max_participants?: number;
  enable_agent?: boolean;
  stats?: Partial<SessionStats>;
}

export interface SellerStats {
  total_sessions: number;
  total_revenue: number;
  total_products_sold: number;
  total_viewers: number;
  avg_peak_viewers: number;
}

// API Functions

export const createSession = async (data: CreateSessionData): Promise<LivestreamSession> => {
  const response = await api.post('/livestream-sessions', data);
  return response.data;
};

export const getSessions = async (params?: {
  seller_id?: string;
  status?: SessionStatus;
  page?: number;
  page_size?: number;
}): Promise<LivestreamSessionListResponse> => {
  const response = await api.get('/livestream-sessions', { params });
  return response.data;
};

export const getSession = async (sessionId: string): Promise<LivestreamSession> => {
  const response = await api.get(`/livestream-sessions/${sessionId}`);
  return response.data;
};

export const getSessionByRoomName = async (roomName: string): Promise<LivestreamSession> => {
  const response = await api.get(`/livestream-sessions/room/${roomName}`);
  return response.data;
};

export const updateSession = async (
  sessionId: string,
  data: UpdateSessionData
): Promise<LivestreamSession> => {
  const response = await api.patch(`/livestream-sessions/${sessionId}`, data);
  return response.data;
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  await api.delete(`/livestream-sessions/${sessionId}`);
};

// Status Transitions

export const startSession = async (sessionId: string): Promise<LivestreamSession> => {
  const response = await api.post(`/livestream-sessions/${sessionId}/start`);
  return response.data;
};

export const endSession = async (
  sessionId: string,
  stats?: Partial<SessionStats>
): Promise<LivestreamSession> => {
  const response = await api.post(`/livestream-sessions/${sessionId}/end`, {
    stats,
  });
  return response.data;
};

export const cancelSession = async (sessionId: string): Promise<LivestreamSession> => {
  const response = await api.post(`/livestream-sessions/${sessionId}/cancel`);
  return response.data;
};

// Statistics

export const updateSessionStats = async (
  sessionId: string,
  stats: Partial<SessionStats>
): Promise<LivestreamSession> => {
  const response = await api.patch(`/livestream-sessions/${sessionId}/stats`, stats);
  return response.data;
};

export const getSellerStats = async (sellerId: string): Promise<SellerStats> => {
  const response = await api.get(`/livestream-sessions/seller/${sellerId}/stats`);
  return response.data;
};

// Seeding (Development only)

export const seedDummySessions = async (
  sellerId: string,
  count: number = 10
): Promise<LivestreamSession[]> => {
  const response = await api.post('/livestream-sessions/seed', null, {
    params: { seller_id: sellerId, count },
  });
  return response.data;
};
