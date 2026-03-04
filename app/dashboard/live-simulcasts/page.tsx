"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronDown } from "lucide-react";
import { SimulcastCard } from "@/components/browse-simulcasts/SimulcastCard";
import { ExploreBanner } from "@/components/explore/ExploreBanner";
import { ExploreStats } from "@/components/explore/ExploreStats";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBrowseSessions } from "@/lib/hooks/useBrowseSessions";
import { useLocale } from "@/lib/locale-context";

export default function LiveSimulcastsPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch live sessions from backend
  const { data: sessions = [], isLoading, error, refetch } = useBrowseSessions('live');

  const categoryKeys = [
    "all", "fashion", "beauty", "food", "lifestyle", "tech", "shopping", "music",
  ];

  // Filter simulcasts based on category (client-side)
  const filteredSimulcasts = useMemo(() => {
    return sessions.filter((simulcast) => {
      if (selectedCategory === "all") return true;
      const categoryLabel = t(`topSimulcasters.categories.${selectedCategory}`);
      return simulcast.category === categoryLabel;
    });
  }, [sessions, selectedCategory, t]);

  // Count sessions per category
  const getCategoryCount = (key: string) => {
    if (key === "all") return sessions.length;
    const label = t(`topSimulcasters.categories.${key}`);
    return sessions.filter((s) => s.category === label).length;
  };

  const handleSimulcastClick = (roomName: string) => {
    router.push(`/live/${roomName}?type=viewer`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center backdrop-blur-md bg-[rgba(248,250,252,0.72)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#94a3b8]" />
          <p className="text-sm text-muted-foreground">{t("explore.loading")}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center backdrop-blur-md bg-[rgba(248,250,252,0.72)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-red-600 mb-4">{t("explore.failed")}</p>
          <Button onClick={() => refetch()} variant="outline">
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 h-full px-6 py-10 backdrop-blur-md bg-[rgba(248,250,252,0.72)]">
      {/* Page Header */}
      <div className="flex items-center justify-between w-full gap-2">
        <h1 className="flex-1 text-2xl font-semibold text-[#27272a] tracking-tight">
          {t("navigation.liveSimulcasts")}
        </h1>
      </div>

      {/* Banner Carousel */}
      <ExploreBanner />

      {/* Analytics Stats Cards */}
      <ExploreStats liveCount={sessions.length} />

      {/* Gallery Section */}
      <div className="flex flex-col gap-10 w-full max-w-[1560px]">
        {/* Controls - single row: Filter Simulcasts | Tabs | Filter Marketplace */}
        <div className="flex items-center justify-between w-full">
          {/* Filter Simulcasts */}
          <button className="shrink-0 flex items-center gap-2 text-sm font-medium text-[#27272a] hover:opacity-70 transition-opacity">
            <span>{t("explore.filterSimulcasts")}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Category Tabs - Centered */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="h-9 bg-[#f1f5f9] rounded-full px-1 py-0.5 gap-0">
              {categoryKeys.map((key) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="rounded-full px-3 py-1 text-sm font-medium border-0 gap-1.5 text-[#64748b] data-[state=active]:bg-white data-[state=active]:text-[#27272a] data-[state=active]:shadow-sm"
                >
                  {t(`topSimulcasters.categories.${key}`)}
                  <span className="text-[11px] font-semibold text-[#94a3b8] tabular-nums">
                    {getCategoryCount(key)}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Filter Marketplace */}
          <button className="shrink-0 flex items-center gap-2 text-sm font-medium text-[#27272a] hover:opacity-70 transition-opacity">
            <span>{t("topSimulcasters.filterMarketplace")}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="flex flex-wrap gap-6 items-start w-full min-h-[500px]">
          {filteredSimulcasts.length > 0 ? (
            filteredSimulcasts.map((simulcast) => (
              <SimulcastCard
                key={simulcast.id}
                simulcast={simulcast}
                onClick={() => handleSimulcastClick(simulcast.id)}
              />
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-64">
              <p className="text-lg text-gray-500">
                {t("explore.noSimulcastsFound")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
