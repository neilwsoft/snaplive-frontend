"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { SocialStats } from "../browse-simulcasts/SocialStats";
import { Checkbox } from "../ui/checkbox";
import { ChipSimulcastCategory } from "../ui/chip-simulcast-category";
import { MarketplacePlatformBadge } from "../dashboard/MarketplacePlatformBadge";

type PlatformType = "douyin" | "xiaohongshu" | "taobao live" | "snaplive";

export interface SimulcastHistoryItem {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  quality: "HD" | "4K" | "1080p" | "720p";
  views: string;
  likes: string;
  comments: string;
  thumbnailUrl: string;
  categories: string[];
  platforms: PlatformType[];
}

interface SimulcastHistoryCardProps {
  item: SimulcastHistoryItem;
  isSelected: boolean;
  onSelectionChange: (id: string, selected: boolean) => void;
  onClick?: () => void;
}

export function SimulcastHistoryCard({
  item,
  isSelected,
  onSelectionChange,
  onClick,
}: SimulcastHistoryCardProps) {
  const handleCheckboxChange = (checked: boolean) => {
    onSelectionChange(item.id, checked);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-slot="checkbox"]')) {
      return;
    }
    onClick?.();
  };

  return (
    <div
      className="flex flex-col gap-4 w-full max-w-[338px] group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Video Thumbnail */}
      <div className="relative w-full h-[220px] rounded-md overflow-hidden bg-[#27272a]">
        <Image
          src={item.thumbnailUrl}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 338px"
        />

        {/* Checkbox Overlay - Top Left */}
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            className="h-[18px] w-[18px] bg-transparent border border-white rounded-sm data-[state=checked]:bg-[#27272a] data-[state=checked]:border-[#27272a]"
          />
        </div>

        {/* Play Button Overlay - Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-[#e7000b] rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Categories & Platform Sources - Below Thumbnail */}
      <div className="flex items-center gap-2 w-full">
        {/* Categories */}
        <div className="flex-1 flex items-start gap-2 overflow-x-auto">
          {item.categories.map((category, index) => (
            <ChipSimulcastCategory
              key={`${category}-${index}`}
              simulcastCategory={category}
            />
          ))}
        </div>

        {/* Platform Icons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.platforms.map((platform) => (
            <MarketplacePlatformBadge
              key={platform}
              platform={platform}
              size="md"
            />
          ))}
        </div>
      </div>

      {/* Header Info */}
      <div className="flex flex-col w-full">
        {/* Date, Time, and Duration */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 text-sm text-[#27272a]">
            <span className="font-normal">{item.date}</span>
            <span className="font-normal">{item.time}</span>
          </div>
          <div className="text-sm text-[#27272a] font-normal">
            {item.duration}
          </div>
        </div>

        {/* Title and Quality */}
        <div className="flex items-center justify-between w-full gap-2">
          <h3 className="text-lg font-semibold text-[#27272a] truncate flex-1 leading-7">
            {item.title}
          </h3>
          <span className="text-lg font-semibold text-[#27272a] shrink-0 leading-7">
            {item.quality}
          </span>
        </div>
      </div>

      {/* Social Stats */}
      <SocialStats
        views={item.views}
        likes={item.likes}
        comments={item.comments}
      />
    </div>
  );
}
