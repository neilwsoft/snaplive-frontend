'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { StreamingStatsAccordion } from '../widgets/StreamingStatsAccordion';
import { RealTimeMetrics } from '../widgets/RealTimeMetrics';
import { HourlyViewersChart } from '../widgets/HourlyViewersChart';
import { ChannelPerformance } from '../widgets/ChannelPerformance';
import { DestinationPanel } from '@/components/liveconnect/DestinationManager';
import type { SimulcastStats } from '@/lib/types/simulcast';

interface RealTimeStatsPanelProps {
  stats: SimulcastStats;
  className?: string;
}

/**
 * Right panel - Real-time stats with frosted glass effect
 */
export function RealTimeStatsPanel({
  stats,
  className,
}: RealTimeStatsPanelProps) {
  return (
    <div className="w-[300px] h-full backdrop-blur-sm bg-white/30 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-4 p-4">
          {/* Streaming Stats Accordion */}
          <StreamingStatsAccordion />

          {/* Real Time Metrics */}
          <RealTimeMetrics
            orders={stats.orders}
            revenue={stats.revenue}
            conversion={stats.conversion}
          />

          {/* Hourly Viewers Chart */}
          <HourlyViewersChart
            data={stats.hourlyViewers}
            currentViewers={stats.viewerCount}
          />

          {/* Channel Performance */}
          <ChannelPerformance channels={stats.channelPerformance} />

          {/* Streaming Destinations */}
          <div className="border-t border-slate-200/50 pt-4">
            <DestinationPanel />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
