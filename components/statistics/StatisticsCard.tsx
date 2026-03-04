import { Platform } from "@/lib/types/statistics";
import Image from "next/image";

interface StatisticsCardProps {
  platform: Platform;
  title: string;
  value: string;
  unit: string;
  description?: string;
  icon?: string;
  children?: React.ReactNode;
}

const platformNames: Record<Platform, { name: string; color: string }> = {
  douyin: { name: "Douyin 抖音", color: "#000000" },
  xiaohongshu: { name: "Xiaohongshu 小红书", color: "#ff2442" },
  taobao: { name: "Taobao Live 淘宝直播", color: "#ff6a00" },
  snaplive: { name: "SnapLive", color: "#0ea5e9" },
  custom: { name: "Custom RTMP", color: "#cbd5e1" },
};

const platformIcons: Record<Platform, string> = {
  douyin: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=32&h=32&fit=crop",
  xiaohongshu: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=32&h=32&fit=crop",
  taobao: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=32&h=32&fit=crop",
  snaplive: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=32&h=32&fit=crop", // Placeholder
  custom: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=32&h=32&fit=crop", // Placeholder
};

export function StatisticsCard({
  platform,
  title,
  value,
  unit,
  description,
  children,
}: StatisticsCardProps) {
  const platformInfo = platformNames[platform];
  const iconUrl = platformIcons[platform];

  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 rounded overflow-hidden">
          <Image
            src={iconUrl}
            alt={platformInfo.name}
            fill
            className="object-cover"
            sizes="32px"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-[#27272a]">{title}</h3>
          <p className="text-xs text-[#64748b]">{platformInfo.name}</p>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-[#27272a]">{value}</span>
        <span className="text-lg font-medium text-[#64748b]">{unit}</span>
      </div>

      {/* Description or Chart */}
      {description && (
        <p className="text-xs text-[#64748b] leading-relaxed">{description}</p>
      )}

      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
