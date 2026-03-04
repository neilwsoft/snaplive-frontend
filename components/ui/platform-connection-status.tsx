"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

export type MarketplacePlatform = "douyin" | "xiaohongshu" | "taobao" | "snaplive";

interface PlatformConnectionStatusProps {
  marketplace: MarketplacePlatform;
  connected?: boolean;
  signalStrength?: 0 | 1 | 2 | 3 | 4 | 5;
  className?: string;
}

const platformConfig: Record<
  MarketplacePlatform,
  { name: string; icon: string }
> = {
  douyin: { name: "Douyin", icon: "/images/platforms/douyin.svg" },
  xiaohongshu: { name: "Xiaohongshu", icon: "/images/platforms/xiaohongshu.svg" },
  taobao: { name: "Taobao Live", icon: "/images/platforms/taobao.svg" },
  snaplive: { name: "Snaplive", icon: "/images/platforms/snaplive.svg" },
};

// Signal bars heights per Figma spec (in pixels)
const BAR_HEIGHTS = [6, 10, 14, 18, 22];

function PlatformIcon({ marketplace }: { marketplace: MarketplacePlatform }) {
  const config = platformConfig[marketplace];
  return (
    <div
      data-slot="platform-icon"
      className="relative size-6 rounded-[4.2px] overflow-hidden shadow-[0px_2.4px_3.6px_0px_rgba(0,0,0,0.09)]"
    >
      <Image
        src={config.icon}
        alt={config.name}
        fill
        className="object-cover"
        sizes="24px"
      />
    </div>
  );
}

function SignalBars({
  connected,
  signalStrength,
}: {
  connected: boolean;
  signalStrength?: number;
}) {
  // If signalStrength is provided, use it to determine how many bars are filled
  // Otherwise, use connected state (4 bars when connected, 0 when not)
  const filledBars = signalStrength ?? (connected ? 4 : 0);

  return (
    <div
      data-slot="signal-bars"
      className="flex items-end justify-center gap-px size-6"
    >
      {BAR_HEIGHTS.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-1 rounded-[1px]",
            index < filledBars ? "bg-[#27c840]" : "bg-[#e2e8f0]"
          )}
          style={{ height: `${height}px` }}
        />
      ))}
    </div>
  );
}

export function PlatformConnectionStatus({
  marketplace,
  connected = false,
  signalStrength,
  className,
}: PlatformConnectionStatusProps) {
  return (
    <div
      data-slot="platform-connection-status"
      className={cn("flex items-center gap-2.5", className)}
    >
      <PlatformIcon marketplace={marketplace} />
      <SignalBars connected={connected} signalStrength={signalStrength} />
    </div>
  );
}

// Group component for showing multiple platforms together
interface PlatformConnectionStatusGroupProps {
  platforms: Array<{
    marketplace: MarketplacePlatform;
    connected: boolean;
    signalStrength?: 0 | 1 | 2 | 3 | 4 | 5;
  }>;
  className?: string;
}

export function PlatformConnectionStatusGroup({
  platforms,
  className,
}: PlatformConnectionStatusGroupProps) {
  return (
    <div
      data-slot="platform-connection-status-group"
      className={cn("flex items-center gap-2", className)}
    >
      {platforms.map((platform) => (
        <PlatformConnectionStatus
          key={platform.marketplace}
          marketplace={platform.marketplace}
          connected={platform.connected}
          signalStrength={platform.signalStrength}
        />
      ))}
    </div>
  );
}
