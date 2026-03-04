/**
 * usePublicSessions Hook
 *
 * TanStack Query hook for fetching public livestream sessions.
 */

import { useQuery } from '@tanstack/react-query';
import {
  getPublicSessions,
  type PublicSession,
  type PublicSessionsParams,
} from '@/lib/api/public-sessions';

// Transformed session for UI
export interface ExploreSimulcast {
  id: string;
  roomName: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  status: 'live' | 'ended' | 'pending' | 'cancelled';
  category?: string;
  platforms: string[];
  date: string;
  time: string;
  duration: string;
  quality: string;
  views: string;
  likes: string;
  comments: string;
  sellerId: string;
}

// Format number with k/M suffix
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// Format date to Japanese format
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\//g, '年').replace(/年$/, '日').replace(/年(\d{2})日/, '年$1月').replace(/月$/, '日');
}

// Format time
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Format duration
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

// Determine quality from description or default
function getQuality(description?: string): string {
  if (!description) return 'HD';
  if (description.includes('4K') || description.includes('2160')) return '4K';
  if (description.includes('1080')) return 'FHD';
  return 'HD';
}

// Extract category from products
function getCategory(session: PublicSession): string | undefined {
  if (session.products.length > 0 && session.products[0].category) {
    return session.products[0].category;
  }
  return undefined;
}

// Extract platforms from description (simplified)
function getPlatforms(description?: string): string[] {
  const platforms: string[] = [];
  const desc = description?.toLowerCase() || '';

  if (desc.includes('douyin')) platforms.push('douyin');
  if (desc.includes('xiaohongshu') || desc.includes('red')) platforms.push('xiaohongshu');
  if (desc.includes('taobao')) platforms.push('taobao');

  // Always include snaplive as it's our platform
  platforms.push('snaplive');

  return platforms;
}

// Transform API response to UI format
function transformSession(session: PublicSession): ExploreSimulcast {
  const startDate = session.started_at || session.created_at;

  return {
    id: session._id,
    roomName: session.room_name,
    title: session.title || 'Untitled Simulcast',
    description: session.description,
    thumbnailUrl: session.thumbnail_url,
    status: session.status,
    category: getCategory(session),
    platforms: getPlatforms(session.description),
    date: formatDate(startDate),
    time: formatTime(startDate),
    duration: formatDuration(session.duration_seconds),
    quality: getQuality(session.description),
    views: formatNumber(session.stats.total_viewers),
    likes: formatNumber(session.stats.reaction_count),
    comments: formatNumber(session.stats.message_count),
    sellerId: session.seller_id,
  };
}

export function usePublicSessions(params: PublicSessionsParams = {}) {
  return useQuery({
    queryKey: ['public-sessions', params],
    queryFn: async () => {
      const response = await getPublicSessions(params);
      return {
        ...response,
        items: response.items.map(transformSession),
      };
    },
    staleTime: 10000, // 10 seconds
    refetchInterval: params.status === 'live' ? 30000 : false, // Refetch every 30s for live
  });
}

// Hook to get category counts
export function useCategoryCounts() {
  return useQuery({
    queryKey: ['public-sessions-counts'],
    queryFn: async () => {
      // Fetch all categories
      const [all, fashion, beauty, food, lifestyle, tech, shopping, music] = await Promise.all([
        getPublicSessions({ page_size: 1 }),
        getPublicSessions({ category: 'fashion', page_size: 1 }),
        getPublicSessions({ category: 'beauty', page_size: 1 }),
        getPublicSessions({ category: 'food', page_size: 1 }),
        getPublicSessions({ category: 'lifestyle', page_size: 1 }),
        getPublicSessions({ category: 'tech', page_size: 1 }),
        getPublicSessions({ category: 'shopping', page_size: 1 }),
        getPublicSessions({ category: 'music', page_size: 1 }),
      ]);

      return {
        all: all.total,
        fashion: fashion.total,
        beauty: beauty.total,
        food: food.total,
        lifestyle: lifestyle.total,
        tech: tech.total,
        shopping: shopping.total,
        music: music.total,
      };
    },
    staleTime: 60000, // 1 minute
  });
}
