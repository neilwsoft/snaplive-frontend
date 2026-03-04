"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PresetCard,
  SimulcastPreset as FrontendPreset,
} from "@/components/simulcast-presets/PresetCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TabState } from "@/components/ui/tab-state";
import { PlatformStatusBar } from "@/components/dashboard/PlatformStatusBar";
import { SimplePagination } from "@/components/simulcast-history/SimplePagination";
import {
  Search,
  Plus,
  Trash2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/locale-context";
import { useSavedPresets, useDeletePreset } from "@/lib/hooks/useSimulcast";
import { SimulcastPreset as BackendPreset } from "@/lib/api/simulcast-presets";

// Platform status data
const platforms = [
  { name: "Douyin", connected: true, signal: 5 },
  { name: "Xiaohongshu/RED", connected: true, signal: 4 },
  { name: "Taobao Live", connected: true, signal: 5 },
];

// Category options
const CATEGORIES = [
  "All",
  "Fashion",
  "Beauty",
  "Food",
  "Lifestyle",
  "Tech",
  "Shopping",
  "Music",
] as const;

type Category = (typeof CATEGORIES)[number];

// Marketplace filter options
const MARKETPLACE_OPTIONS = [
  { value: "all", label: "All Platforms" },
  { value: "douyin", label: "Douyin" },
  { value: "xiaohongshu", label: "Xiaohongshu/RED" },
  { value: "taobao live", label: "Taobao Live" },
  { value: "snaplive", label: "SnapLive" },
] as const;

type MarketplaceFilter = (typeof MARKETPLACE_OPTIONS)[number]["value"];

const ITEMS_PER_PAGE = 8;

// Determine category from preset products
const determineCategory = (preset: BackendPreset): string => {
  if (preset.products && preset.products.length > 0) {
    const category = preset.products[0].category;
    if (category && CATEGORIES.includes(category as Category)) {
      return category;
    }
  }
  // Default based on title keywords
  const title = preset.title.toLowerCase();
  if (title.includes("fashion") || title.includes("clothing")) return "Fashion";
  if (title.includes("beauty") || title.includes("makeup")) return "Beauty";
  if (title.includes("food") || title.includes("snack")) return "Food";
  if (title.includes("tech") || title.includes("gadget")) return "Tech";
  return "Fashion"; // Default
};

// Transform backend preset to frontend format
const transformPreset = (backend: BackendPreset): FrontendPreset => {
  const updateDate = new Date(backend.updated_at);

  return {
    id: backend._id,
    title: backend.title,
    lastUpdate: updateDate
      .toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "年")
      .replace(/-/g, "月") + "日",
    time: updateDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    thumbnailUrl:
      backend.branding?.landscape_logo_url ||
      backend.branding?.boxed_logo_url ||
      "https://images.unsplash.com/photo-1556911261-6bd341186b2f?w=400&h=300&fit=crop",
    category: determineCategory(backend),
    platforms: ["douyin", "xiaohongshu", "taobao live", "snaplive"],
    stats: {
      invitedUsers: backend.invited_user_ids?.length || 0,
      products: backend.products?.length || 0,
      multiCam: backend.cameras?.length || 0,
      branding: !!(
        backend.branding?.landscape_logo_url || backend.branding?.boxed_logo_url
      ),
    },
  };
};

export default function SimulcastPresetsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLocale();
  const sellerId = user?.id;

  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [marketplaceFilter, setMarketplaceFilter] =
    useState<MarketplaceFilter>("all");

  // Fetch presets from API
  const {
    data: backendPresets = [],
    isLoading,
    error,
    refetch,
  } = useSavedPresets(sellerId);
  const deletePreset = useDeletePreset();

  // Transform presets to frontend format
  const transformedPresets = useMemo(() => {
    return backendPresets.map(transformPreset);
  }, [backendPresets]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      counts[cat] = 0;
    }
    for (const preset of transformedPresets) {
      if (preset.category && counts[preset.category] !== undefined) {
        counts[preset.category]++;
      }
    }
    return counts;
  }, [transformedPresets]);

  // Filter presets
  const filteredPresets = useMemo(() => {
    return transformedPresets.filter((preset) => {
      // Search filter
      if (
        searchQuery &&
        !preset.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Category filter
      if (selectedCategory !== "All" && preset.category !== selectedCategory) {
        return false;
      }
      // Marketplace filter
      if (marketplaceFilter !== "all") {
        const hasPlatform = preset.platforms.includes(
          marketplaceFilter as
            | "douyin"
            | "xiaohongshu"
            | "taobao live"
            | "snaplive"
        );
        if (!hasPlatform) return false;
      }
      return true;
    });
  }, [transformedPresets, searchQuery, selectedCategory, marketplaceFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPresets.length / ITEMS_PER_PAGE);
  const paginatedPresets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPresets.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPresets, currentPage]);

  const handleSelectPreset = (id: string) => {
    setSelectedPresets((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handlePlayPreset = (id: string) => {
    const preset = filteredPresets.find((p) => p.id === id);
    toast.success(`Loading preset: ${preset?.title}`);
    router.push(`/dashboard/livecam/presets/${id}`);
  };

  const handleAddPreset = () => {
    router.push("/dashboard/livecam/simulcast");
  };

  const handleDeleteSelected = async () => {
    if (selectedPresets.length === 0) {
      toast.error("No presets selected");
      return;
    }

    if (!window.confirm(`Delete ${selectedPresets.length} preset(s)?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedPresets.map((id) => deletePreset.mutateAsync(id))
      );
      toast.success(`Deleted ${selectedPresets.length} preset(s)`);
      setSelectedPresets([]);
    } catch (err) {
      console.error("Failed to delete presets:", err);
      toast.error("Failed to delete presets");
    }
  };

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[rgba(248,250,252,0.72)] backdrop-blur-md">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#94a3b8]" />
          <p className="text-sm text-muted-foreground">{t("livestream.presets.loading")}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-[rgba(248,250,252,0.72)] backdrop-blur-md">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-red-600 mb-4">{t("livestream.presets.failed")}</p>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline">
              {t("common.retry")}
            </Button>
            <Button onClick={handleAddPreset} variant="outline">
              {t("livestream.presets.create")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 bg-[#f1f5f9]">
      {/* Page Header - Outside Card */}
      <div className="flex items-center justify-between w-full gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-[#27272a] tracking-tight">
          {t("livestream.presets.title")}{" "}
          <span className="text-[#b3bad1] font-normal">{t("livestream.presets.subtitle")}</span>
        </h1>
        <PlatformStatusBar platforms={platforms} />
      </div>

      {/* Main Card Container */}
      <Card className="flex-1 flex flex-col min-h-0 border border-[#e2e8f0] shadow-sm bg-white rounded-xl">
        <CardContent className="flex-1 flex flex-col min-h-0 p-6">
          {/* Controls Bar */}
          <div className="flex flex-col gap-4 w-full mb-6">
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
                      {t("livestream.presets.filterSimulcasts")}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setSearchQuery("")}>
                      {t("livestream.presets.allPresets")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        toast.info("Filter by date not yet implemented")
                      }
                    >
                      {t("livestream.presets.recent7Days")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        toast.info("Filter by date not yet implemented")
                      }
                    >
                      {t("livestream.presets.thisMonth")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Category Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
                  {CATEGORIES.map((category) => {
                    const isSelected = selectedCategory === category;
                    const count =
                      category === "All"
                        ? transformedPresets.length
                        : categoryCounts[category] || 0;

                    return (
                      <TabState
                        key={category}
                        tabLabel={category}
                        selected={isSelected}
                        count={count}
                        onClick={() => handleCategoryChange(category)}
                      />
                    );
                  })}
                </div>
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
                      {t("livestream.presets.filterMarketplace")}
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

                {/* Add Preset Button */}
                <Button
                  onClick={handleAddPreset}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-[#94a3b8] text-[#27272a]"
                >
                  <Plus className="w-4 h-4" />
                  {t("livestream.presets.addPreset")}
                </Button>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={selectedPresets.length === 0}
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

          {/* Presets Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {paginatedPresets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                {paginatedPresets.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    selected={selectedPresets.includes(preset.id)}
                    onSelect={handleSelectPreset}
                    onPlay={handlePlayPreset}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-64 gap-4">
                <p className="text-lg text-gray-500">
                  {searchQuery ||
                  selectedCategory !== "All" ||
                  marketplaceFilter !== "all"
                    ? t("livestream.presets.noPresetsMatch")
                    : t("livestream.presets.noPresets")}
                </p>
                {!searchQuery &&
                  selectedCategory === "All" &&
                  marketplaceFilter === "all" && (
                    <Button onClick={handleAddPreset}>
                      <Plus className="w-4 h-4 mr-2" />
                      {t("livestream.presets.createFirst")}
                    </Button>
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
              className="pt-4 border-t border-gray-200"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
