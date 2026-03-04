"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { BarChart } from "@/components/charts/BarChart";
import { useOrderStats } from "@/lib/hooks/useOrders";
import { Platform, getPlatformLabel } from "@/lib/api/orders";
import { useLocale } from "@/lib/locale-context";

// Platform colors for chart
const PLATFORM_COLORS: Record<string, { bg: string; border: string }> = {
  douyin: {
    bg: "rgba(239, 68, 68, 0.7)",
    border: "rgb(239, 68, 68)",
  },
  taobao: {
    bg: "rgba(255, 165, 0, 0.7)",
    border: "rgb(255, 165, 0)",
  },
  xiaohongshu: {
    bg: "rgba(245, 158, 11, 0.7)",
    border: "rgb(245, 158, 11)",
  },
  snaplive: {
    bg: "rgba(59, 130, 246, 0.7)",
    border: "rgb(59, 130, 246)",
  },
  direct: {
    bg: "rgba(107, 114, 128, 0.7)",
    border: "rgb(107, 114, 128)",
  },
};

export function OrderGrowthWidget() {
  const { t } = useLocale();
  const { data, isLoading, error } = useOrderStats();

  if (isLoading) {
    return (
      <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 h-full items-center justify-center min-h-[350px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{t("dashboard.widgets.loadingOrders")}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 h-full items-center justify-center min-h-[350px]">
        <span className="text-sm text-red-500">{t("dashboard.widgets.failedOrders")}</span>
      </div>
    );
  }

  // Transform daily_orders_by_platform to chart data
  const dailyData = data.daily_orders_by_platform || [];

  if (dailyData.length === 0) {
    return (
      <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 h-full items-center justify-center min-h-[350px]">
        <span className="text-sm text-muted-foreground">{t("dashboard.widgets.noOrderData")}</span>
        <span className="text-xs text-muted-foreground">{t("dashboard.widgets.seedOrdersHint")}</span>
      </div>
    );
  }

  // Group data by platform and date
  const platformData: Record<string, Record<string, number>> = {};
  const allDates = new Set<string>();

  dailyData.forEach((item: { date: string; platform: string; count: number }) => {
    allDates.add(item.date);
    if (!platformData[item.platform]) {
      platformData[item.platform] = {};
    }
    platformData[item.platform][item.date] = item.count;
  });

  // Sort dates and take last 7 days
  const sortedDates = Array.from(allDates).sort().slice(-7);
  const platforms = Object.keys(platformData);

  // Build datasets for each platform
  const datasets = platforms.map(platform => ({
    label: getPlatformLabel(platform as Platform),
    data: sortedDates.map(date => platformData[platform][date] || 0),
    backgroundColor: PLATFORM_COLORS[platform]?.bg || PLATFORM_COLORS.direct.bg,
    borderColor: PLATFORM_COLORS[platform]?.border || PLATFORM_COLORS.direct.border,
    borderWidth: 1,
  }));

  // Format date labels
  const labels = sortedDates.map(d => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  // Calculate top platform
  const platformTotals = platforms.map(p => ({
    platform: p,
    total: Object.values(platformData[p]).reduce((a, b) => a + b, 0)
  })).sort((a, b) => b.total - a.total);

  const topPlatform = platformTotals[0];
  const topPlatformLabel = topPlatform ? getPlatformLabel(topPlatform.platform as Platform) : 'N/A';

  return (
    <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[18px] font-semibold leading-7 text-black">
          {t("dashboard.widgets.orderGrowth")}
        </h3>
        <p className="text-[14px] font-normal leading-6 text-black">
          {topPlatformLabel} {t("dashboard.widgets.leadsWith")} {topPlatform?.total.toLocaleString() || 0} {t("navigation.orders").toLowerCase()}
        </p>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[200px]">
        <BarChart
          labels={labels}
          datasets={datasets}
          height={250}
        />
      </div>
    </div>
  );
}
