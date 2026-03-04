'use client';

import { Eye, MonitorPlay } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChannelStats } from '@/lib/types/simulcast';

interface ChannelPerformanceProps {
  channels: ChannelStats[];
  dark?: boolean;
  className?: string;
}

/**
 * Channel performance widget showing viewer counts per platform
 */
export function ChannelPerformance({
  channels,
  dark = false,
  className,
}: ChannelPerformanceProps) {
  // Default channels for demo
  const displayChannels = channels.length > 0 ? channels : [
    { platform: 'douyin' as const, platformName: 'Douyin', viewers: 500 },
    { platform: 'xiaohongshu' as const, platformName: 'Xiaohongshu', viewers: 400 },
    { platform: 'taobao' as const, platformName: 'Taobao', viewers: 300 },
  ];

  const textPrimary = dark ? 'text-white' : 'text-zinc-800';
  const textSecondary = dark ? 'text-white/70' : 'text-zinc-800';

  return (
    <div className={cn(
      'rounded-[7px] p-4 flex flex-col gap-4',
      dark ? 'border border-white/20' : 'border border-slate-400',
      className,
    )}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <MonitorPlay className={cn('w-5 h-5', textPrimary)} />
        <h3 className={cn('text-sm font-semibold', textPrimary)}>Channel Performance</h3>
      </div>

      {/* Channel list */}
      <div className="flex flex-col gap-2">
        {displayChannels.map((channel) => (
          <div
            key={channel.platform}
            className="flex items-center justify-between"
          >
            <span className={cn('text-xs font-medium', textSecondary)}>
              {channel.platformName}
            </span>
            <div className="flex items-center gap-1">
              <span className={cn('text-xs font-medium', textPrimary)}>
                {channel.viewers}
              </span>
              <Eye className={cn('w-3 h-3', textSecondary)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
