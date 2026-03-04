"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Monitor,
  Users,
  ShoppingCart,
  DollarSign,
  MessageCircle,
  ThumbsUp,
  Eye,
  Loader2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/lib/api/livestream-sessions";
import { ChipSimulcastCategory } from "@/components/ui/chip-simulcast-category";
import { MarketplacePlatformBadge } from "@/components/dashboard/MarketplacePlatformBadge";
import { SocialStats } from "@/components/browse-simulcasts/SocialStats";

const PLACEHOLDER_THUMBNAIL = "/images/placeholder-thumbnail.svg";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function HistoryDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ["livestream-session", id],
    queryFn: () => getSession(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[rgba(248,250,252,0.72)] backdrop-blur-md">
        <Loader2 className="h-8 w-8 animate-spin text-[#94a3b8]" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-[rgba(248,250,252,0.72)] backdrop-blur-md">
        <p className="text-red-500">Failed to load session details</p>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  const startDate = session.started_at
    ? new Date(session.started_at)
    : new Date(session.created_at);

  const platforms = (session.platforms && session.platforms.length > 0)
    ? session.platforms.map((p) => p.toLowerCase() as "douyin" | "xiaohongshu" | "taobao live" | "snaplive")
    : ["douyin", "xiaohongshu", "taobao live", "snaplive"] as const;

  const category = session.category || "General";
  const resolution = session.resolution || "HD";

  return (
    <div className="flex flex-col gap-6 h-full px-6 py-8 backdrop-blur-md bg-[rgba(248,250,252,0.72)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-[#27272a] tracking-tight">
            {session.title || "Untitled Session"}
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            {session.description || "No description"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 capitalize">
            {session.status}
          </span>
        </div>
      </div>

      {/* Thumbnail + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thumbnail */}
        <div className="lg:col-span-1">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#27272a]">
            <Image
              src={session.thumbnail_url || PLACEHOLDER_THUMBNAIL}
              alt={session.title || "Session thumbnail"}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
          </div>

          {/* Categories & Platforms below thumbnail */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 flex items-center gap-2 flex-wrap">
              <ChipSimulcastCategory simulcastCategory={category} />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {platforms.map((platform) => (
                <MarketplacePlatformBadge
                  key={platform}
                  platform={platform}
                  size="md"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<Calendar className="w-4 h-4" />}
            label="Date"
            value={startDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="Duration"
            value={formatDuration(session.duration_seconds)}
          />
          <StatCard
            icon={<Monitor className="w-4 h-4" />}
            label="Resolution"
            value={resolution}
          />
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="Peak Viewers"
            value={formatNumber(session.stats.peak_viewers)}
          />
          <StatCard
            icon={<ShoppingCart className="w-4 h-4" />}
            label="Products Sold"
            value={formatNumber(session.stats.products_sold)}
          />
          <StatCard
            icon={<DollarSign className="w-4 h-4" />}
            label="Revenue"
            value={formatCurrency(session.stats.revenue)}
          />
        </div>
      </div>

      {/* Social Stats */}
      <div className="max-w-md">
        <SocialStats
          views={formatNumber(session.stats.total_viewers)}
          likes={formatNumber(session.stats.reaction_count)}
          comments={formatNumber(session.stats.message_count)}
        />
      </div>

      {/* Products Section */}
      {session.products && session.products.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[#27272a] mb-3 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Products ({session.products.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {session.products.map((product) => (
              <div
                key={product.product_id}
                className="flex gap-3 p-3 border border-[#e2e8f0] rounded-lg bg-white"
              >
                <div className="relative w-14 h-14 rounded-md overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={product.image_url || "/placeholder-product.png"}
                    alt={product.product_name?.en || "Product"}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#27272a] truncate">
                    {product.product_name?.en || product.product_name?.ko || "Unknown"}
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    SKU: {product.sku}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-medium text-[#27272a]">
                      ${product.unit_cost.toFixed(2)}
                    </span>
                    <span className="text-xs text-[#94a3b8]">
                      Stock: {product.available_at_start}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 p-4 border border-[#e2e8f0] rounded-lg bg-white">
      <div className="flex items-center gap-2 text-[#94a3b8]">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-lg font-semibold text-[#27272a]">{value}</span>
    </div>
  );
}
