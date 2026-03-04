"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Check, X } from "lucide-react";
import { ChipSimulcastCategory } from "../ui/chip-simulcast-category";
import { MarketplacePlatformBadge } from "../dashboard/MarketplacePlatformBadge";

type PlatformType = "douyin" | "xiaohongshu" | "taobao live" | "snaplive";

export interface SimulcastPreset {
  id: string;
  title: string;
  lastUpdate: string;
  time: string;
  thumbnailUrl: string;
  category?: string;
  platforms: PlatformType[];
  stats: {
    invitedUsers: number;
    products: number;
    multiCam: number;
    branding: boolean;
  };
}

interface PresetCardProps {
  preset: SimulcastPreset;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onPlay?: (id: string) => void;
  className?: string;
}

export function PresetCard({
  preset,
  selected = false,
  onSelect,
  onPlay,
  className = "",
}: PresetCardProps) {
  return (
    <div className={`flex flex-col gap-4 w-full max-w-[338px] ${className}`}>
      {/* Thumbnail with overlay */}
      <div className="relative w-full h-[220px] bg-[#27272a] rounded-md overflow-hidden group">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={preset.thumbnailUrl}
            alt={preset.title}
            fill
            className="object-cover"
            sizes="338px"
          />
        </div>

        {/* Play Button Overlay - Navigate to Edit Page */}
        <Link
          href={`/dashboard/livecam/presets/${preset.id}`}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#e7000b] hover:bg-[#e7000b]/90 rounded-md w-8 h-8 flex items-center justify-center transition-all group-hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.(preset.id);
          }}
        >
          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
        </Link>

        {/* Checkbox */}
        <button
          onClick={() => onSelect?.(preset.id)}
          className="absolute left-2 top-2 w-6 h-6 flex items-center justify-center"
        >
          <div
            className={`w-[18px] h-[18px] rounded-sm border ${
              selected
                ? "bg-[#27272a] border-[#27272a]"
                : "bg-transparent border-white"
            } flex items-center justify-center`}
          >
            {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
        </button>
      </div>

      {/* Category & Platform Sources - Below Thumbnail */}
      <div className="flex items-center gap-2 w-full">
        {/* Category */}
        {preset.category && (
          <div className="flex-1">
            <ChipSimulcastCategory simulcastCategory={preset.category} />
          </div>
        )}

        {/* Platform Icons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {preset.platforms.map((platform) => (
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
        {/* Last Update */}
        <div className="flex items-center justify-between w-full">
          <p className="text-sm font-normal text-[#27272a] leading-6">
            Last Update
          </p>
          <div className="flex items-center gap-3 text-sm font-normal text-[#27272a] leading-6">
            <span>{preset.lastUpdate}</span>
            <span>{preset.time}</span>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold text-[#27272a] leading-7 truncate">
            {preset.title}
          </h3>
        </div>
      </div>

      {/* Stats Grid - 2x2 */}
      <div className="grid grid-cols-2 w-full">
        {/* Invited Users */}
        <div className="border border-[#cbd5e1] rounded-tl-md p-2 flex flex-col gap-1 items-center justify-center min-h-[64px]">
          <div className="flex items-center gap-2">
            <svg
              className="w-3 h-3"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="6"
                cy="3.5"
                r="1.5"
                stroke="#27272a"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M3 10.5C3 8.8 4.3 7.5 6 7.5C7.7 7.5 9 8.8 9 10.5"
                stroke="#27272a"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-sm font-medium text-[#27272a]">
              Invited Users
            </span>
          </div>
          <p className="text-base font-medium text-[#27272a]">
            {preset.stats.invitedUsers}
          </p>
        </div>

        {/* Products */}
        <div className="border-t border-r border-b border-[#cbd5e1] rounded-tr-md p-2 flex flex-col gap-1 items-center justify-center min-h-[64px]">
          <div className="flex items-center gap-2">
            <svg
              className="w-3 h-3"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1"
                y="2"
                width="10"
                height="8"
                rx="1"
                stroke="#27272a"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M3.5 2L6 4.5L8.5 2"
                stroke="#27272a"
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-medium text-[#27272a]">Products</span>
          </div>
          <p className="text-base font-medium text-[#27272a]">
            {preset.stats.products}
          </p>
        </div>

        {/* MultiCam */}
        <div className="border-l border-b border-r border-[#cbd5e1] rounded-bl-md p-2 flex flex-col gap-1 items-center justify-center min-h-[64px]">
          <div className="flex items-center gap-2">
            <svg
              className="w-3 h-3"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1"
                y="3"
                width="4"
                height="3"
                rx="0.5"
                stroke="#27272a"
                strokeWidth="1"
                fill="none"
              />
              <rect
                x="7"
                y="3"
                width="4"
                height="3"
                rx="0.5"
                stroke="#27272a"
                strokeWidth="1"
                fill="none"
              />
              <rect
                x="4"
                y="7"
                width="4"
                height="3"
                rx="0.5"
                stroke="#27272a"
                strokeWidth="1"
                fill="none"
              />
            </svg>
            <span className="text-sm font-medium text-[#27272a]">MultiCam</span>
          </div>
          <p className="text-base font-medium text-[#27272a]">
            {preset.stats.multiCam}
          </p>
        </div>

        {/* Branding */}
        <div className="border-b border-r border-[#cbd5e1] rounded-br-md p-2 flex flex-col gap-1 items-center justify-center min-h-[64px]">
          <div className="flex items-center gap-2">
            <svg
              className="w-3 h-3"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1"
                y="2"
                width="10"
                height="8"
                rx="1"
                stroke="#27272a"
                strokeWidth="1"
                fill="none"
              />
              <path
                d="M4 5.5H8M4 7.5H6"
                stroke="#27272a"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-sm font-medium text-[#27272a]">Branding</span>
          </div>
          {preset.stats.branding ? (
            <Check className="w-4 h-4 text-[#27272a]" strokeWidth={2} />
          ) : (
            <X className="w-4 h-4 text-[#94a3b8]" strokeWidth={2} />
          )}
        </div>
      </div>
    </div>
  );
}
