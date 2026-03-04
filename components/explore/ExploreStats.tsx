'use client';

import { Play, TrendingUp, Users, Globe } from 'lucide-react';
import { useLocale } from '@/lib/locale-context';

interface ExploreStatsProps {
  liveCount: number;
}

export function ExploreStats({ liveCount }: ExploreStatsProps) {
  const { t } = useLocale();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Live Now */}
      <div className="flex flex-col items-center gap-2 p-6 rounded-xl border border-red-100 bg-red-50/50">
        <span className="text-sm font-semibold text-red-500 uppercase tracking-wide">
          {t('explore.stats.liveNow')}
        </span>
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-red-500 fill-red-500" />
          <span className="text-4xl font-bold text-red-500">{liveCount}</span>
        </div>
        <span className="text-xs text-zinc-500">
          {t('explore.stats.liveNowDesc')}
        </span>
      </div>

      {/* Active Viewers */}
      <div className="flex flex-col items-center gap-2 p-6 rounded-xl border border-amber-100 bg-amber-50/50">
        <span className="text-sm font-semibold text-amber-500 uppercase tracking-wide">
          {t('explore.stats.activeViewers')}
        </span>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          <span className="text-4xl font-bold text-amber-500">320K+</span>
        </div>
        <span className="text-xs text-zinc-500">
          {t('explore.stats.activeViewersDesc')}
        </span>
      </div>

      {/* Total Users */}
      <div className="flex flex-col items-center gap-2 p-6 rounded-xl border border-blue-100 bg-blue-50/50">
        <span className="text-sm font-semibold text-blue-500 uppercase tracking-wide">
          {t('explore.stats.totalUsers')}
        </span>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          <span className="text-4xl font-bold text-blue-500">1.2M+</span>
        </div>
        <span className="text-xs text-zinc-500">
          {t('explore.stats.totalUsersDesc')}
        </span>
      </div>

      {/* Marketplace Platforms */}
      <div className="flex flex-col items-center gap-2 p-6 rounded-xl border border-purple-100 bg-purple-50/50">
        <span className="text-sm font-semibold text-purple-500 uppercase tracking-wide">
          {t('explore.stats.marketplacePlatforms')}
        </span>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-500" />
          <span className="text-4xl font-bold text-purple-500">11</span>
        </div>
        <span className="text-xs text-zinc-500">
          {t('explore.stats.marketplacePlatformsDesc')}
        </span>
      </div>
    </div>
  );
}
