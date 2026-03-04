/**
 * Browse Sessions Hook
 *
 * Custom hook for browsing live simulcast sessions.
 * Fetches livestream sessions from the backend and transforms them
 * to the frontend Simulcast format.
 */

import { useQuery } from '@tanstack/react-query';
import { getSessions, type LivestreamSession, type SessionStatus } from '@/lib/api/livestream-sessions';
import type { Simulcast } from '@/components/browse-simulcasts/SimulcastCard';

// Helper function to format numbers with k/M suffix
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// Helper function to format date to Chinese format
function formatDateChinese(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
}

// Helper function to format time to HH:MM
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Helper function to calculate duration
function calculateDuration(startedAt?: string, endedAt?: string, durationSeconds?: number): string {
  if (durationSeconds && durationSeconds > 0) {
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = durationSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  if (startedAt && endedAt) {
    const start = new Date(startedAt).getTime();
    const end = new Date(endedAt).getTime();
    const diffSeconds = Math.floor((end - start) / 1000);
    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // For live sessions without end time
  if (startedAt) {
    const start = new Date(startedAt).getTime();
    const now = Date.now();
    const diffSeconds = Math.floor((now - start) / 1000);
    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return '00:00:00';
}

// Transform backend LivestreamSession to frontend Simulcast format
function transformToSimulcast(session: LivestreamSession): Simulcast {
  const dateSource = session.started_at || session.created_at;

  return {
    id: session.room_name, // Use room_name for navigation
    title: session.title || 'Untitled Simulcast',
    date: formatDateChinese(dateSource),
    time: formatTime(dateSource),
    duration: calculateDuration(session.started_at, session.ended_at, session.duration_seconds),
    quality: '4K', // Default quality, can be enhanced later
    views: formatNumber(session.stats.total_viewers),
    likes: formatNumber(Math.floor(session.stats.total_viewers * 0.8)), // Estimate: 80% of viewers
    comments: formatNumber(session.stats.message_count),
    thumbnailUrl: session.thumbnail_url || 'https://images.unsplash.com/photo-1556911261-6bd341186b2f?w=400&h=300&fit=crop',
    isLive: session.status === 'live',
    category: session.products[0]?.category || 'General',
  };
}

/**
 * Hook to browse simulcast sessions
 * @param status - Filter by session status (optional)
 * @param sellerId - Filter by seller ID (optional)
 */
export function useBrowseSessions(status?: SessionStatus, sellerId?: string) {
  return useQuery({
    queryKey: ['browse-sessions', status, sellerId],
    queryFn: async () => {
      const response = await getSessions({
        status,
        seller_id: sellerId,
        page: 1,
        page_size: 50, // Get more sessions for browsing
      });

      return response.items.map(transformToSimulcast);
    },
    staleTime: 10000, // Cache for 10 seconds (fresh data for live content)
    refetchInterval: status === 'live' ? 30000 : false, // Auto-refresh every 30s for live sessions
  });
}
