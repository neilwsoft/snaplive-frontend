"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { BarChart } from "@/components/charts/BarChart";
import { useRevenueStats } from "@/lib/hooks/useOrders";
import { useLocale } from "@/lib/locale-context";

export function RevenueWidget() {
  const { t } = useLocale();
  const { data, isLoading, error } = useRevenueStats(5);

  if (isLoading) {
    return (
      <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 h-full items-center justify-center min-h-[350px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{t("dashboard.widgets.loadingRevenue")}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 h-full items-center justify-center min-h-[350px]">
        <span className="text-sm text-red-500">{t("dashboard.widgets.failedRevenue")}</span>
      </div>
    );
  }

  // Extract chart data from API response
  const labels = data.monthly_data.map(m => m.month_label);
  const actualSales = data.monthly_data.map(m => m.revenue);
  const productCost = data.monthly_data.map(m => m.cost);
  const currentRevenue = data.current_month_revenue;
  const percentageChange = data.percentage_change;

  // Handle case with no data
  if (data.monthly_data.length === 0) {
    return (
      <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 h-full items-center justify-center min-h-[350px]">
        <span className="text-sm text-muted-foreground">{t("dashboard.widgets.noRevenueData")}</span>
        <span className="text-xs text-muted-foreground">{t("dashboard.widgets.seedOrdersHint")}</span>
      </div>
    );
  }

  return (
    <div className="border border-[#f1f5f9] rounded-[15px] p-6 bg-white flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[18px] font-semibold leading-7 text-black">
          {t("dashboard.widgets.monthlyRevenue")}
        </h3>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[12px]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-[#27272a]" />
            <span className="text-[#27272a]">{t("dashboard.widgets.productCost")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-[#3b82f6]" />
            <span className="text-[#3b82f6]">{t("dashboard.widgets.actualSales")}</span>
          </div>
        </div>
      </div>

      {/* Revenue Display */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1">
          <span className="text-[14px] font-normal leading-6 text-black">
            CNY
          </span>
          <span className="text-[40px] font-bold leading-none text-black tracking-tight">
            ¥{currentRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <p className="text-[14px] font-normal leading-6 text-black">
          {t("dashboard.widgets.actualSales")} {percentageChange >= 0 ? t("dashboard.widgets.increased") : t("dashboard.widgets.decreased")} {Math.abs(percentageChange).toFixed(1)}% {t("dashboard.widgets.fromLastMonth")}
        </p>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[200px]">
        <BarChart
          labels={labels}
          datasets={[
            {
              label: "Overall Product Cost",
              data: productCost,
              backgroundColor: "rgba(39, 39, 42, 0.8)",
              borderColor: "rgb(39, 39, 42)",
              borderWidth: 1,
            },
            {
              label: "Actual Sales",
              data: actualSales,
              backgroundColor: "rgba(59, 130, 246, 0.8)",
              borderColor: "rgb(59, 130, 246)",
              borderWidth: 1,
            },
          ]}
          height={200}
        />
      </div>
    </div>
  );
}
