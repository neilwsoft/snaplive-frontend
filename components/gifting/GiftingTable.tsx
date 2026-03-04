"use client";

import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, ArrowUpDown } from "lucide-react";
import type { GiftItem, MarketplaceSource, TierLevel } from "@/lib/api/gifts";

// Platform display config
const platformConfig: Record<
  MarketplaceSource,
  { label: string; icon: string; bgColor: string }
> = {
  douyin: {
    label: "Douyin (抖音)",
    icon: "/images/platforms/douyin.svg",
    bgColor: "bg-gray-800",
  },
  taobao: {
    label: "Taobao Live (淘宝直播)",
    icon: "/images/platforms/taobao.svg",
    bgColor: "bg-orange-500",
  },
  xiaohongshu: {
    label: "Xiaohongshu (小红书)",
    icon: "/images/platforms/xiaohongshu.svg",
    bgColor: "bg-red-500",
  },
  snaplive: {
    label: "SnapLive 2.0 (速播 2.0)",
    icon: "/images/platforms/snaplive.svg",
    bgColor: "bg-yellow-500",
  },
};

const tierColors: Record<TierLevel, string> = {
  small: "bg-gray-100 text-gray-700 border-gray-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  large: "bg-green-50 text-green-700 border-green-200",
  premium: "bg-purple-50 text-purple-700 border-purple-200",
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}年${month}月${day}日\n${hours}:${minutes}`;
}

function formatCurrencyValue(value: number): string {
  if (value >= 1000) {
    return value.toLocaleString();
  }
  return String(value);
}

interface GiftingTableProps {
  gifts: GiftItem[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onEdit: (id: string) => void;
  startIndex: number;
}

export function GiftingTable({
  gifts,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onEdit,
  startIndex,
}: GiftingTableProps) {
  const allSelected = gifts.length > 0 && selectedIds.length === gifts.length;

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg border border-[#e2e8f0]">
      <table className="w-full">
        <thead className="bg-[#f8fafc] border-b border-[#e2e8f0]">
          <tr>
            <th className="w-12 px-4 py-3 text-left">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all"
              />
            </th>
            <th className="w-10 px-2 py-3 text-left text-sm font-medium text-[#27272a]">#</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">Image</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              <div className="flex items-center gap-1">
                Raw Gift Name
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              <div className="flex items-center gap-1">
                Qty
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              <div className="flex items-center gap-1">
                Marketplace Source
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              <div className="flex items-center gap-1">
                Live Simulcast ID
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              <div className="flex items-center gap-1">
                Viewer Username
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              <div className="flex items-center gap-1">
                Gifting Time stamp
                <ArrowUpDown className="h-3 w-3" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              Virtual Currency
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-[#27272a]">
              Tier Level
            </th>
            <th className="w-12 px-4 py-3 text-left text-sm font-medium text-[#27272a]"></th>
          </tr>
        </thead>
        <tbody>
          {gifts.map((gift, index) => {
            const platform = platformConfig[gift.marketplace_source] || platformConfig.snaplive;
            const tierClass = tierColors[gift.tier_level] || tierColors.large;
            const rowNum = startIndex + index + 1;

            return (
              <tr
                key={gift._id}
                className={`border-b border-[#e2e8f0] hover:bg-[#f8fafc] ${
                  index % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                }`}
              >
                {/* Checkbox */}
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedIds.includes(gift._id)}
                    onCheckedChange={(checked) =>
                      onSelectOne(gift._id, checked as boolean)
                    }
                    aria-label={`Select ${gift.raw_gift_name}`}
                  />
                </td>

                {/* Row number */}
                <td className="px-2 py-3 text-sm text-[#64748b]">{rowNum}</td>

                {/* Image */}
                <td className="px-4 py-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#fef3c7]">
                    {gift.image_url ? (
                      <Image
                        src={gift.image_url}
                        alt={gift.raw_gift_name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        🎁
                      </div>
                    )}
                  </div>
                </td>

                {/* Raw Gift Name */}
                <td className="px-4 py-3">
                  <span className="text-sm text-[#27272a] font-medium">
                    {gift.raw_gift_name}
                  </span>
                </td>

                {/* Qty */}
                <td className="px-4 py-3 text-sm text-[#27272a]">
                  x {gift.quantity}
                </td>

                {/* Marketplace Source */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5 shrink-0 rounded overflow-hidden">
                      <Image
                        src={platform.icon}
                        alt={platform.label}
                        fill
                        className="object-contain"
                        sizes="20px"
                      />
                    </div>
                    <span className="text-sm text-[#27272a]">{platform.label}</span>
                  </div>
                </td>

                {/* Live Simulcast ID */}
                <td className="px-4 py-3">
                  <span className="text-sm text-[#27272a] font-mono">
                    {gift.live_simulcast_id}
                  </span>
                </td>

                {/* Viewer Username */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {gift.viewer_username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-[#27272a]">
                      {gift.viewer_username}
                    </span>
                  </div>
                </td>

                {/* Gifting Timestamp */}
                <td className="px-4 py-3">
                  <span className="text-sm text-[#27272a] whitespace-pre-line leading-tight">
                    {formatTimestamp(gift.gifting_timestamp)}
                  </span>
                </td>

                {/* Virtual Currency Value */}
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#27272a]">
                      {formatCurrencyValue(gift.virtual_currency_value)}
                    </span>
                    {gift.currency_label && (
                      <span className="text-xs text-[#94a3b8]">{gift.currency_label}</span>
                    )}
                  </div>
                </td>

                {/* Tier Level */}
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={`${tierClass} text-xs font-medium capitalize`}
                  >
                    {gift.tier_level.charAt(0).toUpperCase() + gift.tier_level.slice(1)}
                  </Badge>
                </td>

                {/* Edit Action */}
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(gift._id)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4 text-[#64748b]" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {gifts.length === 0 && (
        <div className="py-12 text-center text-sm text-[#94a3b8]">
          No gifts found
        </div>
      )}
    </div>
  );
}
