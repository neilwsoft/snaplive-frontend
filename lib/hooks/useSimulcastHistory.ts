/**
 * Simulcast History Hook
 *
 * Custom hook for fetching and managing simulcast history data.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getSessions,
  seedDummySessions,
  type LivestreamSession,
} from '@/lib/api/livestream-sessions';
import { SimulcastHistoryItem } from '@/components/simulcast-history/SimulcastHistoryCard';

// Placeholder image path
const PLACEHOLDER_THUMBNAIL = '/images/placeholder-thumbnail.svg';

export interface SimulcastHistoryFilters {
  sellerId: string;
  searchQuery?: string;
  dateFilter?: 'all' | 'today' | 'week' | 'month';
  category?: string;
  page?: number;
  pageSize?: number;
}

// Valid categories for history items
const VALID_CATEGORIES = [
  'Fashion',
  'Beauty',
  'Food',
  'Lifestyle',
  'Tech',
  'Shopping',
  'Music',
] as const;

// Default platforms for simulcast (can be customized per session later)
type PlatformType = "douyin" | "xiaohongshu" | "taobao live" | "snaplive";
const DEFAULT_PLATFORMS: PlatformType[] = ['douyin', 'xiaohongshu', 'taobao live', 'snaplive'];

/**
 * Format number with k suffix for thousands
 */
function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

/**
 * Format duration in seconds to HH:MM:SS
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Determine category from session data
 */
function determineCategory(session: LivestreamSession): string {
  // First check if category is explicitly set in products
  if (session.products && session.products.length > 0) {
    const productCategory = session.products[0].category;
    if (productCategory && VALID_CATEGORIES.includes(productCategory as typeof VALID_CATEGORIES[number])) {
      return productCategory;
    }
  }

  // Fall back to parsing from description or title
  const searchText = `${session.title || ''} ${session.description || ''}`.toLowerCase();

  if (searchText.includes('fashion') || searchText.includes('apparel') || searchText.includes('clothing')) {
    return 'Fashion';
  }
  if (searchText.includes('beauty') || searchText.includes('cosmetic') || searchText.includes('skincare')) {
    return 'Beauty';
  }
  if (searchText.includes('food') || searchText.includes('beverage') || searchText.includes('snack')) {
    return 'Food';
  }
  if (searchText.includes('lifestyle') || searchText.includes('home') || searchText.includes('decor')) {
    return 'Lifestyle';
  }
  if (searchText.includes('tech') || searchText.includes('electronic') || searchText.includes('gadget')) {
    return 'Tech';
  }
  if (searchText.includes('shopping') || searchText.includes('deal') || searchText.includes('sale')) {
    return 'Shopping';
  }
  if (searchText.includes('music') || searchText.includes('concert') || searchText.includes('performance')) {
    return 'Music';
  }

  // Random assignment for demo purposes
  return VALID_CATEGORIES[Math.floor(Math.random() * VALID_CATEGORIES.length)];
}

/**
 * Transform LivestreamSession to SimulcastHistoryItem
 */
function transformToHistoryItem(session: LivestreamSession): SimulcastHistoryItem {
  const startDate = session.started_at
    ? new Date(session.started_at)
    : new Date(session.created_at);

  // Format date in Chinese format (YYYY年MM月DD日)
  const year = startDate.getFullYear();
  const month = String(startDate.getMonth() + 1).padStart(2, '0');
  const day = String(startDate.getDate()).padStart(2, '0');
  const dateStr = `${year}年${month}月${day}日`;

  // Format time
  const hours = String(startDate.getHours()).padStart(2, '0');
  const minutes = String(startDate.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  // Determine quality: prefer stored resolution, fall back to parsing description
  let quality: 'HD' | '4K' | '1080p' | '720p' = 'HD';
  if (session.resolution) {
    const res = session.resolution.toLowerCase();
    if (res.includes('4k')) quality = '4K';
    else if (res.includes('1080')) quality = '1080p';
    else if (res.includes('720')) quality = '720p';
    else quality = 'HD';
  } else if (session.description?.includes('4K')) {
    quality = '4K';
  } else if (session.description?.includes('1080p')) {
    quality = '1080p';
  } else if (session.description?.includes('720p')) {
    quality = '720p';
  }

  // Determine category: prefer stored category, fall back to guessing
  const primaryCategory = session.category || determineCategory(session);
  const categories = [primaryCategory];

  // Add secondary category based on keywords
  const searchText = `${session.title || ''} ${session.description || ''}`.toLowerCase();
  if (primaryCategory !== 'Lifestyle' && (searchText.includes('lifestyle') || searchText.includes('home'))) {
    categories.push('Lifestyle');
  } else if (primaryCategory !== 'Tech' && searchText.includes('tech')) {
    categories.push('Tech');
  }

  // Determine platforms: prefer stored platforms, fall back to defaults
  const platforms: PlatformType[] =
    session.platforms && session.platforms.length > 0
      ? session.platforms.map((p) => p.toLowerCase() as PlatformType)
      : DEFAULT_PLATFORMS;

  return {
    id: session._id,
    title: session.title || 'Untitled Session',
    date: dateStr,
    time: timeStr,
    duration: formatDuration(session.duration_seconds),
    quality,
    views: formatNumber(session.stats.total_viewers),
    likes: formatNumber(session.stats.reaction_count),
    comments: formatNumber(session.stats.message_count),
    thumbnailUrl: session.thumbnail_url || PLACEHOLDER_THUMBNAIL,
    categories,
    platforms,
  };
}

/**
 * Calculate category counts from items
 */
function calculateCategoryCounts(items: SimulcastHistoryItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const category of VALID_CATEGORIES) {
    counts[category] = 0;
  }
  for (const item of items) {
    // Count primary category only (first in array)
    const primaryCategory = item.categories[0];
    if (primaryCategory && counts[primaryCategory] !== undefined) {
      counts[primaryCategory]++;
    }
  }
  return counts;
}

/**
 * Filter history items based on date filter
 */
function filterByDate(
  items: SimulcastHistoryItem[],
  dateFilter: 'all' | 'today' | 'week' | 'month'
): SimulcastHistoryItem[] {
  if (dateFilter === 'all') {
    return items;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return items.filter((item) => {
    // Parse date from format "YYYY年MM月DD日"
    const match = item.date.match(/(\d{4})年(\d{2})月(\d{2})日/);
    if (!match) return true;

    const itemDate = new Date(
      parseInt(match[1]),
      parseInt(match[2]) - 1,
      parseInt(match[3])
    );

    switch (dateFilter) {
      case 'today':
        return itemDate.getTime() === today.getTime();
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate >= weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return itemDate >= monthAgo;
      }
      default:
        return true;
    }
  });
}

/**
 * Hook for fetching simulcast history
 */
export function useSimulcastHistory(filters: SimulcastHistoryFilters) {
  return useQuery({
    queryKey: ['simulcast', 'history', filters.sellerId, filters.page, filters.pageSize, filters.category],
    queryFn: async () => {
      const response = await getSessions({
        seller_id: filters.sellerId,
        status: 'ended',
        page: filters.page || 1,
        page_size: filters.pageSize || 50,
      });

      // Transform to history items
      let items = response.items.map(transformToHistoryItem);

      // Calculate category counts before filtering
      const categoryCounts = calculateCategoryCounts(items);

      // Client-side search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        items = items.filter((item) =>
          item.title.toLowerCase().includes(query)
        );
      }

      // Client-side date filter
      if (filters.dateFilter && filters.dateFilter !== 'all') {
        items = filterByDate(items, filters.dateFilter);
      }

      // Client-side category filter
      if (filters.category && filters.category !== 'All') {
        items = items.filter((item) => item.categories.includes(filters.category!));
      }

      return {
        items,
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: response.total_pages,
        categoryCounts,
      };
    },
    enabled: !!filters.sellerId,
    staleTime: 30000, // Cache for 30 seconds
  });
}

/**
 * Hook for seeding dummy history data (development only)
 */
export function useSeedHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sellerId,
      count,
    }: {
      sellerId: string;
      count?: number;
    }) => {
      return await seedDummySessions(sellerId, count || 10);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulcast', 'history'] });
      toast.success('Dummy history data created!');
    },
    onError: (error) => {
      console.error('Failed to seed history:', error);
      toast.error('Failed to create dummy data');
    },
  });
}
