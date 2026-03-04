/**
 * Livestream API Client
 * API functions for livestream session management
 */

import type { LiveStatsResponse } from '@/lib/types/simulcast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get real-time stats for an active livestream session
 */
export async function getLiveStats(sessionId: string): Promise<LiveStatsResponse> {
  const response = await fetch(`${API_BASE}/api/v1/livestream-sessions/${sessionId}/live-stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch live stats: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a livestream session by room name
 */
export async function getSessionByRoomName(roomName: string) {
  const response = await fetch(`${API_BASE}/api/v1/livestream-sessions/room/${roomName}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch session: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update session statistics
 */
export async function updateSessionStats(
  sessionId: string,
  stats: {
    peak_viewers?: number;
    total_viewers?: number;
    products_sold?: number;
    revenue?: number;
    message_count?: number;
    reaction_count?: number;
  }
) {
  const response = await fetch(`${API_BASE}/api/v1/livestream-sessions/${sessionId}/stats`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stats),
  });

  if (!response.ok) {
    throw new Error(`Failed to update stats: ${response.statusText}`);
  }

  return response.json();
}
