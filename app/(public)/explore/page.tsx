'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SimulcastCard } from '@/components/browse-simulcasts/SimulcastCard';
import { SimulcastersTable } from '@/components/top-simulcasters/SimulcastersTable';
import { ExploreBanner } from '@/components/explore/ExploreBanner';
import { ExploreStats } from '@/components/explore/ExploreStats';
import { usePublicSessions, useCategoryCounts } from '@/lib/hooks/usePublicSessions';
import { useTopSimulcasters } from '@/lib/hooks/useTopSimulcasters';
import { useLocale } from '@/lib/locale-context';
import {
  Loader2,
  Search,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const categoryKeys = [
  'all', 'fashion', 'beauty', 'food', 'lifestyle', 'tech', 'shopping', 'music',
];

export default function ExplorePage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLocale();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch public sessions
  const { data, isLoading, error } = usePublicSessions({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    status: 'live',
  });

  // Fetch category counts
  const { data: categoryCounts } = useCategoryCounts();

  // Fetch top simulcasters (public view - limited)
  const { data: simulcastersData, isLoading: isSimulcastersLoading } = useTopSimulcasters(
    'all_time',
    undefined,
    undefined,
    1,
    5
  );

  // Handle clicking on a simulcast (redirect to login)
  const handleSimulcastClick = (roomName: string) => {
    const returnUrl = encodeURIComponent(`/live/${roomName}`);
    router.push(`/login?returnUrl=${returnUrl}`);
  };

  // Compute live count from data
  const liveCount = data?.items.length ?? 0;

  // Get category count
  const getCategoryCount = (key: string) => {
    if (!categoryCounts) return 0;
    return (categoryCounts as Record<string, number>)[key] ?? 0;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-zinc-800">
          {t('explore.title')}
        </h1>

        {/* Search Bar */}
        <div className="relative w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder={t('explore.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 border border-slate-200 rounded-md text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>

        {/* Language Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocale('en')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
              locale === 'en'
                ? 'bg-white border-zinc-300 text-zinc-800 shadow-sm'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            )}
          >
            <span className="text-base">🇺🇸</span>
            English
          </button>
          <button
            onClick={() => setLocale('ko')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
              locale === 'ko'
                ? 'bg-white border-zinc-300 text-zinc-800 shadow-sm'
                : 'border-transparent text-zinc-500 hover:text-zinc-700'
            )}
          >
            <span className="text-base">🇰🇷</span>
            Korean
          </button>
        </div>
      </div>

      {/* Banner Carousel */}
      <div className="px-6 mt-6">
        <ExploreBanner />
      </div>

      {/* Analytics Stats Cards */}
      <div className="px-6 mt-8">
        <ExploreStats liveCount={liveCount} />
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between px-6 mt-8">
        {/* Filter Simulcasts */}
        <button className="shrink-0 flex items-center gap-2 text-sm font-medium text-zinc-800 hover:opacity-70 transition-opacity">
          <span>{t('explore.filterSimulcasts')}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="h-9 bg-slate-100 rounded-full px-1 py-0.5 gap-0">
            {categoryKeys.map((key) => {
              const count = getCategoryCount(key);
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="rounded-full px-3 py-1 text-sm font-medium border-0 gap-1.5 text-slate-500 data-[state=active]:bg-white data-[state=active]:text-zinc-800 data-[state=active]:shadow-sm"
                >
                  {t(`topSimulcasters.categories.${key}`)}
                  <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
                    {count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Filter Marketplace */}
        <button className="shrink-0 flex items-center gap-2 text-sm font-medium text-zinc-800 hover:opacity-70 transition-opacity">
          <span>{t('explore.filterMarketplace')}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live Simulcasts Grid */}
      <div className="px-6 mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              <p className="text-sm text-zinc-500">{t('explore.loading')}</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-zinc-600">{t('explore.failed')}</p>
              <p className="text-sm text-zinc-400 mt-1">{t('common.retry')}</p>
            </div>
          </div>
        ) : data?.items.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-zinc-600">{t('explore.noLiveStreams')}</p>
              <p className="text-sm text-zinc-400 mt-1">
                {t('explore.noLiveStreamsDesc')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 items-start">
            {data?.items.map((simulcast) => (
              <SimulcastCard
                key={simulcast.id}
                simulcast={{
                  id: simulcast.id,
                  title: simulcast.title,
                  date: simulcast.date,
                  time: simulcast.time,
                  duration: simulcast.duration,
                  quality: simulcast.quality,
                  views: simulcast.views,
                  likes: simulcast.likes,
                  comments: simulcast.comments,
                  thumbnailUrl: simulcast.thumbnailUrl || '',
                  isLive: simulcast.status === 'live',
                  category: simulcast.category,
                }}
                onClick={() => handleSimulcastClick(simulcast.roomName)}
                isGuest={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Top Simulcasters Section */}
      <div className="flex flex-col gap-6 px-6 mt-12 mb-10">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-800 tracking-tight">
            {t('explore.topSimulcasters')}
          </h2>
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-blue-600 transition-colors"
          >
            <span>{t('common.seeAll')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Simulcasters Table */}
        <SimulcastersTable
          simulcasters={simulcastersData?.items || []}
          isLoading={isSimulcastersLoading}
          onRowClick={() => router.push('/login')}
          highlightTopRanks={3}
        />
      </div>

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="border-t border-slate-200 px-6 py-4">
          <p className="text-sm text-zinc-500 text-center">
            {data.items.length} {t('common.of')} {data.total} {t('common.results')}
          </p>
        </div>
      )}
    </div>
  );
}
