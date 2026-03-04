'use client';

import { Eye, Heart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SocialStats } from '@/lib/types/simulcast';

interface SocialStatsBarProps {
  stats: SocialStats;
  className?: string;
}

/**
 * Social stats bar showing views, likes, and comments
 * Supports dark theme for overlay usage
 */
export function SocialStatsBar({
  stats,
  className,
}: SocialStatsBarProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString();
  };

  return (
    <div className={cn("flex items-center", className)}>
      {/* Views */}
      <div className="flex-1 flex flex-col gap-1 items-center justify-center p-1 border border-white/20 rounded-l-md">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3 h-3 text-white/70" />
          <span className="text-xs font-medium text-white/70">Views</span>
        </div>
        <span className="text-sm font-semibold text-white">
          {formatNumber(stats.views)}
        </span>
      </div>

      {/* Likes */}
      <div className="flex-1 flex flex-col gap-1 items-center justify-center p-1 border-y border-white/20">
        <div className="flex items-center gap-1.5">
          <Heart className="w-3 h-3 text-white/70" />
          <span className="text-xs font-medium text-white/70">Likes</span>
        </div>
        <span className="text-sm font-semibold text-white">
          {formatNumber(stats.likes)}
        </span>
      </div>

      {/* Comments */}
      <div className="flex-1 flex flex-col gap-1 items-center justify-center p-1 border border-white/20 rounded-r-md">
        <div className="flex items-center gap-1.5">
          <MessageCircle className="w-3 h-3 text-white/70" />
          <span className="text-xs font-medium text-white/70">Comments</span>
        </div>
        <span className="text-sm font-semibold text-white">
          {formatNumber(stats.comments)}
        </span>
      </div>
    </div>
  );
}
