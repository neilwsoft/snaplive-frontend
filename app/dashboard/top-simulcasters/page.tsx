"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { Search, Filter, ChevronDown } from "lucide-react";
import { SimulcastersTable } from "@/components/top-simulcasters/SimulcastersTable";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { useTopSimulcasters } from "@/lib/hooks/useTopSimulcasters";
import type { TimePeriod } from "@/lib/api/simulcasters";

const categoryKeys = [
  "all",
  "fashion",
  "beauty",
  "food",
  "lifestyle",
  "tech",
  "shopping",
  "music",
] as const;

const marketplaceKeys = ["all", "douyin", "xiaohongshu", "taobao"] as const;

export default function TopSimulcastersPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all_time");
  const [marketplace, setMarketplace] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch top simulcasters from backend
  const { data, isLoading } = useTopSimulcasters(
    timePeriod,
    selectedCategory === "all" ? undefined : t(`topSimulcasters.categories.${selectedCategory}`),
    marketplace === "all" ? undefined : marketplace,
    currentPage,
    pageSize
  );

  // Client-side search filter
  const filteredSimulcasters = useMemo(() => {
    if (!data?.items) return [];

    return data.items.filter((simulcaster) => {
      const matchesSearch = simulcaster.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [data?.items, searchQuery]);

  const handleSimulcasterClick = (sellerId: string) => {
    router.push(`/dashboard/sellers/${sellerId}`);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getCategoryCount = (category: string) => {
    if (category === "all") return data?.total || 0;
    const categoryLabel = t(`topSimulcasters.categories.${category}`);
    return data?.items.filter((s) => s.categories.includes(categoryLabel)).length || 0;
  };

  const timePeriodLabel = {
    all_time: t("topSimulcasters.allTimeSimulcaster"),
    month: t("topSimulcasters.thisMonthTopSimulcaster"),
    week: t("topSimulcasters.thisWeekTopSimulcaster"),
  }[timePeriod];

  return (
    <div className="flex flex-col gap-10 h-full px-6 py-10 backdrop-blur-md bg-[rgba(248,250,252,0.72)]">
      {/* Page Header */}
      <div className="flex items-center justify-between w-full gap-2">
        <h1 className="flex-1 text-2xl font-semibold text-[#27272a] tracking-tight">
          {t("topSimulcasters.title")}
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-6 w-full max-w-[1608px]">
        {/* Filter Controls */}
        <div className="flex items-center gap-4 w-full">
          {/* Search Bar */}
          <div className="relative w-[312px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#27272a]" />
            <Input
              type="text"
              placeholder={t("topSimulcasters.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 border border-[#94a3b8] rounded-md text-sm text-[#27272a] placeholder:opacity-50"
            />
          </div>

          {/* Time Period Filter */}
          <Select
            value={timePeriod}
            onValueChange={(value) => {
              setTimePeriod(value as TimePeriod);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t("topSimulcasters.filterByTime")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_time">{t("topSimulcasters.allTime")}</SelectItem>
              <SelectItem value="month">{t("topSimulcasters.thisMonth")}</SelectItem>
              <SelectItem value="week">{t("topSimulcasters.thisWeek")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Marketplace Filter */}
          <Select
            value={marketplace}
            onValueChange={(value) => {
              setMarketplace(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder={t("topSimulcasters.filterMarketplace")} />
            </SelectTrigger>
            <SelectContent>
              {marketplaceKeys.map((key) => (
                <SelectItem key={key} value={key}>
                  {t(`topSimulcasters.marketplaces.${key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Tabs - single row: Filter Simulcasts | Tabs | Filter Marketplace */}
        <div className="flex items-center justify-between w-full">
          {/* Filter Simulcasts */}
          <button className="shrink-0 flex items-center gap-2 text-sm font-medium text-[#27272a] hover:opacity-70 transition-opacity">
            <span>{t("topSimulcasters.filterByTime")}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Category Tabs - Centered */}
          <Tabs
            value={selectedCategory}
            onValueChange={(value) => handleCategoryClick(value)}
          >
            <TabsList className="h-9 bg-[#f1f5f9] rounded-full px-1 py-0.5 gap-0">
              {categoryKeys.map((categoryKey) => {
                const count = getCategoryCount(categoryKey);
                return (
                  <TabsTrigger
                    key={categoryKey}
                    value={categoryKey}
                    className="rounded-full px-3 py-1 text-sm font-medium border-0 gap-1.5 text-[#64748b] data-[state=active]:bg-white data-[state=active]:text-[#27272a] data-[state=active]:shadow-sm"
                  >
                    {t(`topSimulcasters.categories.${categoryKey}`)}
                    <span className="text-[11px] font-semibold text-[#94a3b8] tabular-nums">{count}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Filter Marketplace */}
          <button className="shrink-0 flex items-center gap-2 text-sm font-medium text-[#27272a] hover:opacity-70 transition-opacity">
            <span>{t("topSimulcasters.filterMarketplace")}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#27272a]">
            {timePeriodLabel}
          </h2>
          <span className="text-sm text-slate-500">
            {data?.total || 0} {t("topSimulcasters.simulcastersCount")}
          </span>
        </div>

        {/* Leaderboard Table */}
        <SimulcastersTable
          simulcasters={filteredSimulcasters}
          isLoading={isLoading}
          onRowClick={handleSimulcasterClick}
        />

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={data.total_pages}
            totalItems={data.total}
            itemsPerPage={pageSize}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
