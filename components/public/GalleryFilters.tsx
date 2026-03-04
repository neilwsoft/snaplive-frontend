'use client';

import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Category data with counts
const categories = [
  { id: 'all', label: 'All', count: 0 },
  { id: 'fashion', label: 'Fashion', count: 0 },
  { id: 'beauty', label: 'Beauty', count: 0 },
  { id: 'food', label: 'Food', count: 0 },
  { id: 'lifestyle', label: 'Lifestyle', count: 0 },
  { id: 'tech', label: 'Tech', count: 0 },
  { id: 'shopping', label: 'Shopping', count: 0 },
  { id: 'music', label: 'Music', count: 0 },
];

// Platform data
const platforms = [
  { id: 'douyin', label: 'Douyin', icon: '/images/platforms/douyin.svg' },
  { id: 'xiaohongshu', label: 'Xiaohongshu', icon: '/images/platforms/xiaohongshu.svg' },
  { id: 'taobao', label: 'Taobao Live', icon: '/images/platforms/taobao.svg' },
  { id: 'snaplive', label: 'SnapLive', icon: '/images/platforms/snaplive.svg' },
];

interface GalleryFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPlatforms: string[];
  onPlatformsChange: (platforms: string[]) => void;
  categoryCounts?: Record<string, number>;
}

export function GalleryFilters({
  selectedCategory,
  onCategoryChange,
  selectedPlatforms,
  onPlatformsChange,
  categoryCounts = {},
}: GalleryFiltersProps) {
  const handlePlatformToggle = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      onPlatformsChange(selectedPlatforms.filter((p) => p !== platformId));
    } else {
      onPlatformsChange([...selectedPlatforms, platformId]);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      {/* Left: Filter Simulcasts */}
      <div className="flex items-center gap-2 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-2 text-sm font-medium">
              Filter Simulcasts
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {categories.map((cat) => (
              <DropdownMenuCheckboxItem
                key={cat.id}
                checked={selectedCategory === cat.id}
                onCheckedChange={() => onCategoryChange(cat.id)}
              >
                {cat.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Center: Category Tabs */}
      <div className="flex-1 flex justify-center overflow-x-auto">
        <div className="bg-slate-100 rounded-md p-2 flex gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || cat.count;

            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all',
                  isSelected
                    ? 'bg-white shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)] text-zinc-800'
                    : 'text-zinc-600 hover:text-zinc-800'
                )}
              >
                <span className="capitalize">{cat.label}</span>
                <span className={cn(
                  'bg-slate-200 text-zinc-800 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[24px] text-center',
                  isSelected && 'bg-slate-100'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Filter Marketplace */}
      <div className="flex items-center gap-2 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 px-2 text-sm font-medium">
              Filter Marketplace
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {platforms.map((platform) => (
              <DropdownMenuCheckboxItem
                key={platform.id}
                checked={selectedPlatforms.includes(platform.id)}
                onCheckedChange={() => handlePlatformToggle(platform.id)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 relative">
                    <Image
                      src={platform.icon}
                      alt={platform.label}
                      fill
                      className="object-contain"
                    />
                  </div>
                  {platform.label}
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Selected platforms display */}
        {selectedPlatforms.length > 0 && (
          <div className="flex items-center gap-2">
            {selectedPlatforms.map((platformId) => {
              const platform = platforms.find((p) => p.id === platformId);
              if (!platform) return null;
              return (
                <div
                  key={platformId}
                  className="w-6 h-6 relative rounded shadow-sm"
                >
                  <Image
                    src={platform.icon}
                    alt={platform.label}
                    fill
                    className="object-contain"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
