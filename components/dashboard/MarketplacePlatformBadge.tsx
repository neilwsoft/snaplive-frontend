"use client";

import { cn } from "@/lib/utils";

// Extended type to support both old and new platform names
type MarketplaceType =
  | "douyin"
  | "xiaohongshu"
  | "taobao live"
  | "snaplive"
  // Legacy aliases
  | "taobao"
  | "red";

interface MarketplacePlatformBadgeProps {
  className?: string;
  platform: MarketplaceType;
  size?: "sm" | "md";
}

type PlatformConfig = { bg: string; text: string; abbr: string; name: string };

const platformConfig: Record<string, PlatformConfig> = {
  douyin: {
    bg: "bg-black",
    text: "text-white",
    abbr: "DY",
    name: "Douyin",
  },
  xiaohongshu: {
    bg: "bg-red-500",
    text: "text-white",
    abbr: "XHS",
    name: "Xiaohongshu/RED",
  },
  red: {
    bg: "bg-red-500",
    text: "text-white",
    abbr: "XHS",
    name: "Xiaohongshu/RED",
  },
  "taobao live": {
    bg: "bg-orange-500",
    text: "text-white",
    abbr: "TB",
    name: "Taobao Live",
  },
  taobao: {
    bg: "bg-orange-500",
    text: "text-white",
    abbr: "TB",
    name: "Taobao Live",
  },
  snaplive: {
    bg: "bg-[#ffdf20]",
    text: "text-[#27272a]",
    abbr: "SL",
    name: "SnapLive 2.0",
  },
};

export function MarketplacePlatformBadge({
  className,
  platform,
  size = "md",
}: MarketplacePlatformBadgeProps) {
  const config = platformConfig[platform];
  const dimension = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  const fontSize = size === "sm" ? "text-[6px]" : "text-[8px]";

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded overflow-hidden",
        "shadow-[0px_2.4px_3.6px_0px_rgba(0,0,0,0.09)]",
        dimension,
        className
      )}
      title={config.name}
    >
      <div
        className={cn(
          "w-full h-full flex items-center justify-center",
          config.bg
        )}
      >
        <span className={cn("font-bold", fontSize, config.text)}>
          {config.abbr}
        </span>
      </div>
    </div>
  );
}

// Alias for backwards compatibility and Figma naming
export { MarketplacePlatformBadge as MarketplacePlatform };
