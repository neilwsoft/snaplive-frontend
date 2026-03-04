'use client';

import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HourlyViewerData } from '@/lib/types/simulcast';

interface HourlyViewersChartProps {
  data: HourlyViewerData[];
  currentViewers?: number;
  dark?: boolean;
  className?: string;
}

/**
 * Simple SVG line chart showing hourly viewer counts
 */
export function HourlyViewersChart({
  data,
  currentViewers = 0,
  dark = false,
  className,
}: HourlyViewersChartProps) {
  const { pathD, yLabels } = useMemo(() => {
    if (data.length === 0) {
      return { pathD: '', yLabels: ['0', '25', '50', '75', '100'] };
    }

    const max = Math.max(...data.map((d) => d.viewers), 100);
    const roundedMax = Math.ceil(max / 500) * 500 || 500;

    // Generate path
    const chartWidth = 167;
    const chartHeight = 60;
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * chartWidth;
      const y = chartHeight - (d.viewers / roundedMax) * chartHeight;
      return `${x},${y}`;
    });

    const pathD = `M ${points.join(' L ')}`;

    // Y-axis labels
    const yLabels = [
      (roundedMax).toLocaleString(),
      (roundedMax * 0.75).toLocaleString(),
      (roundedMax * 0.5).toLocaleString(),
      (roundedMax * 0.25).toLocaleString(),
      '0',
    ];

    return { pathD, yLabels };
  }, [data]);

  // Default data for demo
  const displayData = data.length > 0 ? data : [
    { hour: '12:00', viewers: 800 },
    { hour: '13:00', viewers: 1200 },
    { hour: '14:00', viewers: 900 },
    { hour: '15:00', viewers: 1100 },
  ];

  const textPrimary = dark ? 'text-white' : 'text-zinc-800';
  const textLabel = dark ? 'text-white/60' : 'text-zinc-800';
  const gridColor = dark ? '#ffffff20' : '#cad5e2';

  return (
    <div className={cn(
      'rounded-[7px] p-4 flex flex-col gap-4',
      dark ? 'border border-white/20' : 'border border-slate-400',
      className,
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className={cn('w-5 h-5', textPrimary)} />
          <h3 className={cn('text-sm font-semibold', textPrimary)}>Hourly Viewers</h3>
        </div>
        <span className={cn('text-sm font-semibold', textPrimary)}>
          {currentViewers >= 1000
            ? `${(currentViewers / 1000).toFixed(1)}k`
            : currentViewers}
        </span>
      </div>

      {/* Chart */}
      <div className="relative h-[140px] w-full">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-[5px] flex flex-col gap-1 text-right w-[27px]">
          {yLabels.map((label, i) => (
            <span key={i} className={cn('text-[10px] leading-5', textLabel)}>
              {label}
            </span>
          ))}
        </div>

        {/* Chart area */}
        <div className="absolute left-[37px] top-[5px] right-0 h-[100px]">
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={i}
                x1="0"
                y1={ratio * 100}
                x2="100%"
                y2={ratio * 100}
                stroke={gridColor}
                strokeWidth="1"
              />
            ))}
          </svg>

          {/* Line chart */}
          <svg className="absolute left-0 top-[15px] w-full h-[60px]" viewBox="0 0 167 60" preserveAspectRatio="none">
            <path
              d={pathD || 'M 0,30 L 55,20 L 110,40 L 167,25'}
              fill="none"
              stroke="#27c840"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute left-[35px] bottom-0 flex gap-4">
          {displayData.slice(0, 4).map((d, i) => (
            <span key={i} className={cn('text-[10px]', textLabel)}>
              {d.hour}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
