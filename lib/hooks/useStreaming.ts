/**
 * Streaming React Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { getStreamingReports, type StreamingReportsResponse } from '@/lib/api/streaming';

/**
 * Fetch streaming reports
 */
export function useStreamingReports() {
    return useQuery({
        queryKey: ['streaming', 'reports'],
        queryFn: getStreamingReports,
        staleTime: 60000, // Cache for 1 minute
    });
}
