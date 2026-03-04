'use client';

import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealTimeMetricsProps {
  orders: number;
  revenue: number;
  conversion: number;
  currency?: string;
  dark?: boolean;
  className?: string;
}

/**
 * Real-time metrics widget showing orders, revenue, and conversion
 */
export function RealTimeMetrics({
  orders,
  revenue,
  conversion,
  currency = 'CN¥',
  dark = false,
  className,
}: RealTimeMetricsProps) {
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
        <BarChart3 className={cn('w-5 h-5', textPrimary)} />
        <h3 className={cn('text-sm font-semibold', textPrimary)}>Real Time Stats</h3>
      </div>

      {/* Metrics */}
      <div className="flex flex-col gap-2">
        {/* Orders */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className={cn('text-xs', textSecondary)}>Orders</span>
          </div>
          <span className={cn('text-xs font-medium', textPrimary)}>{orders}</span>
        </div>

        {/* Revenue */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className={cn('text-xs', textSecondary)}>Revenue</span>
          </div>
          <div className={cn('flex items-center gap-1 text-xs', textPrimary)}>
            <span>{currency}</span>
            <span className="font-medium">
              {revenue.toLocaleString('zh-CN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Conversion */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className={cn('text-xs', textSecondary)}>Conversion</span>
          </div>
          <span className={cn('text-xs font-medium', textPrimary)}>{conversion.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
