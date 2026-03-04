"use client";

import Image from "next/image";

export type MarketplacePlatform = "douyin" | "xiaohongshu" | "taobao";

interface MarketplacePlatformTabProps {
  platform: MarketplacePlatform;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

const platformData: Record<
  MarketplacePlatform,
  { name: string; imageUrl: string }
> = {
  douyin: {
    name: "Douyin",
    imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=32&h=32&fit=crop",
  },
  xiaohongshu: {
    name: "Xiaohongshu",
    imageUrl: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=32&h=32&fit=crop",
  },
  taobao: {
    name: "Taobao Live",
    imageUrl: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=32&h=32&fit=crop",
  },
};

export function MarketplacePlatformTab({
  platform,
  active = false,
  onClick,
  className = "",
}: MarketplacePlatformTabProps) {
  const data = platformData[platform];

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 h-8 px-0 pr-3 py-0 ${
        active ? "opacity-100" : "opacity-50 hover:opacity-75"
      } transition-opacity ${className}`}
    >
      <div className="relative w-[31px] h-[31px] rounded-[5px] overflow-hidden flex-shrink-0">
        <Image
          src={data.imageUrl}
          alt={data.name}
          fill
          className="object-cover"
          sizes="31px"
        />
      </div>
      <span className="text-[14px] font-medium text-[#27272a] leading-[20px]">
        {data.name}
      </span>
    </button>
  );
}
