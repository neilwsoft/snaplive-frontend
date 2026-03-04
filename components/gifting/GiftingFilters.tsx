"use client";

import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GiftingFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedPlatform: string | null;
  onPlatformChange: (platform: string | null) => void;
}

export function GiftingFilters({
  searchValue,
  onSearchChange,
  selectedPlatform,
  onPlatformChange,
}: GiftingFiltersProps) {
  const platforms = [
    { value: null, label: "All Platforms" },
    { value: "douyin", label: "Douyin (抖音)" },
    { value: "taobao", label: "Taobao Live (淘宝直播)" },
    { value: "xiaohongshu", label: "Xiaohongshu (小红书)" },
    { value: "snaplive", label: "SnapLive 2.0 (速播 2.0)" },
  ];

  const currentLabel = platforms.find((p) => p.value === selectedPlatform)?.label || "Filter Gifts";

  return (
    <div className="flex items-center gap-4 w-full">
      {/* Search Input */}
      <div className="relative flex-1 max-w-[400px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
        <Input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 bg-white border-[#cbd5e1]"
        />
      </div>

      {/* Platform Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-10 px-4 gap-2 bg-white border-[#cbd5e1] text-[#27272a] hover:bg-[#f8fafc]"
          >
            {currentLabel}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {platforms.map((platform) => (
            <DropdownMenuItem
              key={platform.value || "all"}
              onClick={() => onPlatformChange(platform.value)}
              className={selectedPlatform === platform.value ? "bg-[#f1f5f9]" : ""}
            >
              {platform.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
