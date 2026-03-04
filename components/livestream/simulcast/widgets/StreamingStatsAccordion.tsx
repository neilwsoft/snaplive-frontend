'use client';

import { useState } from 'react';
import { Wifi, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StreamingStatsAccordionProps {
  bitrate?: number;
  fps?: number;
  latency?: number;
  droppedFrames?: number;
  dark?: boolean;
  className?: string;
}

/**
 * Collapsible streaming stats accordion
 */
export function StreamingStatsAccordion({
  bitrate = 4500,
  fps = 30,
  latency = 120,
  droppedFrames = 0,
  dark = false,
  className,
}: StreamingStatsAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn(
      'rounded-[7px] overflow-hidden',
      dark ? 'border border-white/20' : 'border border-slate-400',
      className,
    )}>
      {/* Accordion header */}
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full p-4 flex items-center justify-between',
          dark ? 'hover:bg-white/10' : 'hover:bg-slate-50',
        )}
      >
        <div className="flex items-center gap-2">
          <Wifi className={cn('w-5 h-5', dark ? 'text-white' : 'text-zinc-800')} />
          <span className={cn('text-sm font-semibold', dark ? 'text-white' : 'text-zinc-800')}>Streaming Stats</span>
        </div>
        {isExpanded ? (
          <ChevronUp className={cn('w-5 h-5', dark ? 'text-white/70' : 'text-zinc-800')} />
        ) : (
          <ChevronDown className={cn('w-5 h-5', dark ? 'text-white/70' : 'text-zinc-800')} />
        )}
      </Button>

      {/* Expanded content */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isExpanded ? 'max-h-48' : 'max-h-0'
        )}
      >
        <div className={cn(
          'p-4 pt-0 flex flex-col gap-2 border-t',
          dark ? 'border-white/10' : 'border-slate-200',
        )}>
          <div className="flex items-center justify-between">
            <span className={cn('text-xs', dark ? 'text-white/60' : 'text-zinc-600')}>Bitrate</span>
            <span className={cn('text-xs font-medium', dark ? 'text-white' : 'text-zinc-800')}>{bitrate} kbps</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={cn('text-xs', dark ? 'text-white/60' : 'text-zinc-600')}>Frame Rate</span>
            <span className={cn('text-xs font-medium', dark ? 'text-white' : 'text-zinc-800')}>{fps} fps</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={cn('text-xs', dark ? 'text-white/60' : 'text-zinc-600')}>Latency</span>
            <span className={cn('text-xs font-medium', dark ? 'text-white' : 'text-zinc-800')}>{latency} ms</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={cn('text-xs', dark ? 'text-white/60' : 'text-zinc-600')}>Dropped Frames</span>
            <span className={cn(
              'text-xs font-medium',
              droppedFrames > 0 ? 'text-red-400' : (dark ? 'text-white' : 'text-zinc-800'),
            )}>
              {droppedFrames}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
