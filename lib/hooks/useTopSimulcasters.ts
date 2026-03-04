/**
 * Top Simulcasters Hook
 *
 * Custom hook for fetching top simulcasters leaderboard data.
 */

import { useQuery } from '@tanstack/react-query';
import { getTopSimulcasters, type TimePeriod } from '@/lib/api/simulcasters';

/**
 * Hook to fetch top simulcasters with optional filters
 *
 * @param timePeriod - Time period filter: 'all_time', 'month', or 'week'
 * @param category - Category filter
 * @param marketplace - Marketplace/platform filter
 * @param page - Page number (default: 1)
 * @param pageSize - Items per page (default: 10)
 */
export function useTopSimulcasters(
  timePeriod: TimePeriod = 'all_time',
  category?: string,
  marketplace?: string,
  page: number = 1,
  pageSize: number = 10
) {
  return useQuery({
    queryKey: ['top-simulcasters', timePeriod, category, marketplace, page, pageSize],
    queryFn: async () => {
      return await getTopSimulcasters({
        time_period: timePeriod,
        category,
        marketplace,
        page,
        page_size: pageSize,
      });
    },
    staleTime: 60000, // 1 minute - leaderboard doesn't change that frequently
    refetchOnWindowFocus: false,
  });
}
