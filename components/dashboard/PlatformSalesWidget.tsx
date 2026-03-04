"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { PieChart } from "@/components/charts/PieChart";
import { useOrderStats } from "@/lib/hooks/useOrders";
import { Platform, getPlatformLabel } from "@/lib/api/orders";
import { useLocale } from "@/lib/locale-context";

// Platform colors for chart
const PLATFORM_COLORS: Record<string, string> = {
  douyin: "rgba(239, 68, 68, 0.8)",      // Red for Douyin
  taobao: "rgba(255, 165, 0, 0.8)",      // Orange for Taobao
  xiaohongshu: "rgba(245, 158, 11, 0.8)", // Yellow for Xiaohongshu
  snaplive: "rgba(59, 130, 246, 0.8)",   // Blue for SnapLive
  direct: "rgba(107, 114, 128, 0.8)",    // Gray for Direct
};

export function PlatformSalesWidget() {
  const { t } = useLocale();
  const { data, isLoading, error } = useOrderStats();

  if (isLoading) {
    return (
      <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 h-full items-center justify-center min-h-[350px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{t("dashboard.widgets.loadingSales")}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 h-full items-center justify-center min-h-[350px]">
        <span className="text-sm text-red-500">{t("dashboard.widgets.failedSales")}</span>
      </div>
    );
  }

  // Transform platform_counts to chart data
  const platformCounts = data.platform_counts || {};
  const platforms = Object.keys(platformCounts).filter(p => platformCounts[p] > 0);

  if (platforms.length === 0) {
    return (
      <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 h-full items-center justify-center min-h-[350px]">
        <span className="text-sm text-muted-foreground">{t("dashboard.widgets.noSalesData")}</span>
        <span className="text-xs text-muted-foreground">{t("dashboard.widgets.seedOrdersHint")}</span>
      </div>
    );
  }

  const labels = platforms.map(p => getPlatformLabel(p as Platform));
  const values = platforms.map(p => platformCounts[p]);
  const colors = platforms.map(p => PLATFORM_COLORS[p] || PLATFORM_COLORS.direct);
  const totalOrders = values.reduce((sum, v) => sum + v, 0);

  return (
    <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[18px] font-semibold leading-7 text-black">
          {t("dashboard.widgets.platformSales")}
        </h3>
        <p className="text-[14px] font-normal leading-6 text-muted-foreground">
          {totalOrders.toLocaleString()} {t("common.total").toLowerCase()} {t("navigation.orders").toLowerCase()}
        </p>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-center justify-center min-h-[250px]">
        <PieChart
          labels={labels}
          data={values}
          backgroundColor={colors}
          height={300}
          showPercentage={true}
        />
      </div>
    </div>
  );
}
