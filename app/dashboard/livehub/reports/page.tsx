"use client";

import { useState, useRef, useCallback } from "react";
import { GenerateReportSidebar } from "@/components/statistics/GenerateReportSidebar";
import { StatisticsCard } from "@/components/statistics/StatisticsCard";
import { LatencyChart } from "@/components/statistics/LatencyChart";
import {
  ReportFilters,
  ConnectivityStats,
  LatencyStats,
  LatencyDataPoint,
  Platform,
} from "@/lib/types/statistics";
import { Button } from "@/components/ui/button";
import { Download, Printer, Loader2, Package, ShoppingCart, DollarSign, AlertTriangle, TrendingUp, Archive } from "lucide-react";
import { toast } from "sonner";
import { useOrderStats } from "@/lib/hooks/useOrders";
import { useInventoryStats } from "@/lib/hooks/useInventory";
import { useStreamingReports } from "@/lib/hooks/useStreaming";
import { useLocale } from "@/lib/locale-context";
import type { OrderStats } from "@/lib/api/orders";
import type { InventoryStats } from "@/lib/api/inventory";
import type { StreamingReportsResponse } from "@/lib/api/streaming";

const platformColors = {
  douyin: "#000000",
  xiaohongshu: "#ff2442",
  taobao: "#ff6a00",
};

// Format currency
function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Escape CSV cell value
function csvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Build CSV content from report data
function buildReportCSV(
  orderStats: OrderStats | undefined,
  inventoryStats: InventoryStats | undefined,
  streamingReports: StreamingReportsResponse | undefined,
  activeFilters: ReportFilters | null,
): string {
  const lines: string[] = [];
  const dateStr = new Date().toISOString().split("T")[0];

  // Header
  lines.push("SnapLive Report");
  lines.push(`Generated,${dateStr}`);

  if (activeFilters) {
    const platforms = Object.entries(activeFilters.platforms)
      .filter(([, on]) => on)
      .map(([name]) => name);
    if (platforms.length > 0) lines.push(`Platforms,${platforms.join(" / ")}`);
    if (activeFilters.dateTimeRange?.startDate) {
      lines.push(`Date Range,${activeFilters.dateTimeRange.startDate} to ${activeFilters.dateTimeRange.endDate}`);
    }
    if (activeFilters.topics.length > 0) {
      lines.push(`Topics,${activeFilters.topics.join(" / ")}`);
    }
  }

  const selectedTopics = activeFilters?.topics;
  const selectedPlatforms = activeFilters?.platforms;
  const isPlatformSelected = (platform: string) => {
    if (!selectedPlatforms) return true;
    return selectedPlatforms[platform as keyof typeof selectedPlatforms] ?? true;
  };

  // --- Orders (always included — core metrics) ---
  lines.push("");
  lines.push("=== ORDER STATISTICS ===");
  lines.push("Metric,Value");
  lines.push(`Total Orders,${orderStats?.total_orders ?? 0}`);
  lines.push(`Orders Last 30 Days,${orderStats?.orders_last_30_days ?? 0}`);
  lines.push(`Total Revenue,${orderStats?.total_revenue?.toFixed(2) ?? "0.00"}`);
  lines.push(`Average Order Value,${orderStats?.average_order_value?.toFixed(2) ?? "0.00"}`);
  lines.push(`Pending Orders,${orderStats?.pending_orders ?? 0}`);
  lines.push(`Shipped Orders,${orderStats?.shipped_orders ?? 0}`);
  lines.push(`Delivered Orders,${orderStats?.delivered_orders ?? 0}`);
  lines.push(`Cancelled Orders,${orderStats?.cancelled_orders ?? 0}`);

  // Status breakdown
  if (orderStats?.status_counts && Object.keys(orderStats.status_counts).length > 0) {
    lines.push("");
    lines.push("Order Status Breakdown");
    lines.push("Status,Count");
    for (const [status, count] of Object.entries(orderStats.status_counts)) {
      lines.push(`${csvCell(status)},${count}`);
    }
  }

  // Platform breakdown
  if (orderStats?.platform_counts && Object.keys(orderStats.platform_counts).length > 0) {
    lines.push("");
    lines.push("Orders by Platform");
    lines.push("Platform,Count");
    for (const [platform, count] of Object.entries(orderStats.platform_counts)) {
      if (!isPlatformSelected(platform)) continue;
      lines.push(`${csvCell(platform)},${count}`);
    }
  }

  // Daily orders
  if (orderStats?.daily_orders && orderStats.daily_orders.length > 0) {
    lines.push("");
    lines.push("Daily Orders");
    lines.push("Date,Count");
    for (const day of orderStats.daily_orders) {
      lines.push(`${csvCell(day.date)},${day.count}`);
    }
  }

  // --- Inventory (always included — core metrics) ---
  lines.push("");
  lines.push("=== INVENTORY STATISTICS ===");
  lines.push("Metric,Value");
  lines.push(`Total Items,${inventoryStats?.total_items ?? 0}`);
  lines.push(`Total Warehouses,${inventoryStats?.total_warehouses ?? 0}`);
  lines.push(`Total Quantity,${inventoryStats?.total_quantity ?? 0}`);
  lines.push(`Available Quantity,${inventoryStats?.total_available ?? 0}`);
  lines.push(`Reserved Quantity,${inventoryStats?.total_reserved ?? 0}`);
  lines.push(`Low Stock Items,${inventoryStats?.low_stock_count ?? 0}`);
  lines.push(`Critical Stock Items,${inventoryStats?.critical_stock_count ?? 0}`);
  lines.push(`Total Inventory Value,${inventoryStats?.total_value?.toFixed(2) ?? "0.00"}`);

  // Payment status breakdown
  if (orderStats?.payment_status_counts && Object.keys(orderStats.payment_status_counts).length > 0) {
    lines.push("");
    lines.push("Payment Status Breakdown");
    lines.push("Status,Count");
    for (const [status, count] of Object.entries(orderStats.payment_status_counts)) {
      lines.push(`${csvCell(status)},${count}`);
    }
  }

  // --- Connectivity ---
  if (!selectedTopics || selectedTopics.includes("connectivity_reliability")) {
    const connectivity = streamingReports?.connectivity || [];
    const filtered = connectivity.filter((s) => isPlatformSelected(s.platform));

    lines.push("");
    lines.push("=== CONNECTIVITY-RELIABILITY RATE ===");
    lines.push("Platform,Rate (%),Successful Time (h),Scheduled Time (h)");
    for (const stat of filtered) {
      lines.push(
        `${csvCell(stat.platform)},${stat.rate.toFixed(1)},${stat.successfulTime},${stat.scheduledTime}`
      );
    }
    if (filtered.length === 0) {
      lines.push("No connectivity data available");
    }
  }

  // --- Latency ---
  if (!selectedTopics || selectedTopics.includes("avg_latency")) {
    const latency = streamingReports?.latency || [];
    const filtered = latency.filter((s) => isPlatformSelected(s.platform));

    lines.push("");
    lines.push("=== AVERAGE LATENCY ===");
    lines.push("Platform,Average Latency (ms)");
    for (const stat of filtered) {
      lines.push(`${csvCell(stat.platform)},${stat.averageLatency.toFixed(0)}`);
    }

    // Latency data points
    for (const stat of filtered) {
      if (stat.dataPoints && stat.dataPoints.length > 0) {
        lines.push("");
        lines.push(`Latency History - ${stat.platform}`);
        lines.push("Timestamp,Latency (ms)");
        for (const dp of stat.dataPoints) {
          lines.push(`${csvCell(dp.timestamp)},${dp.latency}`);
        }
      }
    }

    if (filtered.length === 0) {
      lines.push("No latency data available");
    }
  }

  return lines.join("\n");
}

// Trigger CSV file download
function downloadCSV(content: string, filename: string) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function StatisticsPage() {
  const { t } = useLocale();
  const [filters, setFilters] = useState<ReportFilters | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Fetch statistics from API
  const { data: orderStats, isLoading: orderStatsLoading } = useOrderStats();
  const { data: inventoryStats, isLoading: inventoryStatsLoading } = useInventoryStats();
  const { data: streamingReports, isLoading: streamingReportsLoading } = useStreamingReports();

  const isLoading = orderStatsLoading || inventoryStatsLoading || streamingReportsLoading;

  const exportCSV = useCallback(
    (activeFilters: ReportFilters | null) => {
      if (isExporting) return;
      setIsExporting(true);
      try {
        const csv = buildReportCSV(orderStats, inventoryStats, streamingReports, activeFilters);
        const dateStr = new Date().toISOString().split("T")[0];
        downloadCSV(csv, `snaplive-report-${dateStr}.csv`);
        toast.success("Report exported as CSV");
      } catch (error) {
        console.error("CSV export failed:", error);
        toast.error("Failed to export report");
      } finally {
        setIsExporting(false);
      }
    },
    [orderStats, inventoryStats, streamingReports, isExporting]
  );

  const handleGenerateReport = (newFilters: ReportFilters) => {
    setFilters(newFilters);
    exportCSV(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(null);
    toast.info("Filters reset");
  };

  const handleDownload = () => {
    exportCSV(filters);
  };

  const handlePrint = () => {
    toast.info("Printing report...");
    window.print();
  };

  return (
    <div className="flex h-full bg-[#f8fafc]">
      {/* Sidebar */}
      <GenerateReportSidebar
        onGenerate={handleGenerateReport}
        onReset={handleResetFilters}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div ref={reportRef} className="p-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-[#27272a] leading-8 tracking-[-0.6px]">
                {t("statistics.title")}{" "}
                <span className="text-[#94a3b8]">{t("statistics.subtitle")}</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Platform Status Indicators */}
              <div className="flex items-center gap-2 mr-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-[#64748b]">{t("livestream.platforms.douyin")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-[#64748b]">{t("livestream.platforms.xiaohongshu")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-[#64748b]">{t("livestream.platforms.taobao")}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isExporting}
                className="h-9 px-3 gap-2 bg-white border-[#cbd5e1] text-[#27272a] hover:bg-[#f8fafc]"
              >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {t("statistics.download")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-9 px-3 gap-2 bg-white border-[#cbd5e1] text-[#27272a] hover:bg-[#f8fafc]"
              >
                <Printer className="h-4 w-4" />
                {t("statistics.print")}
              </Button>
            </div>
          </div>

          {/* Order Statistics Section */}
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#27272a] mb-1">
                {t("statistics.orders.title")}
              </h2>
              <p className="text-sm text-[#64748b]">{t("statistics.orders.subtitle")}</p>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {/* Total Orders */}
                <div className="bg-white rounded-lg p-4 border border-[#e2e8f0] shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b]">{t("statistics.orders.totalOrders")}</p>
                      <p className="text-xl font-bold text-[#27272a]">
                        {orderStats?.total_orders || 0}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#94a3b8]">
                    {t("statistics.orders.last30Days")}: {orderStats?.orders_last_30_days || 0}
                  </p>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-lg p-4 border border-[#e2e8f0] shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b]">{t("statistics.orders.totalRevenue")}</p>
                      <p className="text-xl font-bold text-[#27272a]">
                        {formatCurrency(orderStats?.total_revenue || 0)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#94a3b8]">
                    {t("statistics.orders.avgOrder")}: {formatCurrency(orderStats?.average_order_value || 0)}
                  </p>
                </div>

                {/* Pending Orders */}
                <div className="bg-white rounded-lg p-4 border border-[#e2e8f0] shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b]">{t("statistics.orders.pending")}</p>
                      <p className="text-xl font-bold text-[#27272a]">
                        {orderStats?.pending_orders || 0}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#94a3b8]">
                    {t("statistics.orders.ready")}: {orderStats?.status_counts?.ready || 0}
                  </p>
                </div>

                {/* Shipped Orders */}
                <div className="bg-white rounded-lg p-4 border border-[#e2e8f0] shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b]">{t("statistics.orders.shipped")}</p>
                      <p className="text-xl font-bold text-[#27272a]">
                        {orderStats?.shipped_orders || 0}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#94a3b8]">
                    {t("statistics.orders.delivered")}: {orderStats?.delivered_orders || 0}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Platform Breakdown */}
          {orderStats && orderStats.platform_counts && Object.keys(orderStats.platform_counts).length > 0 && (
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-[#27272a] mb-1">
                  {t("statistics.orders.byPlatform")}
                </h2>
                <p className="text-sm text-[#64748b]">{t("statistics.orders.byPlatformSubtitle")}</p>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(orderStats.platform_counts).map(([platform, count]) => (
                  <div key={platform} className="bg-white rounded-lg p-4 border border-[#e2e8f0] shadow-sm">
                    <p className="text-xs text-[#64748b] capitalize">{platform}</p>
                    <p className="text-xl font-bold text-[#27272a]">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Statistics Section */}
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#27272a] mb-1">
                {t("statistics.inventory.title")}
              </h2>
              <p className="text-sm text-[#64748b]">{t("statistics.inventory.subtitle")}</p>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {/* Total Items */}
                <div className="bg-white rounded-lg p-4 border border-[#e2e8f0] shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Archive className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b]">{t("statistics.inventory.totalItems")}</p>
                      <p className="text-xl font-bold text-[#27272a]">
                        {inventoryStats?.total_items || 0}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#94a3b8]">
                    {t("statistics.inventory.warehouses")}: {inventoryStats?.total_warehouses || 0}
                  </p>
                </div>

                {/* Total Quantity */}
                <div className="bg-white rounded-lg p-4 border border-[#e2e8f0] shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b]">{t("statistics.inventory.totalQuantity")}</p>
                      <p className="text-xl font-bold text-[#27272a]">
                        {(inventoryStats?.total_quantity || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#94a3b8]">
                    {t("statistics.inventory.available")}: {(inventoryStats?.total_available || 0).toLocaleString()}
                  </p>
                </div>

                {/* Low Stock */}
                <div className="bg-white rounded-lg p-4 border border-[#e2e8f0] shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b]">{t("statistics.inventory.lowStock")}</p>
                      <p className="text-xl font-bold text-[#27272a]">
                        {inventoryStats?.low_stock_count || 0}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#94a3b8]">
                    {t("statistics.inventory.critical")}: {inventoryStats?.critical_stock_count || 0}
                  </p>
                </div>

                {/* Total Value */}
                <div className="bg-white rounded-lg p-4 border border-[#e2e8f0] shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b]">{t("statistics.inventory.totalValue")}</p>
                      <p className="text-xl font-bold text-[#27272a]">
                        {formatCurrency(inventoryStats?.total_value || 0)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#94a3b8]">
                    {t("statistics.inventory.reserved")}: {(inventoryStats?.total_reserved || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Connectivity-Reliability Rate Section */}
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#27272a] mb-1">
                {t("statistics.connectivity.title")}
              </h2>
              <p className="text-sm text-[#64748b] mb-2">{t("statistics.connectivity.subtitle")}</p>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                {t("statistics.connectivity.formula")}
              </p>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {(streamingReports?.connectivity || []).map((stat) => (
                  <StatisticsCard
                    key={stat.platform}
                    platform={stat.platform as Platform}
                    title={t("statistics.connectivity.title")}
                    value={stat.rate.toFixed(1)}
                    unit="%"
                    description={`${stat.successfulTime}h ${t("statistics.connectivity.successfulOf")} ${stat.scheduledTime}h ${t("statistics.connectivity.scheduled")}`}
                  />
                ))}
                {(!streamingReports?.connectivity || streamingReports.connectivity.length === 0) && (
                  <div className="col-span-3 text-center py-8 text-gray-400 text-sm">
                    {t("statistics.connectivity.noData")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Average Latency Section */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#27272a] mb-1">
                {t("statistics.latency.title")}
              </h2>
              <p className="text-sm text-[#64748b]">{t("statistics.latency.subtitle")}</p>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6">
                {(streamingReports?.latency || []).map((stat) => (
                  <StatisticsCard
                    key={stat.platform}
                    platform={stat.platform as Platform}
                    title={t("statistics.latency.title")}
                    value={stat.averageLatency.toFixed(0)}
                    unit="ms"
                  >
                    <LatencyChart
                      data={stat.dataPoints}
                      platformColor={platformColors[stat.platform as keyof typeof platformColors] || "#27272a"}
                    />
                  </StatisticsCard>
                ))}
                {(!streamingReports?.latency || streamingReports.latency.length === 0) && (
                  <div className="col-span-3 text-center py-8 text-gray-400 text-sm">
                    {t("statistics.latency.noData")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
