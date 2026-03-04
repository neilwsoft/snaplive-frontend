"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Download, Trash2, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SimulcastHistoryCard } from "@/components/simulcast-history/SimulcastHistoryCard";
import {
  HistoryCategoryTabs,
  HistoryCategory,
} from "@/components/simulcast-history/HistoryCategoryTabs";
import { SimplePagination } from "@/components/simulcast-history/SimplePagination";
import { PlatformStatusBar } from "@/components/dashboard/PlatformStatusBar";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/locale-context";
import { useSimulcastHistory } from "@/lib/hooks/useSimulcastHistory";

// Platform status data
const platforms = [
  { name: "Douyin", connected: true, signal: 5 },
  { name: "Xiaohongshu/RED", connected: true, signal: 4 },
  { name: "Taobao Live", connected: true, signal: 5 },
];

// Filter options
const DATE_FILTER_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
] as const;

const MARKETPLACE_FILTER_OPTIONS = [
  { value: "all", label: "All Platforms" },
  { value: "douyin", label: "Douyin" },
  { value: "xiaohongshu", label: "Xiaohongshu/RED" },
  { value: "taobao live", label: "Taobao Live" },
  { value: "snaplive", label: "SnapLive" },
] as const;

type DateFilter = (typeof DATE_FILTER_OPTIONS)[number]["value"];
type MarketplaceFilter = (typeof MARKETPLACE_FILTER_OPTIONS)[number]["value"];

const ITEMS_PER_PAGE = 8;

export default function SimulcastHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLocale();
  const sellerId = user?.id;

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] =
    useState<HistoryCategory>("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [marketplaceFilter, setMarketplaceFilter] =
    useState<MarketplaceFilter>("all");

  // Fetch history from API
  const { data, isLoading, error, refetch } = useSimulcastHistory({
    sellerId: sellerId || "",
    searchQuery,
    category: selectedCategory,
    dateFilter,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
  });

  // Filter by marketplace (client-side)
  const filteredItems =
    data?.items?.filter((item) => {
      if (marketplaceFilter === "all") return true;
      return item.platforms.includes(
        marketplaceFilter as
          | "douyin"
          | "xiaohongshu"
          | "taobao live"
          | "snaplive"
      );
    }) || [];

  const categoryCounts = data?.categoryCounts || {};
  const totalPages = Math.ceil((data?.total || 0) / ITEMS_PER_PAGE);

  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedItems((prev) =>
      selected ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleItemClick = (id: string) => {
    const item = filteredItems.find((h) => h.id === id);
    toast.success(`Opening: ${item?.title}`);
    router.push(`/dashboard/livecam/history/${id}`);
  };

  const handleCategoryChange = (category: HistoryCategory) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleExportData = () => {
    if (filteredItems.length === 0) {
      toast.error("No data to export");
      return;
    }

    const itemsToExport =
      selectedItems.length > 0
        ? filteredItems.filter((item) => selectedItems.includes(item.id))
        : filteredItems;

    const headers = [
      "Title",
      "Date",
      "Time",
      "Duration",
      "Quality",
      "Views",
      "Likes",
      "Comments",
      "Categories",
    ];
    const csvContent = [
      headers.join(","),
      ...itemsToExport.map((item) =>
        [
          `"${item.title}"`,
          item.date,
          item.time,
          item.duration,
          item.quality,
          item.views,
          item.likes,
          item.comments,
          `"${item.categories.join(", ")}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `simulcast-history-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast.success(`Exported ${itemsToExport.length} items`);
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      toast.error("No items selected");
      return;
    }

    if (!window.confirm(`Delete ${selectedItems.length} item(s)?`)) {
      return;
    }

    toast.success(`Deleted ${selectedItems.length} item(s)`);
    setSelectedItems([]);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[rgba(248,250,252,0.72)] backdrop-blur-md">
        <Loader2 className="h-8 w-8 animate-spin text-[#94a3b8]" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-500">{t("livestream.history.failed")}</p>
        <Button onClick={() => refetch()} variant="outline">
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  const selectedDateLabel =
    DATE_FILTER_OPTIONS.find((o) => o.value === dateFilter)?.label || "All Time";
  const selectedMarketplaceLabel =
    MARKETPLACE_FILTER_OPTIONS.find((o) => o.value === marketplaceFilter)
      ?.label || "All Platforms";

  return (
    <div className="flex flex-col gap-6 h-full px-6 py-8 backdrop-blur-md bg-[rgba(248,250,252,0.72)]">
      {/* Page Header */}
      <div className="flex items-center justify-between w-full gap-4">
        <h1 className="text-2xl font-semibold text-[#27272a] tracking-tight">
          {t("livestream.history.title")}{" "}
          <span className="text-[#b3bad1] font-normal">{t("livestream.history.subtitle")}</span>
        </h1>
        <PlatformStatusBar platforms={platforms} />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col gap-4 w-full">
        {/* Filter Row */}
        <div className="flex items-center justify-between w-full gap-4">
          {/* Left: Filter Simulcasts Dropdown + Category Tabs */}
          <div className="flex items-center gap-4 flex-1">
            {/* Filter Simulcasts Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-[#94a3b8] text-[#27272a]"
                >
                  {t("livestream.history.filterSimulcasts")}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => { setDateFilter("all"); setCurrentPage(1); }}
                  className={dateFilter === "all" ? "bg-[#ffdf20]/20" : ""}
                >
                  {t("livestream.history.allTime")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => { setDateFilter("today"); setCurrentPage(1); }}
                  className={dateFilter === "today" ? "bg-[#ffdf20]/20" : ""}
                >
                  {t("livestream.history.today")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => { setDateFilter("week"); setCurrentPage(1); }}
                  className={dateFilter === "week" ? "bg-[#ffdf20]/20" : ""}
                >
                  {t("livestream.history.thisWeek")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => { setDateFilter("month"); setCurrentPage(1); }}
                  className={dateFilter === "month" ? "bg-[#ffdf20]/20" : ""}
                >
                  {t("livestream.history.thisMonth")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Category Tabs */}
            <HistoryCategoryTabs
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              categoryCounts={categoryCounts}
              className="flex-1"
            />
          </div>

          {/* Right: Filter Marketplace + Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Filter Marketplace Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-[#94a3b8] text-[#27272a]"
                >
                  {t("livestream.history.filterMarketplace")}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => { setMarketplaceFilter("all"); setCurrentPage(1); }}
                  className={marketplaceFilter === "all" ? "bg-[#ffdf20]/20" : ""}
                >
                  {t("livestream.platforms.allPlatforms")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => { setMarketplaceFilter("douyin"); setCurrentPage(1); }}
                  className={marketplaceFilter === "douyin" ? "bg-[#ffdf20]/20" : ""}
                >
                  {t("livestream.platforms.douyin")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => { setMarketplaceFilter("xiaohongshu"); setCurrentPage(1); }}
                  className={marketplaceFilter === "xiaohongshu" ? "bg-[#ffdf20]/20" : ""}
                >
                  {t("livestream.platforms.xiaohongshu")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => { setMarketplaceFilter("taobao live"); setCurrentPage(1); }}
                  className={marketplaceFilter === "taobao live" ? "bg-[#ffdf20]/20" : ""}
                >
                  {t("livestream.platforms.taobao")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => { setMarketplaceFilter("snaplive"); setCurrentPage(1); }}
                  className={marketplaceFilter === "snaplive" ? "bg-[#ffdf20]/20" : ""}
                >
                  {t("livestream.platforms.snaplive")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={handleExportData}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-[#94a3b8] text-[#27272a]"
            >
              <Download className="w-4 h-4" />
              {t("livestream.history.exportData")}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={selectedItems.length === 0}
              className="flex items-center gap-2 text-[#94a3b8] hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {t("common.delete")}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <Input
            type="text"
            placeholder={t("common.search")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 pl-10 pr-4 border border-[#94a3b8] rounded-md text-sm"
          />
        </div>
      </div>

      {/* History Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
            {filteredItems.map((item) => (
              <SimulcastHistoryCard
                key={item.id}
                item={item}
                isSelected={selectedItems.includes(item.id)}
                onSelectionChange={handleSelectionChange}
                onClick={() => handleItemClick(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-64 gap-4">
            <p className="text-lg text-gray-500">
              {searchQuery ||
              selectedCategory !== "All" ||
              marketplaceFilter !== "all"
                ? t("livestream.history.noHistoryMatch")
                : t("livestream.history.noHistory")}
            </p>
            {!searchQuery &&
              selectedCategory === "All" &&
              marketplaceFilter === "all" && (
                <p className="text-sm text-gray-400">
                  {t("livestream.history.noHistoryDesc")}
                </p>
              )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="py-4 border-t border-gray-200"
        />
      )}
    </div>
  );
}
